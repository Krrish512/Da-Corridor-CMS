import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HardDrive, Download, Trash2, Shield, RefreshCw, AlertTriangle, CheckCircle2, FileJson } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const SystemBackup = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();

  const [backupType, setBackupType] = useState('FULL');

  // Query backups list
  const { data: backups, isLoading, isError, refetch } = useQuery({
    queryKey: ['systemBackups'],
    queryFn: () => api.get('/backups').then((res) => res.data),
    enabled: currentUser?.role === 'SUPER_ADMIN',
  });

  // Create Backup Mutation
  const createBackupMutation = useMutation({
    mutationFn: (type) => api.post('/backups', { type }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['systemBackups']);
      addToast(`Backup archive "${res.data.filename}" generated successfully!`, 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Failed to generate backup archive', 'error');
    },
  });

  // Delete Backup Mutation
  const deleteBackupMutation = useMutation({
    mutationFn: (filename) => api.delete(`/backups/${filename}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['systemBackups']);
      addToast('Backup archive deleted.', 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Failed to delete backup file', 'error');
    },
  });

  const handleDownload = async (filename) => {
    try {
      const res = await api.get(`/backups/${filename}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast(`Backup file "${filename}" downloaded successfully!`, 'success');
    } catch (err) {
      console.error('[BACKUP DOWNLOAD ERROR]:', err);
      addToast(err.response?.data?.message || 'Failed to download backup file.', 'error');
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl max-w-lg mx-auto">
        <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">Super Admin Restricted</h3>
        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
          System backup and restore tools are restricted exclusively to Super Admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in select-none max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-[#D4AF37]" /> System Backup & Disaster Recovery
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Generate, download, and manage database dumps and system snapshots. Restricted to Super Admin.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Refresh Backups List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Backup Creation Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-premium space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" /> Create Manual Backup Archive
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Select Backup Type
            </label>
            <select
              value={backupType}
              onChange={(e) => setBackupType(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="FULL">Full Database Snapshot (All 17 CMS Models)</option>
              <option value="DB">Database Content Only</option>
            </select>
          </div>

          <button
            onClick={() => createBackupMutation.mutate(backupType)}
            disabled={createBackupMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold text-[#0A2540] transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow"
            style={{ background: '#D4AF37' }}
          >
            {createBackupMutation.isPending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#0A2540] border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <HardDrive className="w-4 h-4" /> Generate Backup Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between" style={{ background: '#0A2540' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <FileJson className="w-4 h-4 text-[#D4AF37]" /> Backup Archives History ({backups?.length || 0})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Loading backup archives...</div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-500">Failed to load backup archives list.</div>
        ) : backups?.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            No system backup archives found. Click "Generate Backup Now" to create your first snapshot.
          </div>
        ) : (
          <table className="w-full text-left text-xs divide-y divide-neutral-100 dark:divide-neutral-850">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/60 font-bold text-neutral-400">
                <th className="p-3.5">Archive Filename</th>
                <th className="p-3.5">Created Date & Time</th>
                <th className="p-3.5">File Size</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850 font-mono">
              {backups.map((item) => (
                <tr key={item.filename} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/10">
                  <td className="p-3.5 font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{item.filename}</span>
                  </td>
                  <td className="p-3.5 text-neutral-500 font-sans">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-neutral-500">{item.sizeKB} KB</td>
                  <td className="p-3.5 text-right flex justify-end gap-2 font-sans">
                    <button
                      onClick={() => handleDownload(item.filename)}
                      className="px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete backup file "${item.filename}"?`)) {
                          deleteBackupMutation.mutate(item.filename);
                        }
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-rose-500"
                      title="Delete Backup"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SystemBackup;
