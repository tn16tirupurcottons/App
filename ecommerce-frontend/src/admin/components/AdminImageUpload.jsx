import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, Trash2, Crop } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageCropper from './ImageCropper';
import axiosClient from '../../api/axiosClient';

const CATEGORY_IMAGES = {
  men: 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80',
  women: 'https://images.unsplash.com/photo-1520974735194-1aa2c6faf9ad?auto=format&fit=crop&w=900&q=80',
  kids: 'https://images.unsplash.com/photo-1521336525930-8e8abf541a33?auto=format&fit=crop&w=900&q=80',
  footwear: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
  dresses: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
  ethnic: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',
};

const CATEGORY_KEYWORDS = {
  men: ['men', 'man', 'male', 'boy', 'mens'],
  women: ['women', 'woman', 'female', 'dress', 'gown', 'skirt', 'lehenga', 'sari'],
  kids: ['kid', 'kids', 'child', 'children', 'toddler'],
  footwear: ['shoe', 'sneaker', 'boot', 'sandals', 'heels', 'footwear'],
  dresses: ['dress', 'gown', 'formal', 'party'],
  ethnic: ['ethnic', 'sari', 'lehenga', 'kurti', 'salwar', 'anarkali'],
};

const inferCategoryFromFilename = (filename) => {
  const lower = (filename || '').toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((word) => lower.includes(word))) return category;
  }
  return 'unknown';
};

const matchesCategory = (selected, inferred) => {
  if (!selected || selected === 'all') return true;
  if (!inferred || inferred === 'unknown') return true;
  if (selected === inferred) return true;
  if (selected === 'dresses' && inferred === 'women') return true;
  if (selected === 'women' && inferred === 'dresses') return true;
  return false;
};

const getFallbackImage = (category) => {
  if (!category || category === 'all') return CATEGORY_IMAGES.men;
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.men;
};

const AdminImageUpload = ({
  onUploadComplete,
  maxFiles = 10,
  maxSizeMB = 50,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [croppingImage, setCroppingImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast.error(`File "${file.name}" is too large. Max size: ${maxSizeMB}MB`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`File "${file.name}" has invalid type. Allowed: ${acceptedTypes.join(', ')}`);
        } else {
          toast.error(`File "${file.name}": ${error.message}`);
        }
      });
    });

    // Add accepted files
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Max size: ${maxSizeMB}MB`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = validFiles.map((file) => {
      const inferredCategory = inferCategoryFromFilename(file.name);
      const categoryMatch = matchesCategory(selectedCategory, inferredCategory);
      return {
        file,
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        inferredCategory,
        categoryMatch,
        fallbackUrl: categoryMatch ? null : getFallbackImage(selectedCategory || inferredCategory),
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, [files, maxFiles, maxSizeMB, acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: true,
    noClick: false,
    noKeyboard: false
  });

  const removeFile = (id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const applyFallback = (id) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const fallback = f.fallbackUrl || getFallbackImage(selectedCategory || f.inferredCategory);
        return {
          ...f,
          preview: fallback,
          categoryMatch: true,
          autoReplaced: true,
          warning: false,
        };
      })
    );
  };

  const chooseDifferent = (id) => {
    removeFile(id);
    toast.info('Please upload a different image for category match.');
  };

  const cropImage = (file) => {
    setCroppingImage(file);
  };

  const handleCropComplete = async (croppedAreaPixels) => {
    if (!croppingImage) return;

    try {
      // Create canvas and crop the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        const { width, height, x, y } = croppedAreaPixels;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          const croppedFile = new File([blob], croppingImage.file.name, {
            type: croppingImage.file.type
          });

          // Replace the original file with cropped version
          const croppedPreview = URL.createObjectURL(blob);
          URL.revokeObjectURL(croppingImage.preview);

          setFiles(prev => prev.map(f =>
            f.id === croppingImage.id
              ? { ...f, file: croppedFile, preview: croppedPreview }
              : f
          ));

          setCroppingImage(null);
          toast.success('Image cropped successfully');
        }, croppingImage.file.type);
      };

      img.src = croppingImage.preview;
    } catch (error) {
      console.error('Crop error:', error);
      toast.error('Failed to crop image');
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('No files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      if (files.length === 1) {
        // Single upload
        const formData = new FormData();
        formData.append('image', files[0].file);
        formData.append('category', selectedCategory);

        const response = await axiosClient.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({ [files[0].id]: percent });
          }
        });

        if (response.data.success) {
          toast.success('Image uploaded successfully');
          onUploadComplete?.([response.data.data]);
          // Clear files after successful upload
          files.forEach(f => URL.revokeObjectURL(f.preview));
          setFiles([]);
        }
      } else {
        // Bulk upload
        const formData = new FormData();
        files.forEach((f) => formData.append('images', f.file));
        formData.append('category', selectedCategory);

        const response = await axiosClient.post('/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const progress = {};
            files.forEach(f => progress[f.id] = percent);
            setUploadProgress(progress);
          }
        });

        if (response.data.success) {
          const successfulUploads = response.data.data.filter(item => !item.error);
          toast.success(`${successfulUploads.length} images uploaded successfully`);

          if (successfulUploads.length < files.length) {
            const failedCount = files.length - successfulUploads.length;
            toast.error(`${failedCount} images failed to upload`);
          }

          onUploadComplete?.(successfulUploads);
          // Clear files after successful upload
          files.forEach(f => URL.revokeObjectURL(f.preview));
          setFiles([]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-3">
        <label className="text-sm font-medium text-neutral-700">Selected product category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-2 sm:mt-0 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
          <option value="dresses">Dresses</option>
          <option value="ethnic">Ethnic</option>
          <option value="footwear">Footwear</option>
        </select>
        <span className="mt-2 sm:mt-0 text-xs text-neutral-500">Upload validation is done by category heuristic and backend fallback.</span>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? 'Drop the images here' : 'Drag & drop images here'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to select files
        </p>
        <p className="text-xs text-gray-400">
          Max {maxFiles} files, {maxSizeMB}MB each. Supported: JPG, PNG, WebP, GIF
        </p>
      </div>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium">Selected Images ({files.length})</h4>
            <div className="flex gap-2">
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Clear All
              </button>
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Upload {files.length > 1 ? 'All' : ''}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group border rounded-lg overflow-hidden">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => cropImage(file)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Crop image"
                    >
                      <Crop className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {uploadProgress[file.id] && (
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs p-1 text-center">
                    {uploadProgress[file.id]}%
                  </div>
                )}
                <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </div>
                <div className="absolute top-1 right-1 bg-white/90 text-xs text-neutral-800 px-2 py-0.5 rounded">
                  {file.categoryMatch ? '✅ Match' : '⚠️ Mismatch'}
                </div>
                {!file.categoryMatch && (
                  <div className="absolute inset-x-0 bottom-0 bg-red-50 text-red-700 text-xs p-2 space-y-1">
                    <div>Image does not match <strong>{selectedCategory}</strong>.</div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => applyFallback(file.id)}
                        className="flex-1 text-[10px] font-semibold rounded border border-red-300 bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Replace automatically
                      </button>
                      <button
                        type="button"
                        onClick={() => chooseDifferent(file.id)}
                        className="flex-1 text-[10px] font-semibold rounded border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100"
                      >
                        Upload different
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {croppingImage && (
        <ImageCropper
          imageSrc={croppingImage.preview}
          onCropComplete={handleCropComplete}
          onCancel={() => setCroppingImage(null)}
        />
      )}
    </div>
  );
};

export default AdminImageUpload;