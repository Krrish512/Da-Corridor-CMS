import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Menu, X, Sun, Moon, Bell, LogOut, Search, ChevronRight, User, Settings,
  LayoutDashboard, Globe, MessageSquare, Shield, FolderOpen, Mail, HardDrive,
  BookOpen, Eye, Award, Cpu, Star, Users, Link2, HelpCircle, Briefcase, FileText
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Admin Page Titles
  useEffect(() => {
    const titleMap = {
      '/admin/dashboard': 'Dashboard | ArchStudio Admin',
      '/admin/hero': 'Hero Section CMS | ArchStudio Admin',
      '/admin/about': 'About Studio CMS | ArchStudio Admin',
      '/admin/achievements': 'Achievements CMS | ArchStudio Admin',
      '/admin/process': 'Process Workflow CMS | ArchStudio Admin',
      '/admin/why-choose-us': 'Why Choose Us CMS | ArchStudio Admin',
      '/admin/services': 'Services CMS | ArchStudio Admin',
      '/admin/portfolio': 'Portfolio Projects CMS | ArchStudio Admin',
      '/admin/gallery': 'Image Gallery CMS | ArchStudio Admin',
      '/admin/testimonials': 'Testimonials CMS | ArchStudio Admin',
      '/admin/team': 'Team Members CMS | ArchStudio Admin',
      '/admin/partners': 'Partners & Clients CMS | ArchStudio Admin',
      '/admin/faq': 'FAQ CMS | ArchStudio Admin',
      '/admin/blog': 'Blog Posts CMS | ArchStudio Admin',
      '/admin/messages': 'Contact Inquiries | ArchStudio Admin',
      '/admin/newsletter': 'Newsletter List | ArchStudio Admin',
      '/admin/seo': 'SEO Config | ArchStudio Admin',
      '/admin/media-library': 'Media Library | ArchStudio Admin',
      '/admin/settings': 'System Config | ArchStudio Admin',
    };
    document.title = titleMap[location.pathname] || 'ArchStudio Admin Panel';
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

  // Sidebar Menu Configuration
  const menuGroups = [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Website Content',
      items: [
        { label: 'Hero Section', path: '/admin/hero', icon: Globe },
        { label: 'About Studio', path: '/admin/about', icon: FileText },
        { label: 'Achievements', path: '/admin/achievements', icon: Award },
        { label: 'Process Workflow', path: '/admin/process', icon: Cpu },
        { label: 'Why Choose Us', path: '/admin/why-choose-us', icon: Shield },
        { label: 'Services', path: '/admin/services', icon: Briefcase },
        { label: 'Portfolio Projects', path: '/admin/portfolio', icon: HardDrive },
        { label: 'Image Gallery', path: '/admin/gallery', icon: FolderOpen },
        { label: 'Testimonials', path: '/admin/testimonials', icon: Star },
        { label: 'Team Members', path: '/admin/team', icon: Users },
        { label: 'Partners & Clients', path: '/admin/partners', icon: Link2 },
        { label: 'FAQ', path: '/admin/faq', icon: HelpCircle },
        { label: 'Blog Posts', path: '/admin/blog', icon: BookOpen },
      ]
    },
    {
      title: 'Communications',
      items: [
        { label: 'Contact Inquiries', path: '/admin/messages', icon: MessageSquare },
        { label: 'Newsletter List', path: '/admin/newsletter', icon: Mail },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'SEO Config', path: '/admin/seo', icon: Eye },
        { label: 'Media Library', path: '/admin/media-library', icon: FolderOpen },
        { label: 'System Configuration', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

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

  // Sidebar inner JSX (shared between desktop & mobile)
  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <span
            className="h-7 w-7 rounded flex items-center justify-center font-display font-bold text-xs tracking-wider shrink-0"
            style={{ background: '#D4AF37', color: '#0A2540' }}
          >
            Da'
          </span>
          <span className="font-display font-bold text-sm tracking-widest uppercase text-white">
            ArchStudio
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
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(212,175,55,0.06)';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                        }
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
            {user?.name?.slice(0, 2) || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white">{user?.name}</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{user?.email}</p>
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
                onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(10,37,64,0.12)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              style={{ borderColor: 'rgba(10,37,64,0.12)', color: '#6B7280' }}
            >
              {darkMode ? <Sun className="w-4 h-4" style={{ color: '#D4AF37' }} /> : <Moon className="w-4 h-4" />}
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-md border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors relative"
                style={{ borderColor: 'rgba(10,37,64,0.12)', color: '#6B7280' }}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#D4AF37' }} />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-lg shadow-arch-lg z-20 py-2 animate-scale-in" style={{ border: '1px solid rgba(10,37,64,0.1)' }}>
                  <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(10,37,64,0.08)' }}>
                    <span className="text-xs font-bold" style={{ color: '#0A2540' }}>Notifications</span>
                    <span className="text-[10px] text-neutral-400 cursor-pointer hover:text-neutral-600">Mark all read</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto text-xs divide-y divide-neutral-100 dark:divide-neutral-800">
                    <div className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">New message from Arthur Pendelton</p>
                      <p className="text-neutral-400 mt-0.5">Subject: Custom Cabin Feasibility</p>
                      <span className="text-[10px] text-neutral-300 dark:text-neutral-600 block mt-1">10 mins ago</span>
                    </div>
                    <div className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">New Subscriber</p>
                      <p className="text-neutral-400 mt-0.5">arch.enthusiast@hotmail.com joined newsletter</p>
                      <span className="text-[10px] text-neutral-300 dark:text-neutral-600 block mt-1">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-md border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                style={{ borderColor: 'rgba(10,37,64,0.12)' }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#0A2540', color: '#D4AF37' }}
                >
                  {user?.name?.slice(0, 1) || 'A'}
                </div>
                <span className="text-xs font-semibold hidden md:inline pr-1 text-neutral-700 dark:text-neutral-300">{user?.name || 'Admin'}</span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-lg shadow-arch-lg z-20 py-1 animate-scale-in" style={{ border: '1px solid rgba(10,37,64,0.1)' }}>
                  <div className="px-4 py-2" style={{ borderBottom: '1px solid rgba(10,37,64,0.08)' }}>
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{user?.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
                  </div>
                  <Link to="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <User className="w-3.5 h-3.5" /> Profile Settings
                  </Link>
                  <Link to="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <Settings className="w-3.5 h-3.5" /> System Settings
                  </Link>
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
    </div>
  );
};

export default DashboardLayout;
