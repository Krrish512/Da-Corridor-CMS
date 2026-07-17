import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Globe, FileText, Award, Cpu, Shield, Plus, Edit2, Trash2, X, Save
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const HeroAbout = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  // Navigation tabs: 'hero' | 'about' | 'achievements' | 'process' | 'why-choose-us'
  const [activeTab, setActiveTab] = useState('hero');

  const [backgroundImage, setBackgroundImage] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Modal and edit states
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepForm, setStepForm] = useState({ stepNumber: 1, title: '', description: '', icon: 'Compass' });

  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [editingWhy, setEditingWhy] = useState(null);
  const [whyForm, setWhyForm] = useState({ title: '', description: '', icon: 'Leaf' });

  // ----------------------------------------------------
  // QUERIES
  // ----------------------------------------------------
  const { data: heroData, isLoading: heroLoading } = useQuery({
    queryKey: ['hero'],
    queryFn: () => api.get('/website/hero').then(res => res.data),
  });

  const { data: aboutData, isLoading: aboutLoading } = useQuery({
    queryKey: ['about'],
    queryFn: () => api.get('/website/about').then(res => res.data),
  });

  const { data: achievementsData, isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => api.get('/website/achievements').then(res => res.data),
  });

  const { data: processData, isLoading: processLoading } = useQuery({
    queryKey: ['process'],
    queryFn: () => api.get('/website/process').then(res => res.data),
  });

  const { data: whyData, isLoading: whyLoading } = useQuery({
    queryKey: ['whyChooseUs'],
    queryFn: () => api.get('/website/why-choose-us').then(res => res.data),
  });

  useEffect(() => {
    if (heroData?.backgroundImage) {
      setBackgroundImage(heroData.backgroundImage);
    }
  }, [heroData]);

  useEffect(() => {
    if (aboutData?.profileImage) {
      setProfileImage(aboutData.profileImage);
    }
  }, [aboutData]);

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  const updateHeroMutation = useMutation({
    mutationFn: (data) => api.put('/website/hero', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hero']);
      queryClient.invalidateQueries(['publicHero']);
      addToast('Hero section updated successfully!', 'success');
    },
    onError: () => addToast('Failed to update Hero section.', 'error')
  });

  const updateAboutMutation = useMutation({
    mutationFn: (data) => api.put('/website/about', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['about']);
      queryClient.invalidateQueries(['publicAbout']);
      addToast('About section updated successfully!', 'success');
    },
    onError: () => addToast('Failed to update About section.', 'error')
  });

  const updateAchievementsMutation = useMutation({
    mutationFn: (data) => api.put('/website/achievements', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['achievements']);
      queryClient.invalidateQueries(['publicAchievements']);
      addToast('Achievements updated successfully!', 'success');
    },
    onError: () => addToast('Failed to update achievements.', 'error')
  });

  // Process Mutations
  const saveStepMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) return api.put(`/website/process/${data.id}`, data);
      return api.post('/website/process', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['process']);
      queryClient.invalidateQueries(['publicProcess']);
      setStepModalOpen(false);
      setEditingStep(null);
      addToast('Process step saved!', 'success');
    },
    onError: () => addToast('Failed to save process step.', 'error')
  });

  const deleteStepMutation = useMutation({
    mutationFn: (id) => api.delete(`/website/process/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['process']);
      queryClient.invalidateQueries(['publicProcess']);
      addToast('Process step deleted.', 'success');
    },
    onError: () => addToast('Failed to delete step.', 'error')
  });

  // Why Choose Us Mutations
  const saveWhyMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) return api.put(`/website/why-choose-us/${data.id}`, data);
      return api.post('/website/why-choose-us', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['whyChooseUs']);
      queryClient.invalidateQueries(['publicWhyChooseUs']);
      setWhyModalOpen(false);
      setEditingWhy(null);
      addToast('Why Choose Us card saved!', 'success');
    },
    onError: () => addToast('Failed to save choice.', 'error')
  });

  const deleteWhyMutation = useMutation({
    mutationFn: (id) => api.delete(`/website/why-choose-us/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['whyChooseUs']);
      queryClient.invalidateQueries(['publicWhyChooseUs']);
      addToast('Choice deleted.', 'success');
    },
    onError: () => addToast('Failed to delete choice.', 'error')
  });

  // Form Submits
  const handleHeroSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (backgroundImage) {
    }
    
    data.backgroundImage = backgroundImage;
    updateHeroMutation.mutate(data);
  };

  const handleAboutSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (profileImage) {
    }

    data.profileImage = profileImage;
    updateAboutMutation.mutate(data);
  };

  const handleAchievementsSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateAchievementsMutation.mutate(Object.fromEntries(formData.entries()));
  };

  const handleStepSubmit = (e) => {
    e.preventDefault();
    saveStepMutation.mutate(editingStep ? { ...stepForm, id: editingStep.id } : stepForm);
  };

  const handleWhySubmit = (e) => {
    e.preventDefault();
    saveWhyMutation.mutate(editingWhy ? { ...whyForm, id: editingWhy.id } : whyForm);
  };

  const openAddStep = () => {
    setEditingStep(null);
    setStepForm({ stepNumber: (processData?.length || 0) + 1, title: '', description: '', icon: 'Compass' });
    setStepModalOpen(true);
  };

  const openEditStep = (step) => {
    setEditingStep(step);
    setStepForm({ stepNumber: step.stepNumber, title: step.title, description: step.description, icon: step.icon });
    setStepModalOpen(true);
  };

  const openAddWhy = () => {
    setEditingWhy(null);
    setWhyForm({ title: '', description: '', icon: 'Leaf' });
    setWhyModalOpen(true);
  };

  const openEditWhy = (why) => {
    setEditingWhy(why);
    setWhyForm({ title: why.title, description: why.description, icon: why.icon });
    setWhyModalOpen(true);
  };

  // Render check
  const isGlobalLoading = heroLoading || aboutLoading || achievementsLoading || processLoading || whyLoading;

  if (isGlobalLoading) {
    return <div className="h-6 w-12 bg-neutral-200 animate-pulse rounded" />;
  }

  return (
    <div className="space-y-8 animate-slide-in select-none">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-display font-bold tracking-tight">Website Landing Sections</h1>
        <p className="text-xs text-neutral-400">Configure textual headings, bio statements, achievements counters, and workflows.</p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-850 gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-px">
        {[
          { id: 'hero', label: 'Hero Section', icon: Globe },
          { id: 'about', label: 'About Details', icon: FileText },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'process', label: 'Process Steps', icon: Cpu },
          { id: 'why-choose-us', label: 'Why Choose Us', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 pt-1 border-b-2 -mb-px transition-all ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                  : 'border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* RENDER VIEW ACCORDING TO TABS */}

      {/* HERO SECTION VIEW */}
      {activeTab === 'hero' && (
        <form onSubmit={handleHeroSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-premium max-w-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Hero Heading</label>
              <input
                type="text"
                name="heading"
                defaultValue={heroData?.heading}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950"
              />
            </div>
            
            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Hero Subheading</label>
              <textarea
                rows={3}
                name="subHeading"
                defaultValue={heroData?.subHeading}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Background Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Background Video (URL)</label>
              <input
                type="text"
                name="backgroundVideo"
                defaultValue={heroData?.backgroundVideo}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">CTA Button Text</label>
              <input
                type="text"
                name="ctaText"
                defaultValue={heroData?.ctaText}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">CTA Destination URL</label>
              <input
                type="text"
                name="ctaLink"
                defaultValue={heroData?.ctaLink}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={updateHeroMutation.isPending}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2.5 px-4 rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              {updateHeroMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* ABOUT SECTION VIEW */}
      {activeTab === 'about' && (
        <form onSubmit={handleAboutSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-premium max-w-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Studio Name</label>
              <input
                type="text"
                name="name"
                defaultValue={aboutData?.name}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Profession / Focus</label>
              <input
                type="text"
                name="profession"
                defaultValue={aboutData?.profession}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Intro (Brief about)</label>
              <textarea
                rows={2}
                name="about"
                defaultValue={aboutData?.about}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Biography (Detailed history)</label>
              <textarea
                rows={4}
                name="biography"
                defaultValue={aboutData?.biography}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Years of Experience</label>
              <input
                type="number"
                name="experience"
                defaultValue={aboutData?.experience}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Profile Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Core Skills (comma-separated)</label>
              <input
                type="text"
                name="skills"
                defaultValue={aboutData?.skills}
                placeholder="Sustainable Design, BIM, 3D Rendering"
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Vision Statement</label>
              <textarea
                rows={3}
                name="vision"
                defaultValue={aboutData?.vision}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Mission Statement</label>
              <textarea
                rows={3}
                name="mission"
                defaultValue={aboutData?.mission}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Resume Document Link (URL)</label>
              <input
                type="text"
                name="resumeUrl"
                defaultValue={aboutData?.resumeUrl}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={updateAboutMutation.isPending}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2.5 px-4 rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              {updateAboutMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* ACHIEVEMENTS VIEW */}
      {activeTab === 'achievements' && (
        <form onSubmit={handleAchievementsSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-premium max-w-xl space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Years of Practice</label>
              <input
                type="number"
                name="yearsExperience"
                defaultValue={achievementsData?.yearsExperience}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Projects Completed</label>
              <input
                type="number"
                name="projectsCompleted"
                defaultValue={achievementsData?.projectsCompleted}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Happy Clients</label>
              <input
                type="number"
                name="happyClients"
                defaultValue={achievementsData?.happyClients}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Awards Won</label>
              <input
                type="number"
                name="awards"
                defaultValue={achievementsData?.awards}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={updateAchievementsMutation.isPending}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2.5 px-4 rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              {updateAchievementsMutation.isPending ? 'Saving...' : 'Save counters'}
            </button>
          </div>
        </form>
      )}

      {/* PROCESS WORKFLOW VIEW */}
      {activeTab === 'process' && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Project Workflow Stages</h3>
            <button
              onClick={openAddStep}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add Step
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-premium overflow-hidden">
            <table className="w-full text-left text-xs divide-y divide-neutral-100 dark:divide-neutral-850">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/60 font-bold text-neutral-400">
                  <th className="p-3 w-16 text-center">Step #</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 w-20">Icon</th>
                  <th className="p-3 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                {processData && processData.length > 0 ? (
                  processData.map((step) => (
                    <tr key={step.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/10">
                      <td className="p-3 text-center font-bold">{step.stepNumber}</td>
                      <td className="p-3 font-semibold">{step.title}</td>
                      <td className="p-3 text-neutral-500 max-w-sm truncate">{step.description}</td>
                      <td className="p-3"><code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono text-[10px]">{step.icon}</code></td>
                      <td className="p-3 text-right flex justify-end gap-2">
                        <button
                          onClick={() => openEditStep(step)}
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete process step "${step.title}"?`)) {
                              deleteStepMutation.mutate(step.id);
                            }
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-neutral-400">No process steps found. Create your first step.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WHY CHOOSE US VIEW */}
      {activeTab === 'why-choose-us' && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Why Clients Choose Us Cards</h3>
            <button
              onClick={openAddWhy}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add Choice
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whyData && whyData.length > 0 ? (
              whyData.map((why) => (
                <div key={why.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-premium flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 py-1 px-2 rounded block w-fit mb-4 font-mono">{why.icon}</span>
                    <h4 className="text-sm font-bold">{why.title}</h4>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{why.description}</p>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 mt-4 pt-3">
                    <button
                      onClick={() => openEditWhy(why)}
                      className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete item "${why.title}"?`)) {
                          deleteWhyMutation.mutate(why.id);
                        }
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 border border-dashed rounded-lg py-8 text-center text-neutral-400 text-xs">
                No cards created. Click 'Add Choice' to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROCESS MODAL */}
      {stepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs">
          <form onSubmit={handleStepSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-premium-lg animate-slide-in">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold uppercase tracking-wider">{editingStep ? 'Edit Workflow Step' : 'New Workflow Step'}</h3>
              <button type="button" onClick={() => setStepModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Step Number</label>
                <input
                  type="number"
                  value={stepForm.stepNumber}
                  onChange={(e) => setStepForm({ ...stepForm, stepNumber: parseInt(e.target.value) || 1 })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1 px-2 text-xs"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Icon Identifier</label>
                <input
                  type="text"
                  value={stepForm.icon}
                  onChange={(e) => setStepForm({ ...stepForm, icon: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1 px-2 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Title</label>
              <input
                type="text"
                value={stepForm.title}
                onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Description</label>
              <textarea
                rows={3}
                value={stepForm.description}
                onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button type="button" onClick={() => setStepModalOpen(false)} className="px-3 py-1.5 border rounded text-xs">Cancel</button>
              <button type="submit" className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-1.5 rounded text-xs font-bold">{saveStepMutation.isPending ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      {/* WHY CHOOSE US MODAL */}
      {whyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs">
          <form onSubmit={handleWhySubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-premium-lg animate-slide-in">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold uppercase tracking-wider">{editingWhy ? 'Edit Choice Card' : 'New Choice Card'}</h3>
              <button type="button" onClick={() => setWhyModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Icon (Lucide name)</label>
              <input
                type="text"
                value={whyForm.icon}
                onChange={(e) => setWhyForm({ ...whyForm, icon: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Card Title</label>
              <input
                type="text"
                value={whyForm.title}
                onChange={(e) => setWhyForm({ ...whyForm, title: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Description</label>
              <textarea
                rows={3}
                value={whyForm.description}
                onChange={(e) => setWhyForm({ ...whyForm, description: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button type="button" onClick={() => setWhyModalOpen(false)} className="px-3 py-1.5 border rounded text-xs">Cancel</button>
              <button type="submit" className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-1.5 rounded text-xs font-bold">{saveWhyMutation.isPending ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HeroAbout;
