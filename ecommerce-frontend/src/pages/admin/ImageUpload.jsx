import React, { useState } from 'react';
import AdminLayout from '../../admin/components/AdminLayout';
import AdminImageUpload from '../../admin/components/AdminImageUpload';
import { Button } from '../../components/ui/Button';
import { Image as ImageIcon, Upload, Grid, List } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageUpload() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const handleUploadComplete = (images) => {
    setUploadedImages(prev => [...prev, ...images]);
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Image Upload
          </h1>
          <p className="text-gray-600 mt-1">
            Upload and manage product images with cropping and optimization
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Images
          </h2>
          <AdminImageUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Uploaded Images Section */}
        {uploadedImages.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Uploaded Images ({uploadedImages.length})
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="small"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="small"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden group">
                    <div className="aspect-square relative">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                        <button
                          onClick={() => removeUploadedImage(index)}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-opacity"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-600 truncate" title={image.filename}>
                        {image.filename}
                      </p>
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{image.filename}</p>
                      <p className="text-xs text-gray-500">{image.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(image.url)}
                        variant="outline"
                        size="small"
                      >
                        Copy URL
                      </Button>
                      <Button
                        onClick={() => removeUploadedImage(index)}
                        variant="danger"
                        size="small"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button onClick={() => setUploadedImages([])} variant="outline">
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Upload Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Maximum file size: 50MB per image</li>
            <li>• Supported formats: JPG, JPEG, PNG, WebP, GIF</li>
            <li>• Images are automatically optimized and converted to WebP</li>
            <li>• Maximum width: 800px (aspect ratio maintained)</li>
            <li>• Use crop tool to adjust image before uploading</li>
            <li>• Bulk upload up to 20 images at once</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}