import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';

import { useToast } from '../context/ToastContext';
import api from '../utils/api';

import { StatusBadge } from '../components/cms/StatusBadge';
import { useAuth } from '../context/AuthContext';
import MediaPicker from '../components/ui/media/MediaPicker';
import DynamicIcon from '../components/ui/DynamicIcon';
import { SERVICE_ICON_LIST } from '../utils/serviceIcons';

const Services = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Form State
  const initialFormState = {
    title: '',
    icon: 'Home',
    shortDescription: '',
    fullDescription: '',
    image: '',
    displayOrder: 0,
    isActive: true,
    publishingStatus: currentUser?.role === 'CO_ADMIN' ? 'PENDING_APPROVAL' : 'PUBLISHED',
    scheduledPublishAt: '',
    scheduledUnpublishAt: '',
  };
  const [form, setForm] = useState(initialFormState);

  // Escape key handler for dialog
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }
    };
    if (modalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

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
      ...initialFormState,
      displayOrder: (services?.length || 0) + 1,
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
      publishingStatus: service.publishingStatus || 'PUBLISHED',
      scheduledPublishAt: service.scheduledPublishAt ? new Date(service.scheduledPublishAt).toISOString().slice(0, 16) : '',
      scheduledUnpublishAt: service.scheduledUnpublishAt ? new Date(service.scheduledUnpublishAt).toISOString().slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.shortDescription?.trim() || !form.fullDescription?.trim()) {
      addToast('Please fill out service Title, Short Description, and Full Description.', 'error');
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 py-1 px-2.5 rounded font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <DynamicIcon name={service.icon} size={14} className="text-neutral-700 dark:text-neutral-300" />
                      {service.icon}
                    </span>
                    <StatusBadge status={service.publishingStatus} scheduledPublishAt={service.scheduledPublishAt} />
                  </div>
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

                <h3 className="text-sm font-bold flex items-center justify-between gap-2">
                  <span>{service.title}</span>
                  {currentUser?.role !== 'CO_ADMIN' && service.publishingStatus === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => saveMutation.mutate({ ...service, publishingStatus: 'PUBLISHED' })}
                      className="px-2 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200"
                    >
                      Approve & Publish
                    </button>
                  )}
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-premium-lg animate-scale-in"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {editingService ? 'Edit Studio Service' : 'New Studio Service'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded focus-ring"
                aria-label="Close dialog"
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
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 focus-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Service Icon</label>
                <div className="flex items-center gap-2">
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 focus-ring"
                  >
                    {SERVICE_ICON_LIST.map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                  <div className="h-8 w-8 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
                    <DynamicIcon name={form.icon} size={16} className="text-neutral-900 dark:text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-3">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Service Cover Image</label>
                <MediaPicker
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  multiple={false}
                  outputFormat="url"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs focus-ring"
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
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs focus-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Full Description (Details)</label>
              <textarea
                rows={3}
                value={form.fullDescription}
                onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                placeholder="Detailing our complete services scope..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs resize-none focus-ring"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded text-neutral-900 focus:ring-neutral-900 focus-ring"
              />
              <label htmlFor="isActive" className="text-xs text-neutral-500 font-semibold select-none">
                Service Active Status (Show on website)
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 border rounded text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus-ring"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all focus-ring"
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
