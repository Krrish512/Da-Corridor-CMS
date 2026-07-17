import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';

import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const Services = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    icon: 'Home',
    shortDescription: '',
    fullDescription: '',
    image: '',
    displayOrder: 0,
    isActive: true,
  });

  // ----------------------------------------------------
  // QUERY
  // ----------------------------------------------------
  const { data: services, isLoading, isError } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.get('/services').then((res) => res.data),
  });

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) return api.put(`/services/${data.id}`, data);
      return api.post('/services', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      queryClient.invalidateQueries(['publicServicesHome']);
      queryClient.invalidateQueries(['publicServicesPage']);
      setModalOpen(false);
      setEditingService(null);
      addToast('Service details saved successfully!', 'success');
    },
    onError: () => addToast('Failed to save service.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      queryClient.invalidateQueries(['publicServicesHome']);
      queryClient.invalidateQueries(['publicServicesPage']);
      addToast('Service deleted successfully.', 'success');
    },
    onError: () => addToast('Failed to delete service.', 'error'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (service) => api.put(`/services/${service.id}`, { ...service, isActive: !service.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      queryClient.invalidateQueries(['publicServicesHome']);
      queryClient.invalidateQueries(['publicServicesPage']);
      addToast('Service visibility toggled.', 'success');
    },
  });

  // Handlers
  const handleOpenAdd = () => {
    setEditingService(null);
    setForm({
      title: '',
      icon: 'Home',
      shortDescription: '',
      fullDescription: '',
      image: '',
      displayOrder: (services?.length || 0) + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setForm({
      title: service.title,
      icon: service.icon,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      image: service.image || '',
      displayOrder: service.displayOrder,
      isActive: service.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.shortDescription) {
      addToast('Please fill out service Title and Short Description.', 'error');
      return;
    }

        saveMutation.mutate(editingService ? { ...form, id: editingService.id } : form);
  };

  if (isLoading) {
    return <div className="h-6 w-12 bg-neutral-200 animate-pulse rounded" />;
  }

  if (isError) {
    return <div className="text-rose-500 text-xs font-semibold p-4">Error loading services.</div>;
  }

  return (
    <div className="space-y-8 animate-slide-in select-none max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-display font-bold tracking-tight">Practice Services</h1>
          <p className="text-xs text-neutral-400">Define the architectural and planning services offered by your studio.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-3 py-2 rounded-md text-xs font-bold flex items-center gap-1 shadow"
        >
          <Plus className="w-3.5 h-3.5" /> Add Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services && services.length > 0 ? (
          services.map((service) => (
            <div
              key={service.id}
              className={`bg-white dark:bg-neutral-900 border rounded-lg p-6 shadow-premium flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-all ${
                !service.isActive ? 'opacity-65 border-dashed' : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 py-1 px-2.5 rounded font-mono uppercase tracking-wider">
                    {service.icon}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-neutral-400 mr-2 uppercase">Order: {service.displayOrder}</span>
                    <button
                      onClick={() => toggleActiveMutation.mutate(service)}
                      title={service.isActive ? 'Deactivate' : 'Activate'}
                      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 p-1"
                    >
                      {service.isActive ? <ToggleRight className="w-6 h-6 text-neutral-900 dark:text-white" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold flex items-center gap-2">
                  {service.title}
                  {!service.isActive && <span className="text-[8px] bg-neutral-100 text-neutral-500 py-0.5 px-1 rounded uppercase font-bold tracking-widest">Inactive</span>}
                </h3>
                
                <p className="text-xs text-neutral-800 dark:text-neutral-300 font-semibold mt-3 italic">
                  "{service.shortDescription}"
                </p>

                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  {service.fullDescription}
                </p>

                {service.image && (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-32 object-cover rounded-md mt-4 border border-neutral-100 dark:border-neutral-850"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 mt-6 pt-3">
                <button
                  onClick={() => handleOpenEdit(service)}
                  className="px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[11px] font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete service "${service.title}"?`)) {
                      deleteMutation.mutate(service.id);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-neutral-400 text-[11px] font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 border border-dashed rounded-lg p-12 text-center text-neutral-400 text-xs">
            No service records listed. Click 'Add Service' to create one.
          </div>
        )}
      </div>

      {/* SERVICE DIALOG */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-premium-lg animate-slide-in"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {editingService ? 'Edit Studio Service' : 'New Studio Service'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Service Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Residential Design"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Icon String</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="Home, Briefcase, Maximize"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-3">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Service Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Short Description (Slogan)</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="High-end private residential spatial engineering."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Full Description (Details)</label>
              <textarea
                rows={3}
                value={form.fullDescription}
                onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                placeholder="Detailing our complete services scope..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded text-neutral-900 focus:ring-neutral-900"
              />
              <label htmlFor="isActive" className="text-xs text-neutral-500 font-semibold select-none">
                Service Active Status (Show on website)
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 border rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Services;
