
import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, RefreshCw } from 'lucide-react';

const UploadDropzone = ({
  onFileSelect,
  isUploading,
  uploadProgress,
  error,
  multiple = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiple) {
        onFileSelect(Array.from(e.dataTransfer.files));
      } else {
        onFileSelect([e.dataTransfer.files[0]]);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        onFileSelect(Array.from(e.target.files));
      } else {
        onFileSelect([e.target.files[0]]);
      }
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={isUploading ? undefined : onButtonClick}
      className={`relative flex flex-col items-center justify-center w-full min-h-[160px] p-6 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer text-center select-none
        ${isDragActive
          ? 'border-accent bg-accent/5 dark:bg-accent/10 scale-[1.01]'
          : 'border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30'
        }
        ${isUploading ? 'pointer-events-none opacity-85' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center space-y-3 w-full">
          <div className="relative flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-accent animate-spin" />
          </div>
          <div className="w-full max-w-xs space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Drag & drop image here, or <span className="text-accent hover:underline">browse</span>
            </p>
            <p className="text-[10px] text-neutral-400 font-medium">
              Supports JPG, JPEG, PNG, WEBP, GIF up to 10MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-2 left-0 right-0 px-4 flex items-center justify-center gap-1.5 text-rose-500 text-[10px] font-bold tracking-wide uppercase">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate max-w-full">{error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadDropzone;
