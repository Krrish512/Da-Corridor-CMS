
import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, RefreshCw } from 'lucide-react';

const UploadDropzone = ({
  onFileSelect,
  isUploading,
  uploadProgress,
  error,
  multiple = false,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  acceptedFormatsText,
  maxSizeMB = 10,
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
      const filesArray = Array.from(e.target.files);
      e.target.value = '';
      if (multiple) {
        onFileSelect(filesArray);
      } else {
        onFileSelect([filesArray[0]]);
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
      className={`group relative flex flex-col items-center justify-center w-full min-h-[130px] p-5 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer text-center select-none
        ${isDragActive
          ? 'border-[#D4AF37] bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 scale-[1.005]'
          : 'border-neutral-200 dark:border-neutral-700/60 hover:border-[#D4AF37]/60 dark:hover:border-[#D4AF37]/60 bg-neutral-50/70 dark:bg-neutral-900/40 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/60'
        }
        ${isUploading ? 'pointer-events-none opacity-85' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center space-y-3 w-full">
          <div className="relative flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
          </div>
          <div className="w-full max-w-xs space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#D4AF37] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-1.5">
          <div className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover:text-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-colors">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
              Drag & Drop an image here
            </p>
            <p className="text-[11px] text-neutral-400 font-normal">
              or <span className="text-[#D4AF37] font-semibold hover:underline">click to browse</span>
            </p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal pt-1">
              {acceptedFormatsText || `Supports JPG, JPEG, PNG, WEBP, GIF up to ${maxSizeMB}MB`}
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
