import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCheck,
  Trash2,
  Mail,
  FileText,
  Briefcase,
  Layers,
  Image,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import api from '../../utils/api';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'CONTACT_INQUIRY':
      return <Mail size={15} className="text-blue-500 shrink-0" />;
    case 'BLOG_SUBMITTED':
      return <FileText size={15} className="text-amber-500 shrink-0" />;
    case 'BLOG_APPROVED':
      return <FileText size={15} className="text-emerald-500 shrink-0" />;
    case 'BLOG_REJECTED':
      return <FileText size={15} className="text-rose-500 shrink-0" />;
    case 'PORTFOLIO_SUBMITTED':
      return <Briefcase size={15} className="text-amber-500 shrink-0" />;
    case 'PORTFOLIO_APPROVED':
      return <Briefcase size={15} className="text-emerald-500 shrink-0" />;
    case 'PORTFOLIO_REJECTED':
      return <Briefcase size={15} className="text-rose-500 shrink-0" />;
    case 'SERVICE_SUBMITTED':
      return <Layers size={15} className="text-amber-500 shrink-0" />;
    case 'SERVICE_APPROVED':
      return <Layers size={15} className="text-emerald-500 shrink-0" />;
    case 'SERVICE_REJECTED':
      return <Layers size={15} className="text-rose-500 shrink-0" />;
    case 'GALLERY_UPLOAD_SUCCESS':
      return <Image size={15} className="text-emerald-500 shrink-0" />;
    case 'GALLERY_UPLOAD_FAILED':
      return <Image size={15} className="text-rose-500 shrink-0" />;
    default:
      return <Bell size={15} className="text-neutral-400 shrink-0" />;
  }
};

const getEntityRoute = (entityType) => {
  switch (entityType) {
    case 'ContactMessage':
      return '/admin/messages';
    case 'BlogPost':
      return '/admin/blog';
    case 'Project':
      return '/admin/portfolio';
    case 'Service':
      return '/admin/services';
    case 'GalleryItem':
      return '/admin/gallery';
    default:
      return '/admin/dashboard';
  }
};

const getActionButtonText = (type) => {
  if (type.includes('SUBMITTED') || type.includes('INQUIRY')) return 'Review';
  if (type.includes('APPROVED') || type.includes('SUCCESS')) return 'Open';
  return 'View';
};

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Background refresh unread count every 30 seconds
  const { data: unreadData } = useQuery({
    queryKey: ['adminNotificationsUnread'],
    queryFn: () => api.get('/notifications/unread-count').then((res) => res.data),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const unreadCount = unreadData?.unreadCount || 0;

  // Fetch notification list when dropdown is opened
  const {
    data: listData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['adminNotificationsList'],
    queryFn: () => api.get('/notifications?limit=20').then((res) => res.data),
    enabled: isOpen,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const notifications = listData?.data || [];

  // Mutations with Optimistic Updates
  const markAsReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['adminNotificationsList'] });
      await queryClient.cancelQueries({ queryKey: ['adminNotificationsUnread'] });

      const prevList = queryClient.getQueryData(['adminNotificationsList']);
      const prevUnread = queryClient.getQueryData(['adminNotificationsUnread']);

      if (prevList?.data) {
        queryClient.setQueryData(['adminNotificationsList'], {
          ...prevList,
          data: prevList.data.map((item) =>
            item.id === id ? { ...item, isRead: true } : item
          ),
        });
      }

      if (prevUnread) {
        queryClient.setQueryData(['adminNotificationsUnread'], {
          unreadCount: Math.max(0, (prevUnread.unreadCount || 0) - 1),
        });
      }

      return { prevList, prevUnread };
    },
    onError: (err, id, context) => {
      if (context?.prevList) queryClient.setQueryData(['adminNotificationsList'], context.prevList);
      if (context?.prevUnread) queryClient.setQueryData(['adminNotificationsUnread'], context.prevUnread);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotificationsList'] });
      queryClient.invalidateQueries({ queryKey: ['adminNotificationsUnread'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['adminNotificationsList'] });
      await queryClient.cancelQueries({ queryKey: ['adminNotificationsUnread'] });

      const prevList = queryClient.getQueryData(['adminNotificationsList']);
      const prevUnread = queryClient.getQueryData(['adminNotificationsUnread']);

      if (prevList?.data) {
        queryClient.setQueryData(['adminNotificationsList'], {
          ...prevList,
          data: prevList.data.map((item) => ({ ...item, isRead: true })),
        });
      }

      queryClient.setQueryData(['adminNotificationsUnread'], { unreadCount: 0 });
      return { prevList, prevUnread };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotificationsList'] });
      queryClient.invalidateQueries({ queryKey: ['adminNotificationsUnread'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotificationsList'] });
      queryClient.invalidateQueries({ queryKey: ['adminNotificationsUnread'] });
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
    const targetRoute = getEntityRoute(notification.entityType);
    navigate(targetRoute);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse border-2 border-white dark:border-neutral-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-[#D4AF37] border border-amber-500/20 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-medium transition-opacity disabled:opacity-50"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
                <Loader2 size={24} className="animate-spin text-[#D4AF37]" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-xs text-rose-500 px-4">
                Failed to load notifications. Please try again.
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 px-4">
                <Bell size={28} className="mx-auto mb-2 opacity-30 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  No notifications
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  You're all caught up! Important CMS events will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex gap-3 items-start transition-colors group relative ${
                    !item.isRead
                      ? 'bg-amber-500/[0.03] dark:bg-amber-500/[0.05]'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  {/* Icon */}
                  <div className="mt-0.5 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          !item.isRead
                            ? 'text-neutral-900 dark:text-white'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {/* Actions bar */}
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={() => handleActionClick(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37] hover:underline"
                      >
                        {getActionButtonText(item.type)} <ExternalLink size={12} />
                      </button>

                      <div className="flex items-center gap-2">
                        {!item.isRead && (
                          <button
                            onClick={() => markAsReadMutation.mutate(item.id)}
                            className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotificationMutation.mutate(item.id)}
                          className="text-neutral-400 hover:text-rose-500 transition-colors p-1"
                          title="Delete notification"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Unread Indicator Dot */}
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
