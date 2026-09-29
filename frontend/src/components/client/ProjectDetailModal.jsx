import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ProjectDetailModal = ({ selectedProject, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages = selectedProject ? [
    { url: selectedProject.coverImage },
    ...([...(selectedProject.images || [])].sort((a, b) => a.order - b.order)),
  ] : [];

  const nextImage = () => {
    if (!allImages.length) return;
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    if (!allImages.length) return;
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Keyboard navigation: Escape to close, Left/Right arrows to flip images
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allImages.length, onClose]);

  if (!selectedProject) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-neutral-50 dark:bg-neutral-950 max-w-5xl w-full rounded-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col relative max-h-[90vh] shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 p-2 bg-neutral-900/60 hover:bg-neutral-900 text-white rounded-full transition-colors focus-ring"
          aria-label="Close Project Detail Modal"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Image Slider */}
          <div className="lg:col-span-7 bg-neutral-900 min-h-[300px] sm:min-h-[450px] relative flex items-center justify-center">
            {allImages.length > 0 && (
              <>
                <img
                  src={allImages[activeImageIndex]?.url}
                  alt={`${selectedProject.title} slideshow`}
                  decoding="async"
                  className="w-full h-full object-contain max-h-[60vh] lg:max-h-none transition-opacity duration-200"
                />

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 p-2 bg-neutral-900/50 hover:bg-neutral-900 text-white rounded-full transition-colors focus-ring"
                      aria-label="Previous Image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 p-2 bg-neutral-900/50 hover:bg-neutral-900 text-white rounded-full transition-colors focus-ring"
                      aria-label="Next Image"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Pagination indicator */}
                    <div className="absolute bottom-4 text-xs font-semibold bg-neutral-900/80 text-neutral-300 px-3 py-1 rounded-sm">
                      {activeImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Column: Spec Details */}
          <div className="lg:col-span-5 p-8 overflow-y-auto max-h-[50vh] lg:max-h-[90vh]">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
              {selectedProject.category}
            </span>
            <h2 className="text-3xl font-bold font-display text-neutral-950 dark:text-white mt-1 mb-6">
              {selectedProject.title}
            </h2>

            {/* Specs Table */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-200 dark:border-neutral-800 mb-6 text-sm">
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">Location</span>
                <span className="font-medium text-neutral-900 dark:text-white">{selectedProject.location}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">Client</span>
                <span className="font-medium text-neutral-900 dark:text-white">{selectedProject.clientName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">Completed</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {new Date(selectedProject.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">Area</span>
                <span className="font-medium text-neutral-900 dark:text-white">{selectedProject.area || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">Status</span>
                <span className="inline-block px-2.5 py-0.5 mt-1 text-xs font-bold uppercase tracking-wide rounded" style={{ background: 'rgba(10,37,64,0.1)', color: '#0A2540' }}>
                  {selectedProject.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6 text-sm font-light text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <div>
                <h4 className="text-xs font-bold uppercase text-neutral-950 dark:text-white mb-2">Project Overview</h4>
                <p>{selectedProject.description}</p>
              </div>

              {selectedProject.designChallenge && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-neutral-950 dark:text-white mb-2">The Design Challenge</h4>
                  <p>{selectedProject.designChallenge}</p>
                </div>
              )}

              {selectedProject.solution && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-neutral-950 dark:text-white mb-2">Architectural Solution</h4>
                  <p>{selectedProject.solution}</p>
                </div>
              )}

              {selectedProject.materials && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-neutral-950 dark:text-white mb-2">Material Palette</h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedProject.materials.split(',').map((mat) => (
                      <span
                        key={mat}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded"
                        style={{ background: 'rgba(10,37,64,0.08)', color: '#0A2540' }}
                      >
                        {mat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
