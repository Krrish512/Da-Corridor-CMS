import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, MapPin, Calendar, X, ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react';

import api from '../../utils/api';

const Portfolio = () => {
  // Query Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6;

  // Selected project for modal/overlay detail
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Categories list
  const categories = ['All', 'Residential', 'Commercial', 'Institutional', 'Interior', 'Landscape'];

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['publicProjects', search, category, page],
    queryFn: () =>
      api
        .get('/portfolio', {
          params: {
            search,
            category: category === 'All' ? '' : category,
            page,
            limit
          },
        })
        .then((res) => res.data),
  });

  const handleOpenDetail = (project) => {
    setSelectedProject(project);
    setActiveImageIndex(0); // reset
  };

  const handleCloseDetail = () => {
    setSelectedProject(null);
  };

  const nextImage = () => {
    if (!selectedProject || !selectedProject.images.length) return;
    setActiveImageIndex((prev) => (prev + 1) % selectedProject.images.length);
  };

  const prevImage = () => {
    if (!selectedProject || !selectedProject.images.length) return;
    setActiveImageIndex((prev) => (prev - 1 + selectedProject.images.length) % selectedProject.images.length);
  };

  const allImages = selectedProject
    ? [{ url: selectedProject.coverImage }, ...([...selectedProject.images].sort((a, b) => a.order - b.order))]
    : [];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
          Case Studies
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display text-neutral-950 dark:text-white mt-2">
          Project Portfolio
        </h1>
        <div className="w-10 h-0.5 mx-auto mt-4" style={{ background: '#D4AF37' }} />
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all ${(category === cat || (cat === 'All' && !category))
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects by title, material, location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all text-neutral-900 dark:text-white"
          />
        </div>
      </div>

      {/* LOADER */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
        </div>
      ) : !projectsData?.data || projectsData.data.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm">
          <p className="text-neutral-400 dark:text-neutral-500 text-sm">No projects found matching the criteria.</p>
        </div>
      ) : (
        <>
          {/* PROJECTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectsData.data.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpenDetail(project)}
                className="group cursor-pointer border border-neutral-200 dark:border-neutral-850 rounded-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute right-4 bottom-4 p-2 bg-neutral-900/80 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 size={16} />
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-400">
                      {project.category}
                    </span>
                    <h2 className="text-xl font-bold font-display text-neutral-950 dark:text-white mt-1 mb-3">
                      {project.title}
                    </h2>
                    <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-light">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {project.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {new Date(project.completionDate).getFullYear()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {projectsData.meta?.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium">
                Page {page} of {projectsData.meta?.totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, projectsData.meta.totalPages))}
                disabled={page === projectsData.meta?.totalPages}
                className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* DETAIL MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={handleCloseDetail}>
          <div
            className="bg-neutral-50 dark:bg-neutral-950 max-w-5xl w-full rounded-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col relative max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseDetail}
              className="absolute right-4 top-4 z-30 p-2 bg-neutral-900/60 hover:bg-neutral-900 text-white rounded-full transition-colors"
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
                      className="w-full h-full object-contain max-h-[60vh] lg:max-h-none"
                    />

                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 p-2 bg-neutral-900/50 hover:bg-neutral-900 text-white rounded-full transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 p-2 bg-neutral-900/50 hover:bg-neutral-900 text-white rounded-full transition-colors"
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
                            className="text-[10px] font-semibold px-2.5 py-1 rounded" style={{ background: 'rgba(10,37,64,0.08)', color: '#0A2540' }}
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
      )}
    </div>
  );
};

export default Portfolio;
