import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Grid, List, Search, Upload, Folder, Trash2, Eye, X, Plus, ChevronRight, Film
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const MediaLibrary = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Layout View State: 'grid' | 'list'
  const [layout, setLayout] = useState('grid');
  // Folder Level Navigation: e.g. 'root' or specific subfolders
  const [currentFolder, setCurrentFolder] = useState('root');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  // Lightbox Preview Image State
  const [previewItem, setPreviewItem] = useState(null);

  // Uploader/Folder creation states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('General');
  const [uploadFolder, setUploadFolder] = useState('root');
  
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);

  // Keyboard navigation: Escape closes open modal/lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (uploadModalOpen) setUploadModalOpen(false);
        if (previewItem) setPreviewItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [uploadModalOpen, previewItem]);

  // ----------------------------------------------------
  // QUERY
  // ----------------------------------------------------
  const { data: mediaData, isLoading, isError } = useQuery({
    queryKey: ['media', search, category, currentFolder],
    queryFn: () =>
      api
        .get('/gallery', {
          params: { search, category, folder: currentFolder },
        })
        .then((res) => res.data),
  });

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  const uploadMutation = useMutation({
    mutationFn: (formData) =>
      api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
      setUploadModalOpen(false);
      setUploadFile(null);
      addToast('File uploaded successfully to media library!', 'success');
    },
    onError: () => addToast('Failed to upload file.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
      setPreviewItem(null);
      addToast('Asset deleted.', 'success');
    },
    onError: () => addToast('Failed to delete asset.', 'error'),
  });

  // Handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFile) {
      addToast('Please pick a file to upload.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', uploadCategory);
    formData.append('folder', uploadFolder);

    uploadMutation.mutate(formData);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const cleanName = newFolderName.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    // Navigate into the folder to seed it
    setCurrentFolder(cleanName);
    setNewFolderName('');
    setShowFolderInput(false);
    addToast(`Folder "${cleanName}" created! Navigate and upload files.`, 'success');
  };

  return (
    <div className="space-y-8 animate-slide-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-display font-bold tracking-tight">Media Library</h1>
          <p className="text-xs text-neutral-400">Upload high-res images and videos, organized in folder pathways.</p>
        </div>
        
        <button
          onClick={() => { setUploadFolder(currentFolder); setUploadModalOpen(true); }}
          className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1 shadow"
        >
          <Upload className="w-4 h-4" /> Upload Asset
        </button>
      </div>

      {/* Directory Breadcrumbs & Views */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-850 pb-3">
        {/* Breadcrumb folder navigation */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
          <button
            onClick={() => setCurrentFolder('root')}
            className={`hover:text-neutral-900 ${currentFolder === 'root' ? 'text-neutral-900 dark:text-white' : ''}`}
          >
            Media Root
          </button>
          
          {currentFolder !== 'root' && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-neutral-900 dark:text-white">{currentFolder}</span>
            </>
          )}
        </div>

        {/* Filters and Layout triggers */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-neutral-900 border rounded py-1 pl-7 pr-3 text-[11px] focus:outline-none w-44"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white dark:bg-neutral-900 border rounded py-1 px-2.5 text-[11px] text-neutral-500 font-bold"
          >
            <option value="">All Tags</option>
            <option value="General">General</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Logo">Logo</option>
          </select>

          <div className="flex border rounded overflow-hidden">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1 ${layout === 'grid' ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1 border-l ${layout === 'list' ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Directory Folders Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {mediaData?.folders && mediaData.folders.filter(f => f !== 'root').map((fName, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentFolder(fName)}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-premium ${
              currentFolder === fName
                ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-white dark:bg-neutral-900 hover:border-neutral-400'
            }`}
          >
            <Folder className="w-4 h-4" />
            {fName}
          </button>
        ))}

        {/* Create folder inline prompt */}
        {showFolderInput ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="bg-white dark:bg-neutral-900 border rounded px-2 py-1 text-xs focus:outline-none w-28"
            />
            <button onClick={handleCreateFolder} className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 p-1.5 rounded"><Plus className="w-3.5 h-3.5" /></button>
            <button onClick={() => setShowFolderInput(false)} className="border p-1.5 rounded text-neutral-400 hover:text-neutral-600"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <button
            onClick={() => setShowFolderInput(true)}
            className="flex items-center gap-1.5 border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 px-3 py-1.5 rounded-lg text-xs text-neutral-400 font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Create Folder
          </button>
        )}
      </div>

      {/* MEDIA ASSETS RENDERING */}
      {isLoading ? (
        <div className="h-6 w-12 bg-neutral-200 animate-pulse rounded" />
      ) : isError ? (
        <div className="text-rose-500 text-xs font-semibold">Error retrieving library files.</div>
      ) : mediaData?.data?.length > 0 ? (
        <>
          {layout === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaData.data.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPreviewItem(item)}
                  className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-premium aspect-square cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col justify-center items-center"
                >
                  {item.type === 'VIDEO' ? (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                      <Film className="w-8 h-8 text-neutral-400" />
                      <span className="absolute bottom-2 left-2 text-[9px] bg-neutral-900/60 px-1 py-0.5 rounded text-white font-mono">VIDEO</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="bg-white text-neutral-900 p-2 rounded-full shadow hover:scale-115 transition-transform"><Eye className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-premium">
              <table className="w-full text-left text-xs divide-y divide-neutral-100 dark:divide-neutral-850">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900/60 font-bold text-neutral-400">
                    <th className="p-3">Asset</th>
                    <th className="p-3">File Path / URL</th>
                    <th className="p-3">Tag</th>
                    <th className="p-3 text-right">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                  {mediaData.data.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setPreviewItem(item)}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/10 cursor-pointer"
                    >
                      <td className="p-3 w-16">
                        {item.type === 'VIDEO' ? (
                          <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center"><Film className="w-4 h-4 text-neutral-400" /></div>
                        ) : (
                          <img src={item.url} alt="asset" className="w-10 h-10 object-cover rounded border" />
                        )}
                      </td>
                      <td className="p-3 font-semibold truncate max-w-xs">{item.url}</td>
                      <td className="p-3"><span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[10px] text-neutral-500 font-bold font-mono">{item.category}</span></td>
                      <td className="p-3 text-right text-neutral-400 text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="border border-dashed rounded-lg py-12 text-center text-neutral-400 text-xs">
          This folder is empty. Upload your first image or video.
        </div>
      )}

      {/* UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs animate-fade-in" onClick={() => setUploadModalOpen(false)}>
          <form
            onSubmit={handleUploadSubmit}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-premium-lg animate-scale-in"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold uppercase tracking-wider">Upload New Asset</h3>
              <button type="button" onClick={() => setUploadModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 focus-ring rounded p-1" aria-label="Close upload modal"><X className="w-4 h-4" /></button>
            </div>

            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100/50 cursor-pointer relative focus-ring">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-neutral-400 mb-2" />
              {uploadFile ? (
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate max-w-xs">{uploadFile.name}</span>
              ) : (
                <>
                  <span className="text-xs font-bold">Pick file or Drag & Drop</span>
                  <span className="text-[9px] text-neutral-400 mt-1">PNG, JPG, WEBP, or MP4 (Max 100MB)</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Category Tag</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1 px-2 text-xs focus-ring"
                >
                  <option value="General">General</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Logo">Logo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase">Target Folder</label>
                <input
                  type="text"
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded py-1 px-2.5 text-xs focus-ring"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button type="button" onClick={() => setUploadModalOpen(false)} className="px-3 py-1.5 border rounded text-xs focus-ring">Cancel</button>
              <button
                type="submit"
                disabled={uploadMutation.isPending}
                className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-1.5 rounded text-xs font-bold active:scale-[0.98] transition-all focus-ring"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PREVIEW LIGHTBOX */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 backdrop-blur-xs animate-fade-in" onClick={() => setPreviewItem(null)}>
          <div className="bg-white dark:bg-neutral-900 border rounded-lg max-w-xl w-full p-6 space-y-4 shadow-premium-lg animate-scale-in relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 focus-ring"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold uppercase tracking-wider pb-2 border-b">Asset Preview</h3>

            <div className="w-full aspect-video bg-neutral-900 rounded overflow-hidden flex items-center justify-center border">
              {previewItem.type === 'VIDEO' ? (
                <video src={previewItem.url} controls className="w-full h-full object-contain" />
              ) : (
                <img src={previewItem.url} alt="preview" className="w-full h-full object-contain" />
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-neutral-400 border-t pt-3">
              <div>
                <p className="font-bold text-neutral-800 dark:text-neutral-200">Category: <span className="font-mono">{previewItem.category}</span></p>
                <p className="text-[10px] mt-0.5 font-mono truncate max-w-xs">{previewItem.url}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this file from library?')) {
                    deleteMutation.mutate(previewItem.id);
                  }
                }}
                className="bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 p-2.5 rounded-md flex items-center gap-1 text-[11px] font-bold active:scale-[0.98] transition-all focus-ring"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
