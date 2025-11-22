# Free Disk Space - Quick Guide

## Immediate Actions

### 1. Clean npm cache (Already Done ✅)
```bash
npm cache clean --force
```

### 2. Remove node_modules (if needed)
**WARNING**: Only do this if you have enough space to reinstall, or if you can free up space elsewhere first.

```bash
# Backend
cd ecommerce-backend
Remove-Item -Recurse -Force node_modules

# Frontend  
cd ecommerce-frontend
Remove-Item -Recurse -Force node_modules
```

### 3. Clean Windows Temp Files
```powershell
# Clean Windows temp files
Remove-Item -Path $env:TEMP\* -Recurse -Force -ErrorAction SilentlyContinue

# Clean npm cache location
Remove-Item -Path "$env:APPDATA\npm-cache\*" -Recurse -Force -ErrorAction SilentlyContinue
```

### 4. Remove Build/Dist Folders
```bash
# Frontend dist folder (can be regenerated)
cd ecommerce-frontend
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

### 5. Check Disk Space
```powershell
Get-PSDrive C | Select-Object Used,Free
```

## Quick Fix: Minimal Installation

If you need to run the server immediately with minimal dependencies:

1. **Don't delete node_modules yet** - you need them to run
2. **Free up space elsewhere**:
   - Empty Recycle Bin
   - Delete old downloads
   - Clear browser cache
   - Remove unused programs
   - Clean Windows Update files: `Dism.exe /online /Cleanup-Image /StartComponentCleanup /ResetBase`

3. **Once you have space**, the server should start normally

## Alternative: Run Without Reinstalling

If node_modules already exists, you can try running directly:

```bash
cd ecommerce-backend
node server.js
```

This bypasses npm and runs the server directly (if dependencies are already installed).

