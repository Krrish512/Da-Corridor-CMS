import React, { useState, useEffect } from 'react';
import { X, User, Key, Activity, ShieldCheck, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const UserProfileModal = ({ isOpen, onClose, initialTab = 'profile' }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Form state
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Activity Log state
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
    setActiveTab(initialTab);
    setProfileMessage(null);
    setPasswordMessage(null);
  }, [user, isOpen, initialTab]);

  // Keyboard navigation: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && activeTab === 'activity') {
      fetchActivity();
    }
  }, [isOpen, activeTab]);

  const fetchActivity = async () => {
    setActivityLoading(true);
    try {
      const res = await api.get('/auth/my-activity');
      setActivities(res.data || []);
    } catch (err) {
      console.error('Failed to fetch user activity:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    const res = await updateProfile({ name, avatar });
    setProfileSaving(false);
    if (res.success) {
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setProfileMessage({ type: 'error', text: res.message });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setPasswordSaving(true);
    const res = await changePassword(currentPassword, newPassword);
    setPasswordSaving(false);

    if (res.success) {
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMessage({ type: 'error', text: res.message });
    }
  };

  const roleBadges = {
    SUPER_ADMIN: { label: 'Super Admin', bg: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '#D4AF37' },
    ADMIN: { label: 'Admin', bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '#3B82F6' },
    CO_ADMIN: { label: 'Co-Admin (Manager)', bg: 'rgba(16,185,129,0.15)', color: '#10B981', border: '#10B981' },
  };

  const currentBadge = roleBadges[user.role] || roleBadges.ADMIN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(10,37,64,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-scale-in flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800" style={{ background: '#0A2540' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: '#D4AF37', color: '#0A2540' }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                user.name?.slice(0, 2).toUpperCase() || 'AD'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">{user.name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase border" style={{ background: currentBadge.bg, color: currentBadge.color, borderColor: currentBadge.border }}>
                  {currentBadge.label}
                </span>
              </div>
              <p className="text-xs text-neutral-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-ring" aria-label="Close Profile Modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors focus-ring ${
              activeTab === 'profile'
                ? 'border-[#D4AF37] text-neutral-900 dark:text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <User className="w-4 h-4" /> My Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-[#D4AF37] text-neutral-900 dark:text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Key className="w-4 h-4" /> Change Password
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-[#D4AF37] text-neutral-900 dark:text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Activity className="w-4 h-4" /> My Activity
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: MY PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileMessage && (
                <div className={`p-3 rounded-md text-xs flex items-center gap-2 ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'}`}>
                  {profileMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {profileMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-md py-2 px-3 text-xs text-neutral-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">Email address cannot be changed directly for security reasons.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2 rounded-md text-xs font-bold text-[#0A2540] transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#D4AF37' }}
                >
                  {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordMessage && (
                <div className={`p-3 rounded-md text-xs flex items-center gap-2 ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'}`}>
                  {passwordMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {passwordMessage.text}
                </div>
              )}

              {user.mustChangePassword && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-800 dark:text-amber-300 rounded-md text-xs">
                  <span className="font-bold block mb-0.5">Temporary Password Detected</span>
                  Please update your password to a secure personal password.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-5 py-2 rounded-md text-xs font-bold text-[#0A2540] transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#D4AF37' }}
                >
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MY ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Recent Activity Logs</h3>
                <button onClick={fetchActivity} className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                  <RefreshCw className={`w-3.5 h-3.5 ${activityLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {activityLoading ? (
                <div className="py-8 text-center text-xs text-neutral-400">Loading activity...</div>
              ) : activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">No activity recorded yet.</div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {activities.map((item) => (
                    <div key={item.id} className="pt-2 pb-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0A2540] dark:text-[#D4AF37]">{item.action}</span>
                        <span className="text-[10px] text-neutral-400">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-300 mt-0.5">{item.details}</p>
                      {item.ipAddress && (
                        <span className="text-[9px] text-neutral-400 block mt-0.5">IP: {item.ipAddress}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
