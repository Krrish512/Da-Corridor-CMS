import React, { useState, useRef } from 'react';
import api from '../../../utils/api';
import UploadDropzone from './UploadDropzone';
import ImagePreview from './ImagePreview';
import { useToast } from '../../../context/ToastContext';

const MediaPicker = ({
  value,
  onChange,
  multiple = false,
  outputFormat,
}) => {
  if (!outputFormat) {
    throw new Error(
      `[MediaPicker]: The "outputFormat" prop is mandatory. Please explicitly specify "url" or "object".`
    );
  }

  if (outputFormat !== 'url' && outputFormat !== 'object') {
    throw new Error(
      `[MediaPicker]: Invalid "outputFormat" prop: "${outputFormat}". It must be explicitly set to either "url" or "object".`
    );
  }

  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState([]);

  // File validation helper
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        reason: `Only JPG, JPEG, PNG, WEBP, and GIF images are allowed. Rejected: "${file.name}"`,
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        reason: `File size exceeds the 10MB limit. Rejected: "${file.name}" (Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      };
    }

    return { isValid: true };
  };

  // Upload a single file to backend API
  const uploadFile = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'Portfolio');
    formData.append('folder', multiple ? 'gallery' : 'cover');

    const response = await api.post('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data.url; // Returns '/uploads/filename.ext'
  };

  // Handle single/multiple file uploads
  const handleFiles = async (files) => {
    setError('');
    
    if (files.length === 0) return;

    if (!multiple) {
      const file = files[0];
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.reason);
        addToast(validation.reason, 'error');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const url = await uploadFile(file, (progress) => {
          setUploadProgress(progress);
        });
        onChange(url);
        addToast('Cover image uploaded successfully!', 'success');
      } catch (err) {
        console.error('[MEDIA_PICKER_UPLOAD_ERROR]:', err);
        const errMsg = err.response?.data?.message || 'Failed to upload image. Please try again.';
        setError(errMsg);
        addToast(errMsg, 'error');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // Multiple mode
      const validFiles = [];
      const errors = [];

      for (const file of files) {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else {
          errors.push(validation.reason);
        }
      }

      if (errors.length > 0) {
        setError(errors[0]);
        errors.forEach(err => addToast(err, 'error'));
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);
      setUploadProgress(0);
      setUploadingFiles(validFiles.map(f => f.name));

      const uploadedUrls = [];
      let completedCount = 0;

      try {
        // Upload valid files in sequence to display progress updates smoothly
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          const url = await uploadFile(file, (progress) => {
            // Overall progress calculation
            const baseProgress = (completedCount / validFiles.length) * 100;
            const fileProgress = progress / validFiles.length;
            setUploadProgress(Math.round(baseProgress + fileProgress));
          });
          uploadedUrls.push(url);
          completedCount++;
          setUploadingFiles(prev => prev.filter(name => name !== file.name));
        }

        // Incorporate new uploaded URLs into the gallery list state
        // Existing values can be array of strings or array of objects with url key
        const currentItems = Array.isArray(value) ? value : [];
        const isObjectFormat = outputFormat === 'object';

        const newItems = uploadedUrls.map((url, idx) => {
          if (isObjectFormat) {
            return {
              url,
              order: currentItems.length + idx,
            };
          }
          return url;
        });

        onChange([...currentItems, ...newItems]);
        addToast(`Successfully uploaded ${uploadedUrls.length} image(s)!`, 'success');
      } catch (err) {
        console.error('[MEDIA_PICKER_MULTI_UPLOAD_ERROR]:', err);
        const errMsg = err.response?.data?.message || 'Failed to upload one or more files.';
        setError(errMsg);
        addToast(errMsg, 'error');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadingFiles([]);
      }
    }
  };

  const triggerBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  // Remove single image or index from multiple
  const handleRemove = (index) => {
    if (!multiple) {
      onChange('');
      addToast('Cover image removed.', 'info');
    } else {
      const currentItems = Array.isArray(value) ? value : [];
      const updatedItems = currentItems
        .filter((_, idx) => idx !== index)
        .map((item, idx) => {
          if (outputFormat === 'object') {
            const url = typeof item === 'object' ? item.url : item;
            return {
              ...(typeof item === 'object' ? item : {}),
              url,
              order: idx,
            };
          }
          return typeof item === 'object' ? item.url : item;
        });
      onChange(updatedItems);
      addToast('Image removed from gallery.', 'info');
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Dropzone only shown if not uploaded yet (single) or always shown (multiple) to allow adding more */}
      {(!multiple && !value) || multiple ? (
        <UploadDropzone
          onFileSelect={handleFiles}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          error={error}
          multiple={multiple}
        />
      ) : null}

      {/* Previews */}
      <ImagePreview
        value={value}
        multiple={multiple}
        onRemove={handleRemove}
        onReplace={triggerBrowse}
        uploadingFiles={uploadingFiles}
      />
    </div>
  );
};

export default MediaPicker;
