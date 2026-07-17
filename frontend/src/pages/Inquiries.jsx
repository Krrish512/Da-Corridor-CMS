import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare, Mail, Download, Trash2, CheckCircle, Search, Eye, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const Inquiries = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Tab views: 'messages' | 'newsletter'
  const [activeTab, setActiveTab] = useState('messages');

  // Messages States
  const [msgSearch, setMsgSearch] = useState('');
  const [msgStatus, setMsgStatus] = useState('');
  const [msgPage, setMsgPage] = useState(1);
  const msgLimit = 10;

  // Newsletter Page
  const [newsPage, setNewsPage] = useState(1);
  const newsLimit = 15;

  // Active message detail lightbox
  const [selectedMsg, setSelectedMsg] = useState(null);

  // ----------------------------------------------------
  // QUERIES
  // ----------------------------------------------------
  const { data: messagesData, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', msgSearch, msgStatus, msgPage],
    queryFn: () =>
      api
        .get('/contact/messages', {
          params: { search: msgSearch, status: msgStatus, page: msgPage, limit: msgLimit },
        })
        .then((res) => res.data),
    enabled: activeTab === 'messages',
  });

  const { data: subscribersData, isLoading: newsLoading } = useQuery({
    queryKey: ['subscribers', newsPage],
    queryFn: () =>
      api.get('/newsletter', { params: { page: newsPage, limit: newsLimit } }).then((res) => res.data),
    enabled: activeTab === 'newsletter',
  });

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  // Message mutations
  const updateMsgStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/contact/messages/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      addToast('Message status marked!', 'success');
    },
  });

  const deleteMsgMutation = useMutation({
    mutationFn: (id) => api.delete(`/contact/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setSelectedMsg(null);
      addToast('Message deleted.', 'success');
    },
  });

  // Newsletter mutations
  const deleteSubMutation = useMutation({
    mutationFn: (id) => api.delete(`/newsletter/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscribers']);
      addToast('Subscriber unsubscribed and deleted.', 'success');
    },
  });

  // Helper trigger to download CSV files directly from browser
  const handleExportCSV = (endpoint, filename) => {
    // We request the CSV via an authenticated API call, convert to blob, and trigger a download link
    api.get(endpoint, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        addToast('CSV export downloaded successfully!', 'success');
      })
      .catch(() => addToast('Failed to export CSV.', 'error'));
  };

  const handleOpenMessage = (msg) => {
    setSelectedMsg(msg);
    // Mark as READ immediately if UNREAD
    if (msg.status === 'UNREAD') {
      updateMsgStatusMutation.mutate({ id: msg.id, status: 'READ' });
    }
  };

  const isGlobalLoading = (activeTab === 'messages' && msgsLoading) || (activeTab === 'newsletter' && newsLoading);

  return (
    <div className="space-y-8 animate-slide-in select-none max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-display font-bold tracking-tight">Communications Registry</h1>
          <p className="text-xs text-neutral-400">Review contact inquiries submitted from your site, and export newsletter subscribers.</p>
        </div>

        {activeTab === 'messages' ? (
          <button
            onClick={() => handleExportCSV('/contact/messages/export', 'inquiries.csv')}
            className="border hover:bg-neutral-50 dark:hover:bg-neutral-850 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        ) : (
          <button
            onClick={() => handleExportCSV('/newsletter/export', 'subscribers.csv')}
            className="border hover:bg-neutral-50 dark:hover:bg-neutral-850 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-850 gap-6 text-xs font-bold uppercase tracking-wider pb-px">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
            activeTab === 'messages'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Inquiries ({messagesData?.meta?.total || 0})
        </button>

        <button
          onClick={() => setActiveTab('newsletter')}
          className={`flex items-center gap-2 pb-3 border-b-2 -mb-px transition-all ${
            activeTab === 'newsletter'
              ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
              : 'border-transparent text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-300'
          }`}
        >
          <Mail className="w-4 h-4" /> Newsletter Subscriptions ({subscribersData?.meta?.total || 0})
        </button>
      </div>

      {/* RENDER VIEWS */}

      {/* Tab 1: Contact Messages */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-neutral-900 border p-4 rounded-lg shadow-premium">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search name, message..."
                value={msgSearch}
                onChange={(e) => { setMsgSearch(e.target.value); setMsgPage(1); }}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md py-1.5 pl-9 pr-3 text-xs focus:outline-none"
              />
            </div>
            
            <select
              value={msgStatus}
              onChange={(e) => { setMsgStatus(e.target.value); setMsgPage(1); }}
              className="bg-neutral-50 dark:bg-neutral-800 border rounded-md py-1.5 px-3 text-xs text-neutral-500 font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read Only</option>
              <option value="REPLIED">Replied Only</option>
            </select>
          </div>

          {isGlobalLoading ? (
            <div className="h-6 w-12 bg-neutral-200 animate-pulse rounded" />
          ) : messagesData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-premium overflow-hidden">
                <table className="w-full text-left text-xs divide-y divide-neutral-100 dark:divide-neutral-850">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900/60 font-bold text-neutral-400">
                      <th className="p-3">Client Details</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Brief Snippet</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                    {messagesData.data.map((msg) => (
                      <tr key={msg.id} className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-850/10 ${msg.status === 'UNREAD' ? 'font-bold' : ''}`}>
                        <td className="p-3">
                          <div className="text-neutral-900">{msg.name}</div>
                          <div className="text-[10px] text-neutral-400 font-semibold mt-0.5">{msg.email} • {msg.phone || 'No phone'}</div>
                        </td>
                        <td className="p-3 max-w-[150px] truncate">{msg.subject}</td>
                        <td className="p-3 text-neutral-400 max-w-[200px] truncate">{msg.message}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wider ${
                            msg.status === 'UNREAD'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/25 dark:text-rose-450'
                              : msg.status === 'REPLIED'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {msg.status}
                          </span>
                        </td>
                        <td className="p-3 text-right flex justify-end gap-2 mt-1">
                          <button
                            onClick={() => handleOpenMessage(msg)}
                            className="p-1 rounded text-neutral-500 hover:bg-neutral-50"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {msg.status !== 'REPLIED' && (
                            <button
                              onClick={() => updateMsgStatusMutation.mutate({ id: msg.id, status: 'REPLIED' })}
                              title="Mark as Replied"
                              className="p-1 rounded text-neutral-400 hover:text-emerald-600"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this inquiry?')) {
                                deleteMsgMutation.mutate(msg.id);
                              }
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {messagesData.meta?.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-neutral-400">Page <strong>{msgPage}</strong> of {messagesData.meta?.totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={msgPage === 1}
                      onClick={() => setMsgPage(p => p - 1)}
                      className="px-2.5 py-1.5 border rounded-md hover:bg-neutral-50 disabled:opacity-40 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <button
                      disabled={msgPage === messagesData.meta?.totalPages}
                      onClick={() => setMsgPage(p => p + 1)}
                      className="px-2.5 py-1.5 border rounded-md hover:bg-neutral-50 disabled:opacity-40 flex items-center gap-1 text-[11px] font-bold"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed rounded-lg py-12 text-center text-neutral-400 text-xs">
              No inquiries found in database.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Newsletter Subscribers */}
      {activeTab === 'newsletter' && (
        <div className="space-y-6 max-w-xl">
          {isGlobalLoading ? (
            <div className="h-6 w-12 bg-neutral-200 animate-pulse rounded" />
          ) : subscribersData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-premium overflow-hidden">
                <table className="w-full text-left text-xs divide-y divide-neutral-100 dark:divide-neutral-850">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900/60 font-bold text-neutral-400">
                      <th className="p-3">Subscriber Email</th>
                      <th className="p-3">Subscribed Date</th>
                      <th className="p-3 w-16 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                    {subscribersData.data.map((sub) => (
                      <tr key={sub.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/10">
                        <td className="p-3 font-semibold">{sub.email}</td>
                        <td className="p-3 text-neutral-400 text-[10px]">{new Date(sub.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Unsubscribe and delete "${sub.email}"?`)) {
                                deleteSubMutation.mutate(sub.id);
                              }
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {subscribersData.meta?.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-neutral-400">Page <strong>{newsPage}</strong> of {subscribersData.meta?.totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={newsPage === 1}
                      onClick={() => setNewsPage(p => p - 1)}
                      className="px-2.5 py-1.5 border rounded-md hover:bg-neutral-50 disabled:opacity-40 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <button
                      disabled={newsPage === subscribersData.meta?.totalPages}
                      onClick={() => setNewsPage(p => p + 1)}
                      className="px-2.5 py-1.5 border rounded-md hover:bg-neutral-50 disabled:opacity-40 flex items-center gap-1 text-[11px] font-bold"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed rounded-lg py-12 text-center text-neutral-400 text-xs">
              No newsletter subscribers.
            </div>
          )}
        </div>
      )}

      {/* DETAIL INQUIRY LIGHTBOX MODAL */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border rounded-lg max-w-md w-full p-6 space-y-4 shadow-premium-lg animate-slide-in relative">
            <button
              onClick={() => setSelectedMsg(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold uppercase tracking-wider pb-2 border-b">Inquiry Reader</h3>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-2 bg-neutral-50 dark:bg-neutral-850 p-3 rounded">
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase block">Sender Name</span>
                  <span className="font-bold text-neutral-850 dark:text-neutral-100">{selectedMsg.name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase block">Send Date</span>
                  <span className="font-semibold text-neutral-500">{new Date(selectedMsg.createdAt).toLocaleString()}</span>
                </div>
                <div className="col-span-2 mt-2">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase block">Email & Phone</span>
                  <span className="font-medium text-neutral-600 dark:text-neutral-350">{selectedMsg.email} • {selectedMsg.phone || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">Subject</span>
                <p className="font-bold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-850 py-1.5 px-2.5 rounded">{selectedMsg.subject}</p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">Message Body</span>
                <p className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded border border-neutral-100 text-neutral-600 dark:text-neutral-300 max-h-48 overflow-y-auto whitespace-pre-line leading-relaxed">
                  {selectedMsg.message}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedMsg(null)}
                className="px-3 py-1.5 border rounded text-xs"
              >
                Close
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete message?')) {
                    deleteMsgMutation.mutate(selectedMsg.id);
                  }
                }}
                className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
