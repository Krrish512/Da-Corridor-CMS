import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Mail, CheckCircle2, Calendar, MapPin } from 'lucide-react';

import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import DynamicIcon from '../../components/ui/DynamicIcon';
import SEO from '../../components/common/SEO';

const HOME_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["ArchitecturalFirm", "LocalBusiness", "Organization"],
  "name": "Da' Corridor",
  "alternateName": "Da' Corridor Architecture & Spatial Design",
  "url": "https://dacorridor.com",
  "logo": "https://dacorridor.com/Da'%20Corridor.png",
  "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000",
  "description": "Da' Corridor is a luxury minimal architecture and spatial design practice based in New York crafting sustainable residences and corporate landmarks globally.",
  "telephone": "+1-212-555-0199",
  "email": "contact@dacorridor.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "740 Fifth Avenue, Suite 1800",
    "addressLocality": "New York",
    "addressRegion": "NY",
    "postalCode": "10019",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://facebook.com",
    "https://twitter.com",
    "https://linkedin.com",
    "https://instagram.com"
  ]
};

const getMediaType = (url) => {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'video';
};

const getYouTubeEmbedUrl = (url) => {
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) { videoId = match[2]; }
  else { const m = url.match(/embed\/([^#&?]+)/); if (m) videoId = m[1]; }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&enablejsapi=1&playsinline=1` : null;
};

const getVimeoEmbedUrl = (url) => {
  const match = url.match(/(?:videos?\/|channels\/(?:\w+\/)+|groups\/(?:\w+\/)+|album\/\d+\/video\/|vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
  const videoId = match ? match[1] : '';
  return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&playsinline=1` : null;
};

const Home = () => {
  const { addToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Static CMS content — increase staleTime to 10 min; these only change when an admin edits them
  const STATIC_QUERY_OPTIONS = { staleTime: 1000 * 60 * 10 };

  const { data: hero } = useQuery({
    queryKey: ['publicHero'],
    queryFn: () => api.get('/website/hero').then(r => r.data),
    placeholderData: {
      heading: 'Architecture\nThat Endures',
      subHeading: 'Crafting luxury spaces, sustainable structures, and minimal interiors for clients who demand the extraordinary.',
      ctaText: 'View Our Work',
      ctaLink: '/portfolio',
      backgroundImage: '',
      backgroundVideo: '',
    },
    ...STATIC_QUERY_OPTIONS,
  });

  const { data: achievements } = useQuery({ queryKey: ['publicAchievements'], queryFn: () => api.get('/website/achievements').then(r => r.data), ...STATIC_QUERY_OPTIONS });
  const { data: processSteps } = useQuery({ queryKey: ['publicProcess'], queryFn: () => api.get('/website/process').then(r => r.data), ...STATIC_QUERY_OPTIONS });
  const { data: whyChooseUs } = useQuery({ queryKey: ['publicWhyChooseUs'], queryFn: () => api.get('/website/why-choose-us').then(r => r.data), ...STATIC_QUERY_OPTIONS });
  const { data: featuredProjects } = useQuery({ queryKey: ['publicFeaturedProjects'], queryFn: () => api.get('/portfolio', { params: { featured: true, limit: 3 } }).then(r => r.data?.projects || []), ...STATIC_QUERY_OPTIONS });
  const { data: services } = useQuery({ queryKey: ['publicServicesHome'], queryFn: () => api.get('/services').then(r => r.data || []), ...STATIC_QUERY_OPTIONS });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await api.post('/newsletter/subscribe', { email: newsletterEmail });
      setSubscribed(true);
      addToast('Thank you for subscribing to our newsletter!', 'success');
      setNewsletterEmail('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Subscription failed. Please try again.', 'error');
    }
  };

  return (
    <div className="flex flex-col">
      <SEO
        title="Premium Architecture & Spatial Design"
        description="Crafting luxury minimal spaces, sustainable structures, and architectural landmarks for clients globally."
        path="/"
        schema={HOME_SCHEMA}
      />

      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: '#0A2540' }}>
        {/* Responsive Background Image (LCP Optimized - Only rendered when CMS background image exists) */}
        {Boolean(hero?.backgroundImage) && (
          <picture className="absolute inset-0 w-full h-full pointer-events-none">
            {hero.backgroundImage.includes('/hero/') && (
              <source
                type="image/webp"
                srcSet="/hero/hero-640w.webp 640w, /hero/hero-1024w.webp 1024w, /hero/hero-1920w.webp 1920w"
                sizes="100vw"
              />
            )}
            <img
              src={hero.backgroundImage}
              srcSet={hero.backgroundImage.includes('/hero/') ? "/hero/hero-640w.webp 640w, /hero/hero-1024w.webp 1024w, /hero/hero-1920w.webp 1920w" : undefined}
              sizes="100vw"
              width="1920"
              height="1080"
              alt="Da' Corridor Architecture Hero"
              loading="eager"
              fetchPriority="high"
              decoding="auto"
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ opacity: 0.35 }}
            />
          </picture>
        )}

        {/* Video background (YouTube / Vimeo / mp4) */}
        {hero?.backgroundVideo && !videoFailed && (() => {
          const mediaType = getMediaType(hero.backgroundVideo);
          const ytUrl = mediaType === 'youtube' ? getYouTubeEmbedUrl(hero.backgroundVideo) : null;
          const vimeoUrl = mediaType === 'vimeo' ? getVimeoEmbedUrl(hero.backgroundVideo) : null;
          if (mediaType === 'video') return (
            <video src={hero.backgroundVideo} autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.35 }}
              onError={() => setVideoFailed(true)} />
          );
          if (mediaType === 'youtube' && ytUrl) return (
            <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.35 }}>
              <iframe src={ytUrl} title="Hero video" frameBorder="0"
                allow="autoplay; encrypted-media"
                className="absolute pointer-events-none"
                style={{ top: '50%', left: '50%', width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh', transform: 'translate(-50%,-50%)' }} />
            </div>
          );
          if (mediaType === 'vimeo' && vimeoUrl) return (
            <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.35 }}>
              <iframe src={vimeoUrl} title="Hero video" frameBorder="0"
                allow="autoplay; fullscreen"
                className="absolute pointer-events-none"
                style={{ top: '50%', left: '50%', width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh', transform: 'translate(-50%,-50%)' }} />
            </div>
          );
          return null;
        })()}

        {/* Cinematic overlay */}
        <div className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(10,37,64,0.7) 0%, rgba(10,37,64,0.4) 50%, rgba(10,37,64,0.8) 100%)' }} />

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full">
          {/* Gold label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px" style={{ background: '#D4AF37' }} />
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] drop-shadow-sm">
              {hero?.tagline || 'Premium Architecture Studio'}
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight mb-8 max-w-4xl drop-shadow-md">
            {hero?.heading || 'Architecture\nThat Endures'}
          </h1>

          <p className="text-base sm:text-lg font-light leading-relaxed mb-10 max-w-xl text-white/85 drop-shadow-sm">
            {hero?.subHeading || 'Crafting luxury spaces, sustainable structures, and minimal interiors for clients who demand the extraordinary.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={hero?.ctaLink || '/portfolio'}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold uppercase tracking-wider rounded transition-all duration-200 bg-[#D4AF37] text-[#0A2540] hover:bg-[#B8941F] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(212,175,55,0.35)] active:scale-[0.98] focus-ring"
            >
              {hero?.ctaText || 'View Our Work'} <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold uppercase tracking-wider rounded transition-all duration-200 text-white border border-white/60 hover:border-[#D4AF37] hover:text-[#D4AF37] active:scale-[0.98] focus-ring"
            >
              Start a Project
            </Link>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/75">Scroll</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, #D4AF37, transparent)' }} />
        </div>
      </section>

      {/* ── 2. ACHIEVEMENTS / STATS BAR ──────────────────────────────────── */}
      {achievements && achievements.length > 0 && (
        <section style={{ background: '#0A2540', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((stat, idx) => (
                <div key={stat.id || idx} className="text-center">
                  <p className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#D4AF37' }}>
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wider mt-1 text-white/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. SERVICES OVERVIEW ─────────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#805B00] dark:text-[#D4AF37]">
                What We Do
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mt-2">
                Design & Build Services
              </h2>
              <div className="w-10 h-0.5 mt-3" style={{ background: '#D4AF37' }} />
            </div>
            <Link
              to="/services"
              className="text-sm font-semibold uppercase tracking-widest flex items-center gap-1 mt-4 sm:mt-0 transition-colors text-[#0A2540] dark:text-[#D4AF37] hover:text-[#D4AF37] dark:hover:text-white"
            >
              All Services <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services?.slice(0, 3).map((service, idx) => (
              <div
                key={service.id}
                className="p-8 rounded-sm bg-[#F7F7F5] dark:bg-neutral-800 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid rgba(10,37,64,0.08)' }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-bold" style={{ color: 'rgba(10,37,64,0.3)' }}>
                      0{idx + 1}
                    </span>
                    <span className="flex-1 h-px" style={{ background: 'rgba(10,37,64,0.08)' }} />
                  </div>
                  <div
                    className="h-11 w-11 rounded flex items-center justify-center mb-5"
                    style={{ background: '#0A2540' }}
                  >
                    <DynamicIcon name={service.icon} size={20} className="text-white" style={{ color: '#D4AF37' }} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 font-light text-sm leading-relaxed mb-6">
                    {service.shortDescription}
                  </p>
                </div>
                <Link
                  to="/services"
                  className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors text-[#805B00] dark:text-[#D4AF37] hover:text-[#B8941F] focus-ring rounded-sm w-fit"
                >
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED PROJECTS ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#F7F7F5] dark:bg-[#1A1A1A] border-t border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#805B00] dark:text-[#D4AF37]">
                Selected Works
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mt-2">
                Featured Portfolio
              </h2>
              <div className="w-10 h-0.5 mt-3" style={{ background: '#D4AF37' }} />
            </div>
            <Link
              to="/portfolio"
              className="text-sm font-semibold uppercase tracking-widest flex items-center gap-1 mt-4 sm:mt-0 transition-colors text-[#0A2540] dark:text-[#D4AF37] hover:text-[#D4AF37] dark:hover:text-white focus-ring rounded-sm"
            >
              View Full Gallery <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects?.map((project) => (
              <Link
                key={project.id}
                to="/portfolio"
                className="group relative h-96 overflow-hidden rounded-sm flex flex-col justify-end portfolio-card border border-neutral-200 dark:border-neutral-800 focus-ring"
              >
                <img
                  src={project.coverImage}
                  alt={project.title}
                  width="600"
                  height="400"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 z-0"
                />
                <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(10,37,64,0.9) 0%, rgba(10,37,64,0.3) 60%, transparent 100%)' }} />

                <div className="relative z-20 p-6 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#D4AF37' }}>
                    {project.category}
                  </span>
                  <h3 className="font-display text-xl font-bold mb-2">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-light text-white/80">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {project.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(project.completionDate).getFullYear()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PROCESS & WHY CHOOSE US ──────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* Process Steps */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#805B00] dark:text-[#D4AF37]">Work Method</span>
            <h2 className="font-display text-3xl font-bold text-neutral-900 dark:text-white mt-2 mb-12">
              The Design Process
            </h2>
            <div className="space-y-8">
              {processSteps?.map((step) => (
                <div key={step.id} className="flex gap-6">
                  <div
                    className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-sm font-bold font-display border-2 border-[#805B00] text-[#805B00] dark:border-[#D4AF37] dark:text-[#D4AF37]"
                  >
                    0{step.stepNumber}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm font-light text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#805B00] dark:text-[#D4AF37]">Principles</span>
            <h2 className="font-display text-3xl font-bold text-neutral-900 dark:text-white mt-2 mb-12">
              Why Partner With Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {whyChooseUs?.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-sm bg-[#F7F7F5] dark:bg-neutral-800 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ border: '1px solid rgba(10,37,64,0.08)' }}
                >
                  <div
                    className="h-10 w-10 rounded flex items-center justify-center mb-4"
                    style={{ background: '#0A2540' }}
                  >
                    <DynamicIcon name={item.icon} size={18} className="text-white" />
                  </div>
                  <h3 className="font-display text-base font-bold text-neutral-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs font-light text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. NEWSLETTER ────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#0A2540' }}>
        {/* Decorative gold radial */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at center, #D4AF37 0%, transparent 70%)' }} />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest block mb-4 text-[#D4AF37]">
            Updates
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
            Join the Da' Corridor Newsletter
          </h2>
          <p className="text-sm font-light mb-10 leading-relaxed text-white/85">
            Get quarterly design insights, architectural analysis, new project reveals, and sustainable materials reviews directly in your inbox.
          </p>

          {subscribed ? (
            <div
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37' }}
            >
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">Thank you! You have successfully subscribed.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-grow px-5 py-4 text-sm focus:outline-none rounded focus-ring bg-white/[0.08] border border-white/45 text-white placeholder:text-white/60"
              />
              <button
                type="submit"
                className="px-8 py-4 font-semibold uppercase tracking-wider text-sm flex items-center justify-center gap-2 rounded transition-all duration-200 bg-[#D4AF37] text-[#0A2540] hover:bg-[#B8941F] hover:-translate-y-0.5 active:scale-[0.98] focus-ring"
              >
                <Mail size={16} /> Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
