import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings, MapPin, Save, Globe, ToggleLeft, ToggleRight
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import api from '../utils/api';

// Derive which tab to show from the current URL path
const getTabFromPath = (pathname) => {
  const segment = pathname.split('/').pop();
  if (segment === 'seo') return 'seo';
  if (segment === 'settings') return 'system';
  return 'office';
};

const SettingsSEO = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab navigation state: 'office' | 'system' | 'seo'
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  // Sync tab when navigating between these routes
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const [websiteLogo, setWebsiteLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [ogImage, setOgImage] = useState('');

  // ----------------------------------------------------
  // QUERIES
  // ----------------------------------------------------
  const { data: detailsData, isLoading: detailsLoading } = useQuery({
    queryKey: ['contactDetails'],
    queryFn: () => api.get('/contact/details').then(res => res.data),
  });

  const { data: systemData, isLoading: systemLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: () => api.get('/settings').then(res => res.data),
  });

  const { data: seoData, isLoading: seoLoading } = useQuery({
    queryKey: ['seoSettings'],
    queryFn: () => api.get('/seo').then(res => res.data),
  });

  useEffect(() => {
    if (systemData?.websiteLogo) {
      setWebsiteLogo(systemData.websiteLogo);
    }
    if (systemData?.favicon) {
      setFavicon(systemData.favicon);
    }
  }, [systemData]);

  useEffect(() => {
    if (seoData?.ogImage) {
      setOgImage(seoData.ogImage);
    }
  }, [seoData]);

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  const saveDetailsMutation = useMutation({
    mutationFn: (data) => api.put('/contact/details', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contactDetails']);
      queryClient.invalidateQueries(['publicContactInfo']);
      addToast('Office contact details saved successfully!', 'success');
    },
    onError: () => addToast('Failed to save office details.', 'error')
  });

  const saveSystemMutation = useMutation({
    mutationFn: (data) => api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['systemSettings']);
      queryClient.invalidateQueries(['publicSystemSettings']);
      addToast('System configuration saved!', 'success');
    },
    onError: () => addToast('Failed to save system settings.', 'error')
  });

  const saveSeoMutation = useMutation({
    mutationFn: (data) => api.put('/seo', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seoSettings']);
      queryClient.invalidateQueries(['publicSeo']);
      addToast('Global SEO settings updated!', 'success');
    },
    onError: () => addToast('Failed to update SEO configurations.', 'error')
  });

  // Toggle Maintenance Mode helper directly
  const toggleMaintenance = () => {
    if (!systemData) return;
    saveSystemMutation.mutate({
      ...systemData,
      maintenanceMode: !systemData.maintenanceMode
    });
  };

  // Form Submissions
  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveDetailsMutation.mutate(Object.fromEntries(formData.entries()));
  };

  const handleSystemSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Incorporate maintenance checkbox since form data does not append unchecked inputs
    const values = Object.fromEntries(formData.entries());
    values.maintenanceMode = systemData?.maintenanceMode;
    
    values.websiteLogo = websiteLogo;
    values.favicon = favicon;
    saveSystemMutation.mutate(values);
  };

  const handleSeoSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    
    values.ogImage = ogImage;
    saveSeoMutation.mutate(values);
  };

  const isGlobalLoading = detailsLoading || systemLoading || seoLoading;

  if (isGlobalLoading) {
    return <div className="h-6 w-12 bg-neutral-200 animate-pulse rounded" />;
  }

  return (
    <div className="space-y-8 animate-slide-in select-none">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-display font-bold tracking-tight">System & Site Settings</h1>
        <p className="text-xs text-neutral-400">Configure global metadata, maintenance logs, office address cards, and social redirects.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-850 gap-6 text-xs font-bold uppercase tracking-wider pb-px">
        <button
          onClick={() => navigate('/admin/settings')}
          className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
            activeTab === 'office'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
          }`}
        >
          <MapPin className="w-4 h-4" /> Office Contact Info
        </button>

        <button
          onClick={() => navigate('/admin/settings')}
          className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
            activeTab === 'system'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
          }`}
        >
          <Settings className="w-4 h-4" /> Global Settings
        </button>

        <button
          onClick={() => navigate('/admin/seo')}
          className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
            activeTab === 'seo'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
          }`}
        >
          <Globe className="w-4 h-4" /> Homepage SEO
        </button>
      </div>

      {/* ----------------------------------------------------
          RENDER SHELLS
         ---------------------------------------------------- */}

      {/* Tab 1: Office Contact Info */}
      {activeTab === 'office' && (
        <form onSubmit={handleDetailsSubmit} className="stat-card max-w-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Office Address</label>
              <input
                type="text"
                name="officeAddress"
                defaultValue={detailsData?.officeAddress}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">General Email</label>
              <input
                type="email"
                name="email"
                defaultValue={detailsData?.email}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Office Phone</label>
              <input
                type="text"
                name="phone"
                defaultValue={detailsData?.phone}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">WhatsApp Direct Number</label>
              <input
                type="text"
                name="whatsApp"
                defaultValue={detailsData?.whatsApp}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Working Hours</label>
              <input
                type="text"
                name="workingHours"
                defaultValue={detailsData?.workingHours}
                placeholder="Mon - Fri: 9am - 6pm"
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Google Maps Location Embed URL</label>
              <input
                type="text"
                name="googleMapsUrl"
                defaultValue={detailsData?.googleMapsUrl}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs"
              />
            </div>

            {/* Social Links */}
            <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4 mt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Facebook URL</label>
                <input type="text" name="socialFacebook" defaultValue={detailsData?.socialFacebook} className="w-full bg-neutral-50 border rounded py-1.5 px-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Twitter URL</label>
                <input type="text" name="socialTwitter" defaultValue={detailsData?.socialTwitter} className="w-full bg-neutral-50 border rounded py-1.5 px-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">LinkedIn URL</label>
                <input type="text" name="socialLinkedin" defaultValue={detailsData?.socialLinkedin} className="w-full bg-neutral-50 border rounded py-1.5 px-2 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Instagram URL</label>
                <input type="text" name="socialInsta" defaultValue={detailsData?.socialInsta} className="w-full bg-neutral-50 border rounded py-1.5 px-2 text-xs" />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saveDetailsMutation.isPending}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2.5 px-4 rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              {saveDetailsMutation.isPending ? 'Saving...' : 'Save Office Details'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Global settings */}
      {activeTab === 'system' && (
        <form onSubmit={handleSystemSubmit} className="stat-card max-w-xl space-y-6">
          
          {/* Maintenance alert block */}
          <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-850 p-4 rounded-lg border">
            <div>
              <span className="text-xs font-bold block">Maintenance Screen Mode</span>
              <span className="text-[10px] text-neutral-400">If active, redirects all public hits to an under-construction display screen.</span>
            </div>
            <button type="button" onClick={toggleMaintenance} className="text-neutral-500 hover:text-neutral-900">
              {systemData?.maintenanceMode ? (
                <ToggleRight className="w-8 h-8 text-neutral-900 dark:text-white" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Website Logo URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={websiteLogo}
                onChange={(e) => setWebsiteLogo(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Favicon File URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={favicon}
                onChange={(e) => setFavicon(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">System Language</label>
              <select
                name="language"
                defaultValue={systemData?.language}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-2 text-xs"
              >
                <option value="en">English (US)</option>
                <option value="de">German (Deutsch)</option>
                <option value="fr">French (Français)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Server Timezone</label>
              <input
                type="text"
                name="timezone"
                defaultValue={systemData?.timezone}
                placeholder="America/New_York"
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Footer Copyright Text</label>
              <input
                type="text"
                name="footerText"
                defaultValue={systemData?.footerText}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs"
              />
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saveSystemMutation.isPending}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2.5 px-4 rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              {saveSystemMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: SEO Configurations */}
      {activeTab === 'seo' && (
        <form onSubmit={handleSeoSubmit} className="stat-card max-w-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Homepage Browser Title</label>
              <input
                type="text"
                name="homepageTitle"
                defaultValue={seoData?.homepageTitle}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Meta Description</label>
              <textarea
                rows={3}
                name="metaDescription"
                defaultValue={seoData?.metaDescription}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">OG Sharing Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Meta Keywords (comma-separated)</label>
              <input
                type="text"
                name="keywords"
                defaultValue={seoData?.keywords}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Google Analytics Measure ID</label>
              <input
                type="text"
                name="googleAnalyticsId"
                defaultValue={seoData?.googleAnalyticsId}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Google Search Console Key</label>
              <input
                type="text"
                name="searchConsoleVerification"
                defaultValue={seoData?.searchConsoleVerification}
                className="w-full bg-neutral-50 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saveSeoMutation.isPending}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2.5 px-4 rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              {saveSeoMutation.isPending ? 'Saving...' : 'Save Meta Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsSEO;
