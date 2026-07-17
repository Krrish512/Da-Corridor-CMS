import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star, Users, Link2, Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight,
  Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const TestimonialsTeamPartners = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Tab views: 'testimonials' | 'team' | 'partners'
  const [activeTab, setActiveTab] = useState('testimonials');

  // Modal controls
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testForm, setTestForm] = useState({ clientName: '', company: '', designation: '', profileImage: '', rating: 5, review: '', isActive: true });

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', position: '', photo: '', bio: '', facebook: '', twitter: '', linkedin: '', instagram: '' });

  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerForm, setPartnerForm] = useState({ companyName: '', logo: '', websiteUrl: '' });

  // ----------------------------------------------------
  // QUERIES
  // ----------------------------------------------------
  const { data: testimonials, isLoading: testLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => api.get('/testimonials').then(res => res.data),
  });

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => api.get('/team').then(res => res.data),
  });

  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => api.get('/partners').then(res => res.data),
  });

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  // Testimonial Mutations
  const saveTestMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) return api.put(`/testimonials/${data.id}`, data);
      return api.post('/testimonials', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      queryClient.invalidateQueries(['publicTestimonials']);
      setTestModalOpen(false);
      setEditingTest(null);
      addToast('Testimonial saved!', 'success');
    },
    onError: () => addToast('Failed to save testimonial.', 'error')
  });

  const deleteTestMutation = useMutation({
    mutationFn: (id) => api.delete(`/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      queryClient.invalidateQueries(['publicTestimonials']);
      addToast('Testimonial deleted.', 'success');
    },
    onError: () => addToast('Failed to delete testimonial.', 'error')
  });

  const toggleTestActiveMutation = useMutation({
    mutationFn: (item) => api.put(`/testimonials/${item.id}`, { ...item, isActive: !item.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      queryClient.invalidateQueries(['publicTestimonials']);
    },
  });

  // Team Mutations
  const saveTeamMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) return api.put(`/team/${data.id}`, data);
      return api.post('/team', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team']);
      queryClient.invalidateQueries(['publicTeam']);
      setTeamModalOpen(false);
      setEditingTeam(null);
      addToast('Team member profile saved!', 'success');
    },
    onError: () => addToast('Failed to save member.', 'error')
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id) => api.delete(`/team/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['team']);
      queryClient.invalidateQueries(['publicTeam']);
      addToast('Team member deleted.', 'success');
    },
    onError: () => addToast('Failed to delete profile.', 'error')
  });

  // Partner Mutations
  const savePartnerMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) return api.put(`/partners/${data.id}`, data);
      return api.post('/partners', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['partners']);
      queryClient.invalidateQueries(['publicPartners']);
      setPartnerModalOpen(false);
      setEditingPartner(null);
      addToast('Partner brand details saved!', 'success');
    },
    onError: () => addToast('Failed to save partner brand.', 'error')
  });

  const deletePartnerMutation = useMutation({
    mutationFn: (id) => api.delete(`/partners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['partners']);
      queryClient.invalidateQueries(['publicPartners']);
      addToast('Partner deleted.', 'success');
    },
    onError: () => addToast('Failed to delete partner.', 'error')
  });

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (testForm.profileImage) {
    }
    saveTestMutation.mutate(editingTest ? { ...testForm, id: editingTest.id } : testForm);
  };

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    if (teamForm.photo) {
    }
    saveTeamMutation.mutate(editingTeam ? { ...teamForm, id: editingTeam.id } : teamForm);
  };

  const handlePartnerSubmit = (e) => {
    e.preventDefault();
    if (!partnerForm.logo) {
      addToast('Logo image is required.', 'error');
      return;
    }
    savePartnerMutation.mutate(editingPartner ? { ...partnerForm, id: editingPartner.id } : partnerForm);
  };

  // Opening Add Modals
  const openAddTest = () => {
    setEditingTest(null);
    setTestForm({ clientName: '', company: '', designation: '', profileImage: '', rating: 5, review: '', isActive: true });
    setTestModalOpen(true);
  };

  const openEditTest = (item) => {
    setEditingTest(item);
    setTestForm({ ...item });
    setTestModalOpen(true);
  };

  const openAddTeam = () => {
    setEditingTeam(null);
    setTeamForm({ name: '', position: '', photo: '', bio: '', facebook: '', twitter: '', linkedin: '', instagram: '' });
    setTeamModalOpen(true);
  };

  const openEditTeam = (item) => {
    setEditingTeam(item);
    setTeamForm({
      name: item.name,
      position: item.position,
      photo: item.photo || '',
      bio: item.bio,
      facebook: item.facebook || '',
      twitter: item.twitter || '',
      linkedin: item.linkedin || '',
      instagram: item.instagram || '',
    });
    setTeamModalOpen(true);
  };

  const openAddPartner = () => {
    setEditingPartner(null);
    setPartnerForm({ companyName: '', logo: '', websiteUrl: '' });
    setPartnerModalOpen(true);
  };

  const openEditPartner = (item) => {
    setEditingPartner(item);
    setPartnerForm({
      companyName: item.companyName,
      logo: item.logo,
      websiteUrl: item.websiteUrl || ''
    });
    setPartnerModalOpen(true);
  };

  const isGlobalLoading = testLoading || teamLoading || partnersLoading;

  if (isGlobalLoading) {
    return <div className="h-6 w-12 bg-neutral-200 animate-pulse rounded" />;
  }

  return (
    <div className="space-y-8 animate-slide-in select-none max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-display font-bold tracking-tight">Socials & Credibility</h1>
          <p className="text-xs text-neutral-400">Manage client testimonial reviews, details of team members, and partner brand logos.</p>
        </div>

        {activeTab === 'testimonials' && (
          <button onClick={openAddTest} className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1 shadow">
            <Plus className="w-4 h-4" /> Add Review
          </button>
        )}
        {activeTab === 'team' && (
          <button onClick={openAddTeam} className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1 shadow">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        )}
        {activeTab === 'partners' && (
          <button onClick={openAddPartner} className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1 shadow">
            <Plus className="w-4 h-4" /> Add Partner
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-850 gap-6 text-xs font-bold uppercase tracking-wider pb-px">
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
            activeTab === 'testimonials'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
          }`}
        >
          <Star className="w-4 h-4" /> Client Reviews
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
            activeTab === 'team'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
          }`}
        >
          <Users className="w-4 h-4" /> Team Roster
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
            activeTab === 'partners'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
          }`}
        >
          <Link2 className="w-4 h-4" /> Partner Brands
        </button>
      </div>

      {/* RENDER VIEWS */}

      {/* 1. TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials && testimonials.length > 0 ? (
            testimonials.map((test) => (
              <div
                key={test.id}
                className={`bg-white dark:bg-neutral-900 border rounded-lg p-6 shadow-premium flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-all ${
                  !test.isActive ? 'opacity-65 border-dashed' : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-neutral-100 border overflow-hidden shrink-0">
                        {test.profileImage ? (
                          <img src={test.profileImage} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-xs uppercase bg-neutral-200 text-neutral-600">
                            {test.clientName.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">{test.clientName}</h4>
                        <p className="text-[10px] text-neutral-400 font-semibold">{test.company} • {test.designation}</p>
                      </div>
                    </div>

                    <button onClick={() => toggleTestActiveMutation.mutate(test)}>
                      {test.isActive ? <ToggleRight className="w-6 h-6 text-neutral-900 dark:text-white" /> : <ToggleLeft className="w-6 h-6 text-neutral-400" />}
                    </button>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 text-amber-500 mb-3">
                    {Array(5).fill(0).map((_, idx) => (
                      <Star key={idx} className={`w-3.5 h-3.5 ${idx < test.rating ? 'fill-amber-500' : 'text-neutral-200 dark:text-neutral-850'}`} />
                    ))}
                  </div>

                  <p className="text-xs text-neutral-500 italic leading-relaxed">
                    "{test.review}"
                  </p>
                </div>

                <div className="flex justify-end gap-2 border-t mt-6 pt-3">
                  <button onClick={() => openEditTest(test)} className="px-2.5 py-1.5 border rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[11px] font-bold flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete review from ${test.clientName}?`)) {
                        deleteTestMutation.mutate(test.id);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 border border-dashed rounded-lg py-12 text-center text-neutral-400 text-xs">
              No reviews registered. Click 'Add Review' to record one.
            </div>
          )}
        </div>
      )}

      {/* 2. TEAM MEMBERS */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team && team.length > 0 ? (
            team.map((member) => (
              <div key={member.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-premium flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
                <div>
                  <div className="h-44 w-full bg-neutral-50 dark:bg-neutral-850 rounded border overflow-hidden mb-4">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-400"><Users className="w-10 h-10" /></div>
                    )}
                  </div>

                  <h4 className="text-sm font-bold">{member.name}</h4>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">{member.position}</p>
                  
                  <p className="text-xs text-neutral-500 mt-2.5 leading-relaxed truncate-3-lines">
                    {member.bio}
                  </p>

                  {/* Social Handles Icons */}
                  <div className="flex gap-2.5 text-neutral-400 dark:text-neutral-600 mt-4">
                    {member.facebook && <Facebook className="w-4 h-4 hover:text-neutral-900 dark:hover:text-white" />}
                    {member.twitter && <Twitter className="w-4 h-4 hover:text-neutral-900 dark:hover:text-white" />}
                    {member.linkedin && <Linkedin className="w-4 h-4 hover:text-neutral-900 dark:hover:text-white" />}
                    {member.instagram && <Instagram className="w-4 h-4 hover:text-neutral-900 dark:hover:text-white" />}
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t mt-4 pt-3">
                  <button onClick={() => openEditTeam(member)} className="p-1 rounded text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete team profile for ${member.name}?`)) {
                        deleteTeamMutation.mutate(member.id);
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
            <div className="col-span-3 border border-dashed rounded-lg py-12 text-center text-neutral-400 text-xs">
              No team members registered. Click 'Add Member' to list one.
            </div>
          )}
        </div>
      )}

      {/* 3. STRATEGIC PARTNERS */}
      {activeTab === 'partners' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partners && partners.length > 0 ? (
            partners.map((partner) => (
              <div key={partner.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-premium flex flex-col justify-between items-center text-center group hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
                <div className="h-16 w-32 bg-neutral-50 dark:bg-neutral-850 rounded flex items-center justify-center overflow-hidden border">
                  {partner.logo ? (
                    <img src={partner.logo} alt="logo" className="max-h-12 max-w-28 object-contain filter dark:invert" />
                  ) : (
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">{partner.companyName}</span>
                  )}
                </div>

                <div className="mt-3">
                  <h4 className="text-xs font-bold truncate max-w-28">{partner.companyName}</h4>
                  {partner.websiteUrl && (
                    <a href={partner.websiteUrl} target="_blank" rel="noreferrer" className="text-[9px] text-neutral-400 font-medium hover:underline block mt-0.5 truncate max-w-28">
                      {partner.websiteUrl}
                    </a>
                  )}
                </div>

                <div className="flex gap-2 border-t w-full mt-4 pt-2.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditPartner(partner)} className="p-1 rounded text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete partner ${partner.companyName}?`)) {
                        deletePartnerMutation.mutate(partner.id);
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
            <div className="col-span-4 border border-dashed rounded-lg py-12 text-center text-neutral-400 text-xs">
              No strategic partners listed. Click 'Add Partner' to record one.
            </div>
          )}
        </div>
      )}

      {/* TESTIMONIAL MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs">
          <form
            onSubmit={handleTestSubmit}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-premium-lg animate-slide-in"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold uppercase tracking-wider">{editingTest ? 'Edit Client Review' : 'New Client Review'}</h3>
              <button type="button" onClick={() => setTestModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Client Name</label>
                <input
                  type="text"
                  required
                  value={testForm.clientName}
                  onChange={(e) => setTestForm({ ...testForm, clientName: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Company Name</label>
                <input
                  type="text"
                  value={testForm.company}
                  onChange={(e) => setTestForm({ ...testForm, company: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Designation</label>
                <input
                  type="text"
                  value={testForm.designation}
                  onChange={(e) => setTestForm({ ...testForm, designation: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Rating Star (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={testForm.rating}
                  onChange={(e) => setTestForm({ ...testForm, rating: parseInt(e.target.value) || 5 })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Avatar Photo URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={testForm.profileImage}
                onChange={(e) => setTestForm({ ...testForm, profileImage: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Review Message</label>
              <textarea
                rows={3}
                required
                value={testForm.review}
                onChange={(e) => setTestForm({ ...testForm, review: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button type="button" onClick={() => setTestModalOpen(false)} className="px-3 py-1.5 border rounded text-xs">Cancel</button>
              <button type="submit" className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-1.5 rounded text-xs font-bold">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* TEAM MEMBER MODAL */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs">
          <form
            onSubmit={handleTeamSubmit}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-premium-lg animate-slide-in"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold uppercase tracking-wider">{editingTeam ? 'Edit Member Profile' : 'New Member Profile'}</h3>
              <button type="button" onClick={() => setTeamModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-850 border rounded py-1.5 px-2.5 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Position</label>
                <input
                  type="text"
                  required
                  value={teamForm.position}
                  onChange={(e) => setTeamForm({ ...teamForm, position: e.target.value })}
                  placeholder="e.g. Principal Architect"
                  className="w-full bg-neutral-50 dark:bg-neutral-850 border rounded py-1.5 px-2.5 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Photo URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={teamForm.photo}
                onChange={(e) => setTeamForm({ ...teamForm, photo: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Bio Summary</label>
              <textarea
                rows={3}
                required
                value={teamForm.bio}
                onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-850 border rounded py-1.5 px-2.5 text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Linkedin Handle</label>
                <input
                  type="text"
                  value={teamForm.linkedin}
                  onChange={(e) => setTeamForm({ ...teamForm, linkedin: e.target.value })}
                  className="w-full bg-neutral-50 border rounded py-1 px-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Instagram Handle</label>
                <input
                  type="text"
                  value={teamForm.instagram}
                  onChange={(e) => setTeamForm({ ...teamForm, instagram: e.target.value })}
                  className="w-full bg-neutral-50 border rounded py-1 px-2 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button type="button" onClick={() => setTeamModalOpen(false)} className="px-3 py-1.5 border rounded text-xs">Cancel</button>
              <button type="submit" className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-1.5 rounded text-xs font-bold">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* PARTNER MODAL */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs">
          <form
            onSubmit={handlePartnerSubmit}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-premium-lg animate-slide-in"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold uppercase tracking-wider">{editingPartner ? 'Edit Partner Logo' : 'New Partner Logo'}</h3>
              <button type="button" onClick={() => setPartnerModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Company Name</label>
              <input
                type="text"
                required
                value={partnerForm.companyName}
                onChange={(e) => setPartnerForm({ ...partnerForm, companyName: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Logo Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={partnerForm.logo}
                onChange={(e) => setPartnerForm({ ...partnerForm, logo: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Redirect Website (URL)</label>
              <input
                type="text"
                value={partnerForm.websiteUrl}
                onChange={(e) => setPartnerForm({ ...partnerForm, websiteUrl: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button type="button" onClick={() => setPartnerModalOpen(false)} className="px-3 py-1.5 border rounded text-xs">Cancel</button>
              <button type="submit" className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-1.5 rounded text-xs font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TestimonialsTeamPartners;
