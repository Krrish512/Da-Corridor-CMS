import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sun, Moon, Menu, X, MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';

import api from '../../utils/api';
import PageTransition from '../../components/layout/PageTransition';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/blog', label: 'Blog' },
  { path: '/comments', label: 'Reviews' },
  { path: '/contact', label: 'Contact' },
];

const ClientLayout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: contactInfo } = useQuery({
    queryKey: ['publicContactInfo'],
    queryFn: () => api.get('/contact/details').then(res => res.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: systemSettings } = useQuery({
    queryKey: ['publicSystemSettings'],
    queryFn: () => api.get('/settings').then(res => res.data),
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

  // Global Keyboard Shortcut: Ctrl + Shift + A (Windows/Linux) or Cmd + Shift + A (macOS) & Escape to close menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isKeyA = e.code === 'KeyA' || (e.key && e.key.toLowerCase() === 'a');

      if (isCtrlOrCmd && isShift && isKeyA) {
        const active = document.activeElement;
        const isInput =
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT' ||
            active.isContentEditable ||
            active.getAttribute('contenteditable') === 'true');

        if (!isInput) {
          e.preventDefault();
          e.stopPropagation();
          navigate('/admin/login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [navigate, mobileMenuOpen]);

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
            ? (scrolled ? 'rgba(26,26,26,0.97)' : '#2f2f2fff')
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
              style={{ background: 'transparent', color: '#D4AF37' }}
            >
              <img src="/Da' Corridor.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-widest uppercase" style={{ color: darkMode ? '#ffffff' : '#0A2540' }}>
                Da' Corridor.
              </span>
              <div className="hidden sm:block h-0.5 w-0 group-hover:w-full transition-all duration-300" style={{ background: '#D4AF37' }} />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-colors duration-200 relative py-1 focus-ring rounded-sm group ${
                    isActive
                      ? 'font-semibold text-[#0A2540] dark:text-[#D4AF37]'
                      : 'font-medium text-neutral-600 dark:text-neutral-300 hover:text-[#805B00] dark:hover:text-[#D4AF37]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-transform duration-200 ease-out origin-center motion-reduce:transition-none ${
                        isActive
                          ? 'scale-x-100 bg-[#D4AF37]'
                          : 'scale-x-0 group-hover:scale-x-100 bg-[#D4AF37]/60'
                      }`}
                      aria-hidden="true"
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full border border-neutral-300/80 dark:border-white/15 text-neutral-600 dark:text-neutral-300 hover:text-[#805B00] dark:hover:text-[#D4AF37] hover:border-[#805B00]/40 dark:hover:border-[#D4AF37]/40 active:scale-95 transition-all duration-200 focus-ring"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={16} className="text-[#D4AF37]" /> : <Moon size={16} />}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full border border-neutral-300/80 dark:border-white/15 text-neutral-600 dark:text-neutral-300 hover:text-[#805B00] dark:hover:text-[#D4AF37] min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all duration-200 focus-ring"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={16} className="text-[#D4AF37]" /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-ring rounded hover:text-[#D4AF37] active:scale-95"
              style={{ color: darkMode ? '#ffffff' : '#0A2540' }}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer (smooth opening and closing CSS animation) */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-out motion-reduce:transition-none ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(10,37,64,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className={`fixed top-0 right-0 bottom-0 w-72 flex flex-col p-8 shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ background: '#0A2540' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="font-display font-bold text-base tracking-widest uppercase text-white">
              Da' Corridor
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/60 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus-ring rounded transition-colors duration-150"
              aria-label="Close Navigation Menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base tracking-wider py-3 min-h-[44px] flex items-center justify-between transition-colors duration-200 border-b border-white/10 focus-ring rounded-sm active:scale-[0.99] ${
                    isActive
                      ? 'font-semibold text-[#D4AF37]'
                      : 'font-medium text-white/75 hover:text-[#D4AF37]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" aria-hidden="true" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0A2540', color: 'rgba(255,255,255,0.7)' }}>
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: '#D4AF37' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

            {/* Brand Column */}
            <div>
              <Link
                to="/"
                className="group inline-flex items-center gap-3 mb-5 focus-ring rounded"
                aria-label="Da' Corridor Home"
              >
                <div
                  className="h-8 w-8 rounded flex items-center justify-center font-display font-bold text-sm transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"
                  style={{ background: 'transparent', color: '#0A2540' }}
                >
                  <img src="/Da' Corridor.png" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <span className="font-display font-bold text-lg tracking-widest uppercase text-white transition-colors duration-200 group-hover:text-[#D4AF37]">
                  Da' Corridor
                </span>
              </Link>
              <p className="text-sm leading-relaxed mb-5 font-light text-white/70 max-w-sm">
                Crafting luxury space plans, sustainable architectures, and minimal interiors that endure.
              </p>

              {/* Social Media Links from CMS */}
              {contactInfo && (contactInfo.socialFacebook || contactInfo.socialTwitter || contactInfo.socialLinkedin || contactInfo.socialInsta) && (
                <div className="flex items-center gap-3 mb-5">
                  {contactInfo.socialFacebook && (
                    <a
                      href={contactInfo.socialFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full border border-white/15 text-white/70 bg-white/[0.03] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-white/[0.08] active:scale-[0.97] transition-all duration-200 focus-ring"
                      aria-label="Facebook"
                    >
                      <Facebook size={16} />
                    </a>
                  )}
                  {contactInfo.socialTwitter && (
                    <a
                      href={contactInfo.socialTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full border border-white/15 text-white/70 bg-white/[0.03] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-white/[0.08] active:scale-[0.97] transition-all duration-200 focus-ring"
                      aria-label="Twitter / X"
                    >
                      <Twitter size={16} />
                    </a>
                  )}
                  {contactInfo.socialLinkedin && (
                    <a
                      href={contactInfo.socialLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full border border-white/15 text-white/70 bg-white/[0.03] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-white/[0.08] active:scale-[0.97] transition-all duration-200 focus-ring"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                  {contactInfo.socialInsta && (
                    <a
                      href={contactInfo.socialInsta}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full border border-white/15 text-white/70 bg-white/[0.03] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-white/[0.08] active:scale-[0.97] transition-all duration-200 focus-ring"
                      aria-label="Instagram"
                    >
                      <Instagram size={16} />
                    </a>
                  )}
                </div>
              )}

              <p className="text-xs text-white/70">
                {systemSettings?.footerText || `\u00A9 ${new Date().getFullYear()} Da' Corridor. All rights reserved.`}
              </p>
            </div>

            {/* Exploration */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 sm:mb-5 flex items-center gap-2">
                <span className="w-4 h-0.5 inline-block" style={{ background: '#D4AF37' }} />
                Exploration
              </h3>
              <ul className="space-y-3 text-sm font-light">
                {navLinks.slice(0, 4).map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-white/70 hover:text-[#D4AF37] motion-safe:hover:translate-x-0.5 transition-all duration-200 focus-ring rounded-sm inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Studio */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 sm:mb-5 flex items-center gap-2">
                <span className="w-4 h-0.5 inline-block" style={{ background: '#D4AF37' }} />
                Studio
              </h3>
              <ul className="space-y-3 text-sm font-light">
                {navLinks.slice(4).map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-white/70 hover:text-[#D4AF37] motion-safe:hover:translate-x-0.5 transition-all duration-200 focus-ring rounded-sm inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get In Touch */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 sm:mb-5 flex items-center gap-2">
                <span className="w-4 h-0.5 inline-block" style={{ background: '#D4AF37' }} />
                Get In Touch
              </h3>
              {contactInfo ? (
                <ul className="space-y-3 text-sm font-light">
                  <li className="flex items-start gap-3 group">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-[#D4AF37] group-hover:scale-110 transition-transform duration-200 motion-reduce:transform-none" />
                    <span className="text-white/70 group-hover:text-white transition-colors duration-200 break-words">{contactInfo.officeAddress}</span>
                  </li>
                  <li className="flex items-center gap-3 group">
                    <Phone size={16} className="shrink-0 text-[#D4AF37] group-hover:scale-110 transition-transform duration-200 motion-reduce:transform-none" />
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-white/70 hover:text-[#D4AF37] transition-colors duration-200 focus-ring rounded-sm inline-block break-words"
                    >
                      {contactInfo.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-3 group">
                    <Mail size={16} className="shrink-0 text-[#D4AF37] group-hover:scale-110 transition-transform duration-200 motion-reduce:transform-none" />
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-white/70 hover:text-[#D4AF37] transition-colors duration-200 focus-ring rounded-sm inline-block break-words"
                    >
                      {contactInfo.email}
                    </a>
                  </li>
                </ul>
              ) : (
                <p className="text-sm font-light text-white/50">Connecting to headquarters...</p>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
