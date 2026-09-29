
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, HelpCircle, Plus, Edit2, Trash2, X, Save, ArrowLeft, Eye, Edit,
  ChevronLeft, ChevronRight
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import api from '../utils/api';

import { StatusBadge } from '../components/cms/StatusBadge';
import { useAuth } from '../context/AuthContext';
import MediaPicker from '../components/ui/media/MediaPicker';

// Derive which tab to show from the current URL path
const getTabFromPath = (pathname) => {
  const segment = pathname.split('/').pop();
  return segment === 'faq' ? 'faq' : 'blog';
};

const BlogFAQ = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab state: 'blog' | 'faq'
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  // Sync tab when navigating between these routes
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  // Sub-view for Blog: 'list' | 'create' | 'edit'
  const [blogView, setBlogView] = useState('list');
  const [editingBlogId, setEditingBlogId] = useState(null);

  // Status Filter for Blogs
  const [blogStatusFilter, setBlogStatusFilter] = useState('');

  // Pagination for Blogs
  const [blogPage, setBlogPage] = useState(1);
  const blogLimit = 5;

  // Blog Form State
  const initialBlogState = {
    title: '',
    slug: '',
    category: 'Design Trends',
    tags: '',
    featuredImage: '',
    richText: '',
    seoTitle: '',
    seoDescription: '',
    publishDate: '',
    publishingStatus: currentUser?.role === 'CO_ADMIN' ? 'PENDING_APPROVAL' : 'PUBLISHED',
    scheduledPublishAt: '',
    scheduledUnpublishAt: '',
  };
  const [blogForm, setBlogForm] = useState(initialBlogState);
  // Preview or Edit tab inside Rich Text Editor
  const [editorTab, setEditorTab] = useState('edit');

  // FAQ Modal & Form
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', displayOrder: 0 });

  // Escape key handler for FAQ modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && faqModalOpen) {
        setFaqModalOpen(false);
      }
    };
    if (faqModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [faqModalOpen]);

  // ----------------------------------------------------
  // QUERIES
  // ----------------------------------------------------
  const { data: blogsData, isLoading: blogsLoading } = useQuery({
    queryKey: ['blogs', blogPage, blogStatusFilter],
    queryFn: () =>
      api.get('/blog', { params: { page: blogPage, limit: blogLimit, publishingStatus: blogStatusFilter } }).then((res) => res.data),
    enabled: activeTab === 'blog',
  });

  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => api.get('/faqs').then((res) => res.data),
    enabled: activeTab === 'faq',
  });

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  // Blog Mutations
  const saveBlogMutation = useMutation({
    queryKey: ['saveBlog'],
    mutationFn: (data) => {
      if (blogView === 'edit') return api.put(`/blog/${editingBlogId}`, data);
      return api.post('/blog', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blogs']);
      queryClient.invalidateQueries(['publicBlogs']);
      setBlogView('list');
      addToast('Blog post saved!', 'success');
    },
    onError: () => addToast('Failed to save blog post.', 'error'),
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id) => api.delete(`/blog/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['blogs']);
      queryClient.invalidateQueries(['publicBlogs']);
      addToast('Blog post deleted.', 'success');
    },
    onError: () => addToast('Failed to delete blog.', 'error'),
  });

  // Dedicated approval mutation — always uses PUT /blog/:id to update the
  // existing record. Never calls the create endpoint, preventing duplication.
  const approveBlogMutation = useMutation({
    mutationFn: (post) => api.put(`/blog/${post.id}`, { ...post, publishingStatus: 'PUBLISHED' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['blogs']);
      queryClient.invalidateQueries(['publicBlogs']);
      addToast('Blog post approved and published!', 'success');
    },
    onError: () => addToast('Failed to approve blog post.', 'error'),
  });

  // FAQ Mutations
  const saveFaqMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) return api.put(`/faqs/${data.id}`, data);
      return api.post('/faqs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['faqs']);
      queryClient.invalidateQueries(['publicFaqs']);
      setFaqModalOpen(false);
      setEditingFaq(null);
      addToast('FAQ saved successfully!', 'success');
    },
    onError: () => addToast('Failed to save FAQ.', 'error'),
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id) => api.delete(`/faqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['faqs']);
      queryClient.invalidateQueries(['publicFaqs']);
      addToast('FAQ deleted.', 'success');
    },
    onError: () => addToast('Failed to delete FAQ.', 'error'),
  });

  // Actions
  const handleOpenAddBlog = () => {
    setBlogForm(initialBlogState);
    setBlogView('create');
  };

  const handleOpenEditBlog = (post) => {
    setEditingBlogId(post.id);
    const dateStr = post.publishDate ? new Date(post.publishDate).toISOString().split('T')[0] : '';
    setBlogForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      tags: post.tags,
      featuredImage: post.featuredImage,
      richText: post.richText,
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      publishDate: dateStr,
      publishingStatus: post.publishingStatus || 'PUBLISHED',
      scheduledPublishAt: post.scheduledPublishAt ? new Date(post.scheduledPublishAt).toISOString().slice(0, 16) : '',
      scheduledUnpublishAt: post.scheduledUnpublishAt ? new Date(post.scheduledUnpublishAt).toISOString().slice(0, 16) : '',
    });
    setBlogView('edit');
  };

  const handleBlogSubmit = (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.featuredImage || !blogForm.richText) {
      addToast('Title, Cover Image, and Article body content are required.', 'error');
      return;
    }
    saveBlogMutation.mutate(blogForm);
  };

  const openAddFaq = () => {
    setEditingFaq(null);
    setFaqForm({ question: '', answer: '', displayOrder: (faqs?.length || 0) + 1 });
    setFaqModalOpen(true);
  };

  const openEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqForm({ question: faq.question, answer: faq.answer, displayOrder: faq.displayOrder });
    setFaqModalOpen(true);
  };

  const handleFaqSubmit = (e) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer) {
      addToast('Both question and answer parameters are required.', 'error');
      return;
    }
    saveFaqMutation.mutate(editingFaq ? { ...faqForm, id: editingFaq.id } : faqForm);
  };

  const isGlobalLoading = (activeTab === 'blog' && blogsLoading) || (activeTab === 'faq' && faqsLoading);

  if (isGlobalLoading && blogView === 'list') {
    return <div className="h-6 w-12 bg-neutral-200 animate-pulse rounded" />;
  }

  return (
    <div className="space-y-8 animate-slide-in select-none">
      {/* Listing Views Header */}
      {blogView === 'list' && (
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-display font-bold tracking-tight">Journal & Help Center</h1>
            <p className="text-xs text-neutral-400">Manage blog articles, design research columns, and frequently asked questions.</p>
          </div>

          {activeTab === 'blog' ? (
            <button
              onClick={handleOpenAddBlog}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Add Article
            </button>
          ) : (
            <button
              onClick={openAddFaq}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      {blogView === 'list' && (
        <div className="flex border-b border-neutral-200 dark:border-neutral-850 gap-6 text-xs font-bold uppercase tracking-wider pb-px">
          <button
            onClick={() => navigate('/admin/blog')}
            className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
              activeTab === 'blog'
                ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Articles ({blogsData?.meta?.total || 0})
          </button>

          <button
            onClick={() => navigate('/admin/faq')}
            className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
              activeTab === 'faq'
                ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> FAQs ({faqs?.length || 0})
          </button>
        </div>
      )}

      {/* ----------------------------------------------------
          BLOG VIEWS
         ---------------------------------------------------- */}
      {/* BLOG LISTING */}
      {activeTab === 'blog' && blogView === 'list' && (
        <div className="space-y-4">
          {/* Status Filters Bar */}
          <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-850 p-2 rounded-lg text-xs">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {[
                { label: 'All Articles', value: '' },
                { label: 'Published', value: 'PUBLISHED' },
                { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
                { label: 'Drafts', value: 'DRAFT' },
                { label: 'Archived', value: 'ARCHIVED' },
                { label: 'Scheduled', value: 'SCHEDULED' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => { setBlogStatusFilter(filter.value); setBlogPage(1); }}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    blogStatusFilter === filter.value
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {blogsData?.data?.length > 0 ? (
            <div className="space-y-4 max-w-4xl">
              <div className="grid grid-cols-1 gap-4">
                {blogsData.data.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-premium flex gap-5 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
                    <img src={post.featuredImage} alt="blog" className="w-24 h-24 object-cover rounded border hidden sm:block" />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{post.category}</span>
                          <StatusBadge status={post.publishingStatus} scheduledPublishAt={post.scheduledPublishAt} />
                          <span className="text-[10px] text-neutral-400">{new Date(post.publishDate).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-sm font-bold text-neutral-950 dark:text-white">{post.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1 truncate max-w-xl" dangerouslySetInnerHTML={{ __html: post.richText.replace(/<[^>]*>/g, '') }} />
                      </div>

                      <div className="flex items-center gap-3 mt-4 text-[11px] font-bold text-neutral-500">
                        <button onClick={() => handleOpenEditBlog(post)} className="hover:text-neutral-900 dark:hover:text-white flex items-center gap-0.5"><Edit2 className="w-3 h-3" /> Edit</button>
                        {currentUser?.role !== 'CO_ADMIN' && post.publishingStatus === 'PENDING_APPROVAL' && (
                          <>
                            <span>|</span>
                            <button
                              onClick={() => {
                                approveBlogMutation.mutate(post);
                              }}
                              disabled={approveBlogMutation.isPending}
                              className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                            >
                              Approve & Publish
                            </button>
                          </>
                        )}
                        <span>|</span>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete post "${post.title}"?`)) {
                              deleteBlogMutation.mutate(post.id);
                            }
                          }}
                          className="hover:text-rose-500 flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {blogsData.meta?.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-neutral-400">Page <strong>{blogPage}</strong> of {blogsData.meta?.totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={blogPage === 1}
                      onClick={() => setBlogPage(p => p - 1)}
                      className="px-2.5 py-1.5 border rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-40 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <button
                      disabled={blogPage === blogsData.meta?.totalPages}
                      onClick={() => setBlogPage(p => p + 1)}
                      className="px-2.5 py-1.5 border rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-40 flex items-center gap-1 text-[11px] font-bold"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed rounded-lg py-12 text-center text-neutral-400 text-xs">
              No journal articles posted. Create one.
            </div>
          )}
        </div>
      )}

      {/* BLOG CREATE / EDIT EDITOR VIEW */}
      {(blogView === 'create' || blogView === 'edit') && (
        <form onSubmit={handleBlogSubmit} className="space-y-6 max-w-4xl animate-slide-in">
          <div className="flex justify-between items-center border-b pb-4">
            <button
              type="button"
              onClick={() => setBlogView('list')}
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Cancel
            </button>
            <button
              type="submit"
              disabled={saveBlogMutation.isPending}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              {saveBlogMutation.isPending ? 'Publishing...' : 'Save & Publish'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Core Fields */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border rounded-lg p-6 shadow-premium space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b">Article Body</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase">Article Title</label>
                    <input
                      type="text"
                      required
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      placeholder="The future of building design..."
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1.5 px-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase">Slug path</label>
                    <input
                      type="text"
                      value={blogForm.slug}
                      onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                      className="w-full bg-neutral-50 border rounded py-1.5 px-2.5 text-xs"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Featured Article Image</label>
                    <MediaPicker
                      value={blogForm.featuredImage}
                      onChange={(url) => setBlogForm({ ...blogForm, featuredImage: url })}
                      multiple={false}
                      outputFormat="url"
                    />
                  </div>
                </div>

                {/* Editor Split Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase">Rich Text Body Content (HTML/Markdown)</label>
                    <div className="flex border rounded text-[10px] font-bold overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                      <button
                        type="button"
                        onClick={() => setEditorTab('edit')}
                        className={`px-2.5 py-1 flex items-center gap-1 ${editorTab === 'edit' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : ''}`}
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab('preview')}
                        className={`px-2.5 py-1 border-l flex items-center gap-1 ${editorTab === 'preview' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : ''}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                    </div>
                  </div>

                  {editorTab === 'edit' ? (
                    <textarea
                      rows={10}
                      required
                      value={blogForm.richText}
                      onChange={(e) => setBlogForm({ ...blogForm, richText: e.target.value })}
                      placeholder="<p>Type your blog HTML contents here...</p>"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded p-3 text-xs font-mono focus:outline-none"
                    />
                  ) : (
                    <div
                      className="w-full min-h-[220px] max-h-[300px] overflow-y-auto bg-neutral-50 dark:bg-neutral-850 p-4 border rounded text-xs leading-relaxed prose dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: blogForm.richText || '<p className="text-neutral-400">No content typed yet.</p>' }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Publishing & Approval Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-premium space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b">Publishing & Approval</h3>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Publishing Status</label>
                  <select
                    value={blogForm.publishingStatus}
                    onChange={(e) => setBlogForm({ ...blogForm, publishingStatus: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded py-1.5 px-2.5 text-xs font-bold text-neutral-900 dark:text-white"
                  >
                    {currentUser?.role === 'CO_ADMIN' ? (
                      <>
                        <option value="PENDING_APPROVAL">Submit for Approval</option>
                        <option value="DRAFT">Save as Draft</option>
                      </>
                    ) : (
                      <>
                        <option value="PUBLISHED">Published</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                      </>
                    )}
                  </select>
                </div>

                {currentUser?.role === 'CO_ADMIN' && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                    Co-Admin rule: Saving will submit your article to Admin for review & approval.
                  </p>
                )}

                <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Schedule Auto-Publish (Optional)</label>
                  <input
                    type="datetime-local"
                    value={blogForm.scheduledPublishAt}
                    onChange={(e) => setBlogForm({ ...blogForm, scheduledPublishAt: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded py-1.5 px-2 text-xs"
                  />
                  <span className="text-[10px] text-neutral-400 block">Set future date/time to automatically publish this article.</span>
                </div>
              </div>

              {/* Settings Card */}
              <div className="bg-white dark:bg-neutral-900 border rounded-lg p-6 shadow-premium space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b">Settings</h3>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Category</label>
                  <input
                    type="text"
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    placeholder="Innovation, Designs, BIM"
                    className="w-full bg-neutral-50 border rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={blogForm.tags}
                    onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                    placeholder="sustainability, concrete"
                    className="w-full bg-neutral-50 border rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Publish Date</label>
                  <input
                    type="date"
                    value={blogForm.publishDate}
                    onChange={(e) => setBlogForm({ ...blogForm, publishDate: e.target.value })}
                    className="w-full bg-neutral-50 border rounded py-1.5 px-2 text-xs"
                  />
                </div>
              </div>

              {/* SEO Card */}
              <div className="bg-white dark:bg-neutral-900 border rounded-lg p-6 shadow-premium space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b">Article SEO</h3>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">SEO Title</label>
                  <input
                    type="text"
                    value={blogForm.seoTitle}
                    onChange={(e) => setBlogForm({ ...blogForm, seoTitle: e.target.value })}
                    className="w-full bg-neutral-50 border rounded py-1.5 px-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">SEO Description</label>
                  <textarea
                    rows={3}
                    value={blogForm.seoDescription}
                    onChange={(e) => setBlogForm({ ...blogForm, seoDescription: e.target.value })}
                    className="w-full bg-neutral-50 border rounded py-1.5 px-2.5 text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ----------------------------------------------------
          FAQ VIEW
         ---------------------------------------------------- */}
      {activeTab === 'faq' && (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-premium overflow-hidden">
            <table className="w-full text-left text-xs divide-y divide-neutral-100 dark:divide-neutral-850">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/60 font-bold text-neutral-400">
                  <th className="p-3 w-16 text-center">Order</th>
                  <th className="p-3">Question</th>
                  <th className="p-3">Answer</th>
                  <th className="p-3 w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                {faqs && faqs.length > 0 ? (
                  faqs.map((faq) => (
                    <tr key={faq.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/10">
                      <td className="p-3 text-center font-bold">{faq.displayOrder}</td>
                      <td className="p-3 font-semibold max-w-[200px] truncate">{faq.question}</td>
                      <td className="p-3 text-neutral-500 max-w-xs truncate">{faq.answer}</td>
                      <td className="p-3 text-right flex justify-end gap-2">
                        <button onClick={() => openEditFaq(faq)} className="p-1 rounded text-neutral-500 hover:bg-neutral-50"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete FAQ "${faq.question.substring(0, 30)}..."?`)) {
                              deleteFaqMutation.mutate(faq.id);
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
                    <td colSpan="4" className="p-8 text-center text-neutral-400">No FAQ cards created. Add one.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {faqModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setFaqModalOpen(false)}
        >
          <form 
            onSubmit={handleFaqSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-premium-lg animate-scale-in"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold uppercase tracking-wider">{editingFaq ? 'Edit FAQ Card' : 'New FAQ Card'}</h3>
              <button 
                type="button" 
                onClick={() => setFaqModalOpen(false)} 
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded focus-ring"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Question</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="Is landscaping included?"
                  className="w-full bg-neutral-50 border rounded py-1.5 px-2.5 text-xs focus-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Order Index</label>
                <input
                  type="number"
                  value={faqForm.displayOrder}
                  onChange={(e) => setFaqForm({ ...faqForm, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-50 border rounded py-1.5 px-2 text-xs focus-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase">Answer Details</label>
              <textarea
                rows={4}
                required
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                placeholder="Write the FAQ answer..."
                className="w-full bg-neutral-50 border rounded py-1.5 px-2.5 text-xs resize-none focus-ring"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button 
                type="button" 
                onClick={() => setFaqModalOpen(false)} 
                className="px-3 py-1.5 border rounded text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus-ring"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-1.5 rounded text-xs font-bold hover:opacity-90 active:scale-95 transition-all focus-ring"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BlogFAQ;
