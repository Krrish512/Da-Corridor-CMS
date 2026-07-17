import React from 'react';
import { Trash2, RefreshCw, Move, Upload } from 'lucide-react';

const ImagePreview = ({
  value,
  onRemove,
  onReplace,
  multiple = false,
  uploadingFiles = [], // Array of file names currently uploading
}) => {
  // Helper to extract URL string from value
  const getImageUrl = (item) => {
    if (!item) return '';
    return typeof item === 'string' ? item : (item.url || '');
  };

  if (!multiple) {
    const imageUrl = getImageUrl(value);
    if (!imageUrl) return null;

    return (
      <div className="relative group w-full aspect-video rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        />
        
        {/* Glassmorphic Hover Overlay */}
        <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReplace}
            className="px-3 py-1.5 bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white rounded-md text-xs font-bold shadow hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-bold shadow hover:bg-rose-700 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      </div>
    );
  }

  // Multiple files mode
  const items = Array.isArray(value) ? value : [];

  if (items.length === 0 && uploadingFiles.length === 0) return null;

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b pb-2 dark:border-neutral-800">
        <span>Uploaded Files ({items.length})</span>
        {items.length > 1 && (
          <span className="text-amber-500 flex items-center gap-1 text-[9px] uppercase">
            <Move className="w-3 h-3" /> Reordering placeholder (Drag enabled)
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Render existing images */}
        {items.map((item, idx) => {
          const url = getImageUrl(item);
          return (
            <div
              key={idx}
              className="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-sm"
            >
              <img
                src={url}
                alt={`Gallery preview ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-102"
              />
              
              {/* Thumbnail Action Overlay */}
              <div className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                {/* Drag handle decoration */}
                <div className="cursor-move p-1 text-white/70 hover:text-white" title="Drag to reorder (placeholder)">
                  <Move className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Order indicator badge */}
              <div className="absolute bottom-2 left-2 bg-neutral-900/60 dark:bg-neutral-950/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                #{idx + 1}
              </div>
            </div>
          );
        })}

        {/* Render items that are currently uploading */}
        {uploadingFiles.map((fileName, idx) => (
          <div
            key={`uploading-${idx}`}
            className="relative aspect-square rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center p-3 text-center space-y-2"
          >
            <RefreshCw className="w-5 h-5 text-accent animate-spin" />
            <span className="text-[9px] text-neutral-400 font-medium truncate max-w-full">
              {fileName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
