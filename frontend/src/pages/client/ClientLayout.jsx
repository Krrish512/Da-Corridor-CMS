import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sun, Moon, Menu, X, ArrowUpRight, MapPin, Phone, Mail } from 'lucide-react';

import api from '../../utils/api';

const navLinks = [
  { path: '/',          label: 'Home'      },
  { path: '/about',     label: 'About'     },
  { path: '/services',  label: 'Services'  },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/blog',      label: 'Blog'      },
  { path: '/comments',  label: 'Reviews'   },
  { path: '/contact',   label: 'Contact'   },
];

const ClientLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: contactInfo } = useQuery({
    queryKey: ['publicContactInfo'],
    queryFn: () => api.get('/contact/details').then(res => res.data),
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] dark:bg-[#1A1A1A] text-neutral-900 dark:text-white">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: darkMode
            ? (scrolled ? 'rgba(26,26,26,0.97)' : '#1A1A1A')
            : (scrolled ? 'rgba(255,255,255,0.97)' : '#ffffff'),
          borderBottom: darkMode
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(10,37,64,0.08)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 2px 20px rgba(10,37,64,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="h-9 w-9 rounded flex items-center justify-center font-display font-bold text-sm transition-all duration-200 group-hover:scale-105"
              style={{ background: '#0A2540', color: '#D4AF37' }}
            >
              Da'
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-widest uppercase" style={{ color: darkMode ? '#ffffff' : '#0A2540' }}>
                ArchStudio
              </span>
              <div className="hidden sm:block h-0.5 w-0 group-hover:w-full transition-all duration-300" style={{ background: '#D4AF37' }} />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-all duration-200 relative pb-1 ${
                    isActive ? 'font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`
                }
                style={({ isActive }) => isActive ? { color: darkMode ? '#D4AF37' : '#0A2540' } : {}}
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: '#D4AF37' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full border transition-all duration-200 hover:scale-105"
              style={{ borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(10,37,64,0.15)', color: darkMode ? '#d4d4d4' : '#6B7280' }}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={16} style={{ color: '#D4AF37' }} /> : <Moon size={16} />}
            </button>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200"
              style={{ background: '#D4AF37', color: '#0A2540' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#B8941F'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#D4AF37'; e.currentTarget.style.transform = 'none'; }}
            >
              Portal Login <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full border transition-colors"
              style={{ borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(10,37,64,0.15)' }}
            >
              {darkMode ? <Sun size={16} style={{ color: '#D4AF37' }} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 transition-colors"
              style={{ color: darkMode ? '#ffffff' : '#0A2540' }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(10,37,64,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed top-0 right-0 bottom-0 w-72 flex flex-col p-8"
            style={{ background: '#0A2540' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <span className="font-display font-bold text-base tracking-widest uppercase text-white">
                ArchStudio
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium tracking-wider py-2.5 transition-all duration-200 border-b"
                  style={({ isActive }) => ({
                    color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.75)',
                    borderColor: 'rgba(255,255,255,0.06)',
                  })}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded transition-all"
                style={{ background: '#D4AF37', color: '#0A2540' }}
              >
                Portal Login <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0A2540', color: 'rgba(255,255,255,0.7)' }}>
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: '#D4AF37' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="h-8 w-8 rounded flex items-center justify-center font-display font-bold text-sm"
                  style={{ background: '#D4AF37', color: '#0A2540' }}
                >
                  Da'
                </div>
                <span className="font-display font-bold text-lg tracking-widest uppercase text-white">
                  ArchStudio
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6 font-light">
                Crafting luxury space plans, sustainable architectures, and minimal interiors that endure.
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                &copy; {new Date().getFullYear()} ArchStudio. All rights reserved.
              </p>
            </div>

            {/* Exploration */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <span className="w-4 h-0.5 inline-block" style={{ background: '#D4AF37' }} />
                Exploration
              </h3>
              <ul className="space-y-4 text-sm font-light">
                {navLinks.slice(0, 4).map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Studio */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <span className="w-4 h-0.5 inline-block" style={{ background: '#D4AF37' }} />
                Studio
              </h3>
              <ul className="space-y-4 text-sm font-light">
                {navLinks.slice(4).map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="transition-colors"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get In Touch */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <span className="w-4 h-0.5 inline-block" style={{ background: '#D4AF37' }} />
                Get In Touch
              </h3>
              {contactInfo ? (
                <ul className="space-y-4 text-sm font-light">
                  <li className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: '#D4AF37' }} />
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{contactInfo.officeAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={16} className="shrink-0" style={{ color: '#D4AF37' }} />
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{contactInfo.phone}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={16} className="shrink-0" style={{ color: '#D4AF37' }} />
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="transition-colors"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    >
                      {contactInfo.email}
                    </a>
                  </li>
                </ul>
              ) : (
                <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>Connecting to headquarters...</p>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
