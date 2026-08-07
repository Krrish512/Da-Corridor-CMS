import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Search, Filter, Shield, Edit3, Trash2, Key, Power,
  ChevronLeft, ChevronRight, Check, X, AlertTriangle, Copy, CheckCircle2, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const UsersManagement = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Filters state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected user state for modals
  const [selectedUser, setSelectedUser] = useState(null);

  // Form inputs
  const [formData, setFormData] = useState({ name: '', email: '', role: 'CO_ADMIN', password: '' });
  const [tempPasswordResult, setTempPasswordResult] = useState(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users', {
        params: {
          search,
          role: roleFilter,
          status: statusFilter,
          sortBy,
          sortOrder,
          page,
          limit: 10,
        },
      });
      setUsers(res.data.data || []);
      setMeta(res.data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch users:', err);
      const errMsg = err.response?.data?.message || 'Failed to load user accounts from server.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, sortBy, sortOrder, page, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/users', formData);
      addToast('User created successfully!', 'success');
      setTempPasswordResult({
        email: res.data.user.email,
        tempPassword: res.data.tempPassword,
      });
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await api.put(`/users/${selectedUser.id}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      addToast('User details updated successfully!', 'success');
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const nextStatus = !targetUser.isActive;
    try {
      await api.patch(`/users/${targetUser.id}/status`, { isActive: nextStatus });
      addToast(`User ${targetUser.email} ${nextStatus ? 'activated' : 'deactivated'}!`, 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change user status', 'error');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/users/${selectedUser.id}/reset-password`, {
        newPassword: formData.password || undefined,
      });
      addToast('Password reset successfully!', 'success');
      setTempPasswordResult({
        email: selectedUser.email,
        tempPassword: res.data.tempPassword,
      });
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await api.delete(`/users/${selectedUser.id}`);
      addToast('User soft-deleted successfully!', 'success');
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) {
          throw new Error('Fallback copy command failed');
        }
      }
      setCopiedPass(true);
      addToast('Temporary password copied to clipboard!', 'success');
      setTimeout(() => setCopiedPass(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      addToast('Failed to copy password. Please select and copy manually.', 'error');
    }
  };

  const openEditModal = (targetUser) => {
    setSelectedUser(targetUser);
    setFormData({
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      password: '',
    });
    setIsEditOpen(true);
  };

  const openResetPasswordModal = (targetUser) => {
    setSelectedUser(targetUser);
    setFormData({ ...formData, password: '' });
    setTempPasswordResult(null);
    setIsResetPasswordOpen(true);
  };

  const openDeleteModal = (targetUser) => {
    setSelectedUser(targetUser);
    setIsDeleteOpen(true);
  };

  const roleBadges = {
    SUPER_ADMIN: { label: 'Super Admin', bg: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '#D4AF37' },
    ADMIN: { label: 'Admin', bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '#3B82F6' },
    CO_ADMIN: { label: 'Co-Admin', bg: 'rgba(16,185,129,0.15)', color: '#10B981', border: '#10B981' },
  };

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: '#D4AF37' }} />
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">User Management</h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage system administrators, roles, permissions, and account statuses securely.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', email: '', role: 'CO_ADMIN', password: '' });
            setTempPasswordResult(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-[#0A2540] transition-all hover:opacity-90 shadow-sm shrink-0"
          style={{ background: '#D4AF37' }}
        >
          <UserPlus className="w-4 h-4" /> Create New User
        </button>
      </div>

      {/* SEARCH & FILTER CONTROLS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#D4AF37]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Admin</option>
          <option value="CO_ADMIN">Co-Admin (Manager)</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Deactivated Only</option>
        </select>

        {/* Sort selector */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="name-asc">Name (A - Z)</option>
          <option value="email-asc">Email (A - Z)</option>
          <option value="lastLoginAt-desc">Recent Login</option>
        </select>
      </div>

      {/* USERS DATA TABLE */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                      <span>Loading user accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-rose-500">
                      <AlertTriangle className="w-6 h-6" />
                      <span className="font-semibold text-xs">{error}</span>
                      <button
                        onClick={fetchUsers}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
                      <span className="font-semibold text-xs">No user accounts found</span>
                      <span className="text-[11px] text-neutral-400">Try adjusting your search query or filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const badge = roleBadges[item.role] || roleBadges.ADMIN;
                  const isSelf = currentUser?.id === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ background: '#0A2540', color: '#D4AF37' }}>
                            {item.avatar ? (
                              <img src={item.avatar} alt={item.name} className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                              item.name?.slice(0, 2).toUpperCase() || 'AD'
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900 dark:text-white">{item.name}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.2 rounded font-bold uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 block">{item.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border inline-block" style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Deactivated
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400">
                        {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString() : 'Never'}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit User */}
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit User"
                            className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => openResetPasswordModal(item)}
                            disabled={isSelf}
                            title={isSelf ? 'To change your own password, use Profile Settings' : 'Reset User Password'}
                            className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* Active Status Toggle */}
                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot deactivate self' : (item.isActive ? 'Deactivate User' : 'Activate User')}
                            className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              item.isActive ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => openDeleteModal(item)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot delete self' : 'Delete User'}
                            className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>
            Showing <strong className="text-neutral-900 dark:text-white">{users.length > 0 ? (page - 1) * meta.limit + 1 : 0}</strong> to <strong className="text-neutral-900 dark:text-white">{Math.min(page * meta.limit, meta.total)}</strong> of <strong className="text-neutral-900 dark:text-white">{meta.total}</strong> users
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} of {meta.totalPages || 1}</span>
            <button
              onClick={() => setPage(prev => Math.min(meta.totalPages, prev + 1))}
              disabled={page >= meta.totalPages}
              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-scale-in">
            <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800" style={{ background: '#0A2540' }}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4" style={{ color: '#D4AF37' }} /> Create New System User
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {tempPasswordResult ? (
              <div className="p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">User Account Created!</h4>
                <p className="text-xs text-neutral-500">
                  Temporary password for <strong>{tempPasswordResult.email}</strong>:
                </p>

                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-between font-mono text-sm font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                  <span>{tempPasswordResult.tempPassword}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(tempPasswordResult.tempPassword)}
                    title={copiedPass ? "Copied!" : "Copy to clipboard"}
                    className="p-1.5 text-neutral-500 hover:text-[#D4AF37] hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                  >
                    {copiedPass ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block">
                  Please copy and share this password securely. The user will be prompted to change password on first login.
                </span>

                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full py-2 rounded-lg text-xs font-bold text-[#0A2540]"
                  style={{ background: '#D4AF37' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                    placeholder="s.jenkins@dacorridor.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Assign Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="CO_ADMIN">Co-Admin (Manager — CMS Content Only)</option>
                    <option value="ADMIN">Admin (Full Content & Logs Access)</option>
                    {currentUser?.role === 'SUPER_ADMIN' && (
                      <option value="SUPER_ADMIN">Super Admin (Full Access + System & User Management)</option>
                    )}
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-md text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-md text-xs font-bold text-[#0A2540] transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#D4AF37' }}
                  >
                    {submitting ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-scale-in">
            <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800" style={{ background: '#0A2540' }}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4" style={{ color: '#D4AF37' }} /> Edit User Account
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Role</label>
                <select
                  value={formData.role}
                  disabled={currentUser?.id === selectedUser.id || (selectedUser.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN')}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="CO_ADMIN">Co-Admin (Manager — CMS Content Only)</option>
                  <option value="ADMIN">Admin (Full Content & Logs Access)</option>
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <option value="SUPER_ADMIN">Super Admin (Full Access + System & User Management)</option>
                  )}
                </select>
                {currentUser?.id === selectedUser.id && (
                  <span className="text-[10px] text-amber-600 block mt-1">Super Admin safety rule: You cannot demote your own role.</span>
                )}
                {selectedUser.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN' && (
                  <span className="text-[10px] text-[#f87171] block mt-1">Only a Super Admin can modify a Super Admin account.</span>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-md text-xs font-bold text-[#0A2540] transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#D4AF37' }}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPasswordOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-scale-in">
            <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800" style={{ background: '#0A2540' }}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4" style={{ color: '#D4AF37' }} /> Reset Password for {selectedUser.name}
              </h3>
              <button onClick={() => setIsResetPasswordOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {tempPasswordResult ? (
              <div className="p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Password Reset Complete!</h4>
                <p className="text-xs text-neutral-500">
                  New temporary password for <strong>{tempPasswordResult.email}</strong>:
                </p>

                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-between font-mono text-sm font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                  <span>{tempPasswordResult.tempPassword}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(tempPasswordResult.tempPassword)}
                    title={copiedPass ? "Copied!" : "Copy to clipboard"}
                    className="p-1.5 text-neutral-500 hover:text-[#D4AF37] hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                  >
                    {copiedPass ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => setIsResetPasswordOpen(false)}
                  className="w-full py-2 rounded-lg text-xs font-bold text-[#0A2540]"
                  style={{ background: '#D4AF37' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  You can specify a new password below or leave it blank to auto-generate a secure random temporary password.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Optional New Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to auto-generate"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordOpen(false)}
                    className="px-4 py-2 rounded-md text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-md text-xs font-bold text-[#0A2540] transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#D4AF37' }}
                  >
                    {submitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-scale-in">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Delete User Account?</h3>
              <p className="text-xs text-neutral-500">
                Are you sure you want to soft-delete <strong>{selectedUser.name}</strong> ({selectedUser.email})? This action will disable their access.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  disabled={submitting}
                  className="px-5 py-2 rounded-md text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersManagement;
