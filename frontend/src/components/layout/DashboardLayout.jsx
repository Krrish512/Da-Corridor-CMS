import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Menu, X, Sun, Moon, Bell, LogOut, Search, ChevronRight, User, Settings,
  LayoutDashboard, Globe, MessageSquare, Shield, FolderOpen, Mail, HardDrive,
  BookOpen, Eye, Award, Cpu, Star, Users, Link2, HelpCircle, Briefcase, FileText,
  Key, Activity, AlertCircle
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../common/NotificationCenter';

const UserProfileModal = lazy(() => import('../user/UserProfileModal'));

const DashboardLayout = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // User Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');

  // Dynamic Admin Page Titles
  useEffect(() => {
    const titleMap = {
      '/admin/dashboard': `Dashboard | Da' Corridor Admin`,
      '/admin/hero': `Hero Section CMS | Da' Corridor Admin`,
      '/admin/about': `About Studio CMS | Da' Corridor Admin`,
      '/admin/achievements': `Achievements CMS | Da' Corridor Admin`,
      '/admin/process': `Process Workflow CMS | Da' Corridor Admin`,
      '/admin/why-choose-us': `Why Choose Us CMS | Da' Corridor Admin`,
      '/admin/services': `Services CMS | Da' Corridor Admin`,
      '/admin/portfolio': `Portfolio Projects CMS | Da' Corridor Admin`,
      '/admin/gallery': `Image Gallery CMS | Da' Corridor Admin`,
      '/admin/testimonials': `Testimonials CMS | Da' Corridor Admin`,
      '/admin/team': `Team Members CMS | Da' Corridor Admin`,
      '/admin/partners': `Partners & Clients CMS | Da' Corridor Admin`,
      '/admin/faq': `FAQ CMS | Da' Corridor Admin`,
      '/admin/blog': `Blog Posts CMS | Da' Corridor Admin`,
      '/admin/messages': `Contact Inquiries | Da' Corridor Admin`,
      '/admin/newsletter': `Newsletter List | Da' Corridor Admin`,
      '/admin/seo': `SEO Config | Da' Corridor Admin`,
      '/admin/media-library': `Media Library | Da' Corridor Admin`,
      '/admin/settings': `System Config | Da' Corridor Admin`,
      '/admin/users': `User Management | Da' Corridor Admin`,
    };
    document.title = titleMap[location.pathname] || `Da' Corridor Admin Panel`;
  }, [location.pathname]);

  // Sync dark mode class
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Close overlays on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // Sidebar Menu Configuration (Filtered by permissions)
  const menuGroupsRaw = [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, permission: 'DASHBOARD_VIEW' },
      ]
    },
    {
      title: 'Website Content',
      items: [
        { label: 'Hero Section', path: '/admin/hero', icon: Globe, permission: 'HERO_MANAGE' },
        { label: 'About Studio', path: '/admin/about', icon: FileText, permission: 'ABOUT_MANAGE' },
        { label: 'Achievements', path: '/admin/achievements', icon: Award, permission: 'ABOUT_MANAGE' },
        { label: 'Process Workflow', path: '/admin/process', icon: Cpu, permission: 'ABOUT_MANAGE' },
        { label: 'Why Choose Us', path: '/admin/why-choose-us', icon: Shield, permission: 'ABOUT_MANAGE' },
        { label: 'Services', path: '/admin/services', icon: Briefcase, permission: 'SERVICES_MANAGE' },
        { label: 'Portfolio Projects', path: '/admin/portfolio', icon: HardDrive, permission: 'PORTFOLIO_READ' },
        { label: 'Image Gallery', path: '/admin/gallery', icon: FolderOpen, permission: 'GALLERY_MANAGE' },
        { label: 'Testimonials', path: '/admin/testimonials', icon: Star, permission: 'ABOUT_MANAGE' },
        { label: 'Team Members', path: '/admin/team', icon: Users, permission: 'ABOUT_MANAGE' },
        { label: 'Partners & Clients', path: '/admin/partners', icon: Link2, permission: 'ABOUT_MANAGE' },
        { label: 'FAQ', path: '/admin/faq', icon: HelpCircle, permission: 'BLOG_MANAGE' },
        { label: 'Blog Posts', path: '/admin/blog', icon: BookOpen, permission: 'BLOG_MANAGE' },
      ]
    },
    {
      title: 'Communications',
      items: [
        { label: 'Contact Inquiries', path: '/admin/messages', icon: MessageSquare, permission: 'CONTACT_MANAGE' },
        { label: 'Newsletter List', path: '/admin/newsletter', icon: Mail, permission: 'NEWSLETTER_MANAGE' },
      ]
    },
    {
      title: 'Settings & Media',
      items: [
        { label: 'SEO Config', path: '/admin/seo', icon: Eye, permission: 'SEO_MANAGE' },
        { label: 'Media Library', path: '/admin/media-library', icon: FolderOpen, permission: 'GALLERY_MANAGE' },
        { label: 'System Configuration', path: '/admin/settings', icon: Settings, permission: 'SETTINGS_MANAGE' },
      ]
    },
    {
      title: 'System Management',
      items: [
        { label: 'Users & Roles', path: '/admin/users', icon: Shield, permission: 'USERS_MANAGE' },
        { label: 'System Backups', path: '/admin/backups', icon: HardDrive, permission: 'SYSTEM_LOGS_VIEW' },
      ]
    }
  ];

  // Filter menu groups by user permissions
  const menuGroups = menuGroupsRaw.map(group => ({
    ...group,
    items: group.items.filter(item => !item.permission || hasPermission(item.permission))
  })).filter(group => group.items.length > 0);

  const openProfileTab = (tab = 'profile') => {
    setProfileModalTab(tab);
    setProfileModalOpen(true);
    setProfileDropdownOpen(false);
  };

  // Helper: Flatten menu items to find active labels for breadcrumbs
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Admin', path: '/admin/dashboard' }];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;

      let matchedLabel = segment.charAt(0).toUpperCase() + segment.slice(1);

      menuGroups.forEach(group => {
        group.items.forEach(item => {
          if (item.path === currentPath) {
            matchedLabel = item.label;
          }
        });
      });

      if (segment === 'admin') return;

      breadcrumbs.push({
        label: matchedLabel,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const activeBreadcrumbs = getBreadcrumbs();

  // Sidebar inner JSX
  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <span
            className="h-7 w-7 rounded flex items-center justify-center font-display font-bold text-xs tracking-wider shrink-0"
            style={{ background: 'transparent', color: '#0A2540' }}>
            <img src="/Da' Corridor.png" alt="Logo" className="h-full w-full object-contain" />
          </span>
          <span className="font-display font-bold text-sm tracking-widest uppercase text-white">
            Da' Corridor
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
            style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}
          >
            CMS
          </span>
        </Link>
      </div>

      {/* Sidebar Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest px-3 block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {group.title}
            </span>
            <ul className="space-y-0.5">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <li key={itemIdx}>
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all duration-200 relative"
                      style={{
                        color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.75)',
                        background: isActive ? 'rgba(212,175,55,0.12)' : 'transparent',
                        borderLeft: isActive ? '2px solid #D4AF37' : '2px solid transparent',
                      }}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="shrink-0 p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0"
            style={{ background: '#D4AF37', color: '#0A2540' }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              user?.name?.slice(0, 2) || 'AD'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white">{user?.name}</p>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider inline-block mt-0.5" style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'CO_ADMIN' ? 'Co-Admin' : 'Admin'}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1 transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--arch-bg, #F7F7F5)' }}>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialTab={profileModalTab}
      />

      {/* MOBILE SIDEBAR OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(10,37,64,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="fixed top-0 left-0 bottom-0 w-64 flex flex-col"
            style={{ background: '#0A2540' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute right-3 top-3">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0"
        style={{ background: '#0A2540' }}
      >
        <SidebarContent />
      </aside>

      {/* VIEWPORT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TEMPORARY PASSWORD WARNING BANNER */}
        {user?.mustChangePassword && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Security Notice: You are logged in with a temporary password. Please update your password immediately.</span>
            </div>
            <button
              onClick={() => openProfileTab('security')}
              className="bg-slate-950 text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-slate-800 transition-colors"
            >
              Update Password
            </button>
          </div>
        )}

        {/* TOP NAVBAR */}
        <header className="h-16 bg-white dark:bg-neutral-900 flex items-center justify-between px-4 md:px-6 shrink-0 z-10" style={{ borderBottom: '1px solid rgba(10,37,64,0.08)' }}>
          <div className="flex items-center gap-4">
            {/* Burger toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-900 dark:text-neutral-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* BREADCRUMB */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
              {activeBreadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />}
                  {idx === activeBreadcrumbs.length - 1 ? (
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* GLOBAL SEARCH */}
            <div className="relative max-w-[200px] md:max-w-xs w-full hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md py-1.5 pl-9 pr-4 text-xs focus:outline-none transition-all"
                style={{ borderColor: 'rgba(10,37,64,0.12)' }}
              />
            </div>

            {/* NOTIFICATION CENTER */}
            <NotificationCenter />

            {/* THEME TOGGLE */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              style={{ borderColor: 'rgba(10,37,64,0.12)', color: '#6B7280' }}
            >
              {darkMode ? <Sun className="w-4 h-4" style={{ color: '#D4AF37' }} /> : <Moon className="w-4 h-4" />}
            </button>

            {/* PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-md border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                style={{ borderColor: 'rgba(10,37,64,0.12)' }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: '#0A2540', color: '#D4AF37' }}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    user?.name?.slice(0, 1) || 'A'
                  )}
                </div>
                <span className="text-xs font-semibold hidden md:inline pr-1 text-neutral-700 dark:text-neutral-300">{user?.name || 'Admin'}</span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 rounded-lg shadow-arch-lg z-20 py-1 animate-scale-in border border-neutral-200 dark:border-neutral-800">
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{user?.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase inline-block mt-1" style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                      {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'CO_ADMIN' ? 'Co-Admin' : 'Admin'}
                    </span>
                  </div>

                  <button
                    onClick={() => openProfileTab('profile')}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-400" /> My Profile
                  </button>

                  <button
                    onClick={() => openProfileTab('security')}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <Key className="w-3.5 h-3.5 text-neutral-400" /> Change Password
                  </button>

                  <button
                    onClick={() => openProfileTab('activity')}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <Activity className="w-3.5 h-3.5 text-neutral-400" /> My Activity
                  </button>

                  <hr className="border-neutral-100 dark:border-neutral-800 my-1" />

                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 select-none bg-background text-foreground">
          <Outlet />
        </main>
      </div>

      <Suspense fallback={null}>
        {profileModalOpen && (
          <UserProfileModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            defaultTab={profileModalTab}
          />
        )}
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
