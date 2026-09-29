import React, { useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, MapPin, Calendar, ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react';

import api from '../../utils/api';
import SEO from '../../components/common/SEO';

const ProjectDetailModal = lazy(() => import('../../components/client/ProjectDetailModal'));

const Portfolio = () => {
  // Query Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6;

  // Selected project for modal/overlay detail
  const [selectedProject, setSelectedProject] = useState(null);

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
    staleTime: 1000 * 60 * 5,
  });

  const handleOpenDetail = (project) => {
    setSelectedProject(project);
  };

  const handleCloseDetail = () => {
    setSelectedProject(null);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SEO
        title="Project Portfolio & Case Studies"
        description="Browse selected residential, commercial, institutional, and interior design project case studies by Da' Corridor."
        path="/portfolio"
      />
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
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all focus-ring ${(category === cat || (cat === 'All' && !category))
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
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all text-neutral-900 dark:text-white focus-ring"
          />
        </div>
      </div>

      {/* LOADER / SKELETON */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(6).fill(0).map((_, idx) => (
            <div
              key={idx}
              className="border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden flex flex-col justify-between bg-white dark:bg-neutral-900/10"
            >
              <div>
                <div className="aspect-[4/3] w-full arch-skeleton" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-20 arch-skeleton" />
                  <div className="h-6 w-3/4 arch-skeleton" />
                  <div className="h-4 w-full arch-skeleton" />
                  <div className="h-4 w-2/3 arch-skeleton" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between">
                <div className="h-3 w-24 arch-skeleton" />
                <div className="h-3 w-16 arch-skeleton" />
              </div>
            </div>
          ))}
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
                role="button"
                tabIndex={0}
                onClick={() => handleOpenDetail(project)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenDetail(project);
                  }
                }}
                className="group cursor-pointer border border-neutral-200 dark:border-neutral-850 rounded-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 focus-ring"
                aria-label={`View details for ${project.title}`}
              >
                <div>
                  <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
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
                className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40 transition-colors focus-ring"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium">
                Page {page} of {projectsData.meta?.totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, projectsData.meta.totalPages))}
                disabled={page === projectsData.meta?.totalPages}
                className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40 transition-colors focus-ring"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* DETAIL MODAL */}
      <Suspense fallback={null}>
        {selectedProject && (
          <ProjectDetailModal selectedProject={selectedProject} onClose={handleCloseDetail} />
        )}
      </Suspense>
    </div>
  );
};

export default Portfolio;
