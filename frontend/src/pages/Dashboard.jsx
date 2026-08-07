import React, { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText, Briefcase, Star, MessageSquare, Mail, Layers, ArrowRight,
  TrendingUp, Clock, UserCheck
} from 'lucide-react';

import api from '../utils/api';

const DashboardCharts = lazy(() => import('../components/dashboard/DashboardCharts'));

const ChartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 h-[320px] bg-white dark:bg-neutral-900 rounded-lg p-4 animate-pulse" style={{ border: '1px solid rgba(10,37,64,0.08)' }} />
    <div className="h-[320px] bg-white dark:bg-neutral-900 rounded-lg p-4 animate-pulse" style={{ border: '1px solid rgba(10,37,64,0.08)' }} />
  </div>
);

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data;
    },
    refetchInterval: 30000,
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg p-8" style={{ borderColor: 'rgba(10,37,64,0.15)' }}>
        <p className="text-sm font-semibold text-rose-500">Failed to load analytics dashboard</p>
        <p className="text-xs text-neutral-400 mt-1">Make sure the backend is running and the database is migrated.</p>
      </div>
    );
  }

  // Brand-themed pie chart colors
  const PIE_COLORS = ['#0A2540', '#D4AF37', '#6B7280', '#B8941F', '#1e3a5f'];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse select-none">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-64 bg-neutral-100 dark:bg-neutral-850 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, idx) => (
            <div key={idx} className="h-28 bg-white dark:bg-neutral-900 rounded-lg p-4 space-y-3" style={{ border: '1px solid rgba(10,37,64,0.08)' }}>
              <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-6 w-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[320px] bg-white dark:bg-neutral-900 rounded-lg p-4" style={{ border: '1px solid rgba(10,37,64,0.08)' }} />
          <div className="h-[320px] bg-white dark:bg-neutral-900 rounded-lg p-4" style={{ border: '1px solid rgba(10,37,64,0.08)' }} />
        </div>
      </div>
    );
  }

  const { summary, projectsByCategory, monthlyInquiries, latestMessages, recentActivity } = data || {};

  const statCards = [
    { label: 'Total Projects',    value: summary?.totalProjects || 0,    icon: Layers,        path: '/admin/portfolio',     highlight: true  },
    { label: 'Active Services',   value: summary?.totalServices || 0,    icon: Briefcase,     path: '/admin/services',      highlight: false },
    { label: 'Testimonials',      value: summary?.totalTestimonials || 0, icon: Star,         path: '/admin/testimonials',  highlight: false },
    { label: 'Blog Posts',        value: summary?.totalBlogPosts || 0,   icon: FileText,      path: '/admin/blog',          highlight: false },
    { label: 'Unread Inquiries',  value: summary?.unreadMessages || 0,   icon: MessageSquare, path: '/admin/messages',      urgent: true     },
    { label: 'Subscribers',       value: summary?.totalSubscribers || 0, icon: Mail,          path: '/admin/newsletter',    highlight: false },
  ];

  const cardStyle = {
    background: 'var(--arch-surface, white)',
    border: '1px solid var(--arch-border, rgba(10,37,64,0.08))',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  };

  return (
    <div className="space-y-8 animate-slide-in select-none">

      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-display font-bold tracking-tight text-[#0A2540] dark:text-neutral-100">Studio Overview</h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-400">Review real-time client inquiries, blog metrics, and website modifications.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const isUrgent = card.urgent && card.value > 0;
          return (
            <Link
              key={idx}
              to={card.path}
              className="rounded-lg p-4 flex flex-col justify-between h-28 transition-all duration-200 group"
              style={{
                ...cardStyle,
                ...(isUrgent ? { borderColor: 'rgba(212,175,55,0.3)' } : {}),
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = isUrgent ? '#D4AF37' : 'var(--arch-border)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = isUrgent ? 'rgba(212,175,55,0.3)' : 'var(--arch-border)';
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">{card.label}</span>
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isUrgent 
                      ? 'text-[#D4AF37]' 
                      : card.highlight 
                      ? 'text-[#0A2540] dark:text-[#D4AF37]' 
                      : 'text-[#9CA3AF] dark:text-neutral-400'
                  }`}
                />
              </div>
              <div className="mt-4">
                <span
                  className={`text-2xl font-sans font-bold ${
                    isUrgent 
                      ? 'text-[#D4AF37]' 
                      : card.highlight 
                      ? 'text-[#0A2540] dark:text-[#D4AF37]' 
                      : 'text-[#1A1A1A] dark:text-white'
                  }`}
                >
                  {card.value}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts */}
      <Suspense fallback={<ChartSkeleton />}>
        <DashboardCharts monthlyInquiries={monthlyInquiries} projectsByCategory={projectsByCategory} />
      </Suspense>

      {/* Timelines & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Inquiries */}
        <div className="rounded-lg p-4 md:p-6 dark:bg-neutral-900 dark:border-neutral-800" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: '#D4AF37' }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2540] dark:text-neutral-100">Latest Inquiries</h2>
            </div>
            <Link
              to="/admin/messages"
              className="text-[10px] font-bold flex items-center gap-1 transition-colors text-neutral-400 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {latestMessages && latestMessages.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="font-bold text-neutral-400 dark:text-neutral-500">
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Subject</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800" style={{}}>
                  {latestMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 font-semibold text-neutral-800 dark:text-neutral-200">{msg.name}</td>
                      <td className="py-3 text-neutral-500 max-w-[150px] truncate">{msg.subject}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                            msg.status === 'UNREAD'
                              ? 'bg-amber-500/10 text-[#B8941F] dark:bg-amber-500/20 dark:text-[#D4AF37]'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[10px] text-neutral-400">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6 text-xs text-neutral-400">
                No inquiries. Feel free to submit the contact form on public page!
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="rounded-lg p-4 md:p-6 dark:bg-neutral-900 dark:border-neutral-800 flex flex-col" style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4" style={{ color: '#D4AF37' }} />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2540] dark:text-neutral-100">System Modification Log</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-2">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div key={log.id} className="flex gap-3 text-xs">
                  <div className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: '#D4AF37' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">{log.action}</p>
                    <p className="text-neutral-500 text-[11px] mt-0.5 leading-relaxed">{log.details}</p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {new Date(log.createdAt).toLocaleTimeString()}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><UserCheck className="w-2.5 h-2.5" /> {log.userEmail}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-neutral-400">
                No recent modifications logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
