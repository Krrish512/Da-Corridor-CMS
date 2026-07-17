import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Plus, Edit2, Trash2, ArrowLeft, Save, Star, MapPin,
  ChevronLeft, ChevronRight
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import MediaPicker from '../components/ui/media/MediaPicker';
import { validateImageUrl, validateImagesList } from '../utils/validation';

const Portfolio = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // View state: 'list' | 'create' | 'edit'
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [featured, setFeatured] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6;

  // Form State (initially blank)
  const initialFormState = {
    title: '',
    slug: '',
    category: 'Residential',
    coverImage: '',
    images: [], // List of { url: '', order: 0 }
    clientName: '',
    location: '',
    area: '',
    completionDate: '',
    status: 'Completed',
    description: '',
    designChallenge: '',
    solution: '',
    materials: '',
    featured: false,
    seoTitle: '',
    seoDescription: '',
  };
  const [form, setForm] = useState(initialFormState);

  // ----------------------------------------------------
  // QUERIES
  // ----------------------------------------------------
  const { data: projectsData, isLoading, isError } = useQuery({
    queryKey: ['projects', search, category, status, featured, page],
    queryFn: () =>
      api
        .get('/portfolio', {
          params: { search, category, status, featured, page, limit },
        })
        .then((res) => res.data),
  });

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (view === 'edit') return api.put(`/portfolio/${editingId}`, data);
      return api.post('/portfolio', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['publicProjects']);
      queryClient.invalidateQueries(['publicFeaturedProjects']);
      setView('list');
      addToast('Project saved successfully!', 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Failed to save project.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/portfolio/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['publicProjects']);
      queryClient.invalidateQueries(['publicFeaturedProjects']);
      addToast('Project deleted.', 'success');
    },
    onError: () => addToast('Failed to delete project.', 'error'),
  });

  // Action Handlers
  const handleOpenAdd = () => {
    setForm(initialFormState);
    setView('create');
  };

  const handleOpenEdit = async (project) => {
    setEditingId(project.id);
    
    // Format date string for standard date inputs
    const formattedDate = project.completionDate
      ? new Date(project.completionDate).toISOString().split('T')[0]
      : '';

    setForm({
      title: project.title,
      slug: project.slug,
      category: project.category,
      coverImage: project.coverImage,
      images: project.images ? project.images.map(img => ({ id: img.id, url: img.url, order: img.order })) : [],
      clientName: project.clientName,
      location: project.location,
      area: project.area,
      completionDate: formattedDate,
      status: project.status,
      description: project.description,
      designChallenge: project.designChallenge,
      solution: project.solution,
      materials: project.materials,
      featured: project.featured,
      seoTitle: project.seoTitle || '',
      seoDescription: project.seoDescription || '',
    });
    setView('edit');
  };


  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.coverImage || !form.clientName) {
      addToast('Please fill out Title, Cover Image, and Client name.', 'error');
      return;
    }

    // Validate Cover Image URL
    const coverVal = validateImageUrl(form.coverImage);
    if (!coverVal.isValid) {
      addToast(`Cover Image: ${coverVal.reason}`, 'error');
      return;
    }

    // Validate Gallery Image URLs
    const galleryVal = validateImagesList(form.images);
    if (!galleryVal.isValid) {
      addToast(`Gallery Image: ${galleryVal.reason}`, 'error');
      return;
    }

    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-8 animate-slide-in select-none">
      {/* ----------------------------------------------------
          LISTING VIEW
         ---------------------------------------------------- */}
      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-display font-bold tracking-tight">Portfolio Registry</h1>
              <p className="text-xs text-neutral-400">Review, add, and filter the architectural portfolios displayed on the site.</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>

          {/* Filtering Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg shadow-premium">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md py-1.5 pl-9 pr-3 text-xs focus:outline-none"
              />
            </div>

            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="bg-neutral-50 dark:bg-neutral-800 border rounded-md py-1.5 px-3 text-xs text-neutral-500 font-semibold"
            >
              <option value="">All Categories</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Landscape">Landscape</option>
              <option value="Interior">Interior</option>
            </select>

            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-neutral-50 dark:bg-neutral-800 border rounded-md py-1.5 px-3 text-xs text-neutral-500 font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Concept">Concept</option>
            </select>

            <select
              value={featured}
              onChange={(e) => { setFeatured(e.target.value); setPage(1); }}
              className="bg-neutral-50 dark:bg-neutral-800 border rounded-md py-1.5 px-3 text-xs text-neutral-500 font-semibold"
            >
              <option value="">Featured Status</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured</option>
            </select>
          </div>

          {/* List Table */}
          {isLoading ? (
            <div className="h-10 w-full bg-neutral-100 animate-pulse rounded" />
          ) : isError ? (
            <div className="text-rose-500 text-xs font-semibold">Error loading projects.</div>
          ) : projectsData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-premium overflow-hidden">
                <table className="w-full text-left text-xs divide-y divide-neutral-100 dark:divide-neutral-850">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900/60 font-bold text-neutral-400">
                      <th className="p-3.5">Cover</th>
                      <th className="p-3.5">Project Title</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Client & Location</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                    {projectsData.data.map((proj) => (
                      <tr key={proj.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/10">
                        <td className="p-3.5">
                          <img
                            src={proj.coverImage}
                            alt={proj.title}
                            className="w-10 h-10 object-cover rounded border"
                          />
                        </td>
                        <td className="p-3.5 font-bold">
                          <div className="flex items-center gap-1.5">
                            {proj.title}
                            {proj.featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-semibold block mt-0.5">/{proj.slug}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-neutral-600 dark:text-neutral-400">{proj.category}</td>
                        <td className="p-3.5">
                          <div className="text-neutral-800 dark:text-neutral-200 font-medium">{proj.clientName}</div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-0.5 mt-0.5"><MapPin className="w-3 h-3" /> {proj.location}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wider uppercase ${
                            proj.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : proj.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => handleOpenEdit(proj)}
                            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete project "${proj.title}"?`)) {
                                deleteMutation.mutate(proj.id);
                              }
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {projectsData.meta?.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-850 pt-4">
                  <span className="text-xs text-neutral-400">
                    Page <strong>{page}</strong> of {projectsData.meta?.totalPages} ({projectsData.meta?.total} projects total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="px-2.5 py-1.5 border rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <button
                      disabled={page === projectsData.meta?.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="px-2.5 py-1.5 border rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 flex items-center gap-1 text-[11px] font-bold"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed rounded-lg py-12 text-center text-neutral-400 text-xs">
              No matching architecture projects found. Add one!
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          CREATOR & EDITOR CANVAS (FULL SCREEN FORM VIEW)
         ---------------------------------------------------- */}
      {(view === 'create' || view === 'edit') && (
        <form onSubmit={handleFormSubmit} className="space-y-6 max-w-4xl animate-slide-in">
          {/* Form Header */}
          <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-850 pb-4">
            <button
              type="button"
              onClick={() => setView('list')}
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Cancel & Return
            </button>
            
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Saving Project...' : 'Save & Publish'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Columns */}
            <div className="md:col-span-2 space-y-6">
              {/* Card 1: Core Fields */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg shadow-premium space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b">Core Project Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase">Project Title</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. The Monolith Pavilion"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase">URL Slug (leave empty to auto-generate)</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="the-monolith-pavilion"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2 text-xs"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Landscape">Landscape</option>
                      <option value="Interior">Interior</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase font-sans">Cover Image</label>
                    <MediaPicker
                      value={form.coverImage}
                      onChange={(url) => setForm({ ...form, coverImage: url })}
                      outputFormat="url"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs resize-none"
                  />
                </div>
              </div>

              {/* Card 2: Narrative details */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg shadow-premium space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b">Design Narratives & Engineering</h3>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Design Challenge</label>
                  <textarea
                    rows={3}
                    value={form.designChallenge}
                    onChange={(e) => setForm({ ...form, designChallenge: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Engineered Solution</label>
                  <textarea
                    rows={3}
                    value={form.solution}
                    onChange={(e) => setForm({ ...form, solution: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Materials Used (comma-separated)</label>
                  <input
                    type="text"
                    value={form.materials}
                    onChange={(e) => setForm({ ...form, materials: e.target.value })}
                    placeholder="Reinforced Concrete, Low-Iron Structural Glass"
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Card 3: Multi Image Sorting */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg shadow-premium space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b">Project Gallery Images</h3>
                
                <MediaPicker
                  value={form.images}
                  onChange={(val) => setForm({ ...form, images: val })}
                  multiple={true}
                  outputFormat="object"
                />
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Card 4: Project Parameters */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg shadow-premium space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b">Project Attributes</h3>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Client Name</label>
                  <input
                    type="text"
                    required
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Project Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Hudson Valley, NY"
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Total Area (sq ft)</label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="4,500 sq.ft."
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Completion Date</label>
                  <input
                    type="date"
                    value={form.completionDate}
                    onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2 text-xs text-neutral-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Construction Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2 text-xs"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Concept">Concept</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <label htmlFor="featured" className="text-xs text-neutral-500 font-bold select-none">
                    Feature Project (Pins to home page)
                  </label>
                </div>
              </div>

              {/* Card 5: SEO Parameters */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg shadow-premium space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b">Project SEO Target</h3>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">SEO Page Title</label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">SEO Meta Description</label>
                  <textarea
                    rows={3}
                    value={form.seoDescription}
                    onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Portfolio;
