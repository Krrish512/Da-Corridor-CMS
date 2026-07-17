import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Target, Eye, Facebook, Twitter, Linkedin, Instagram 
} from 'lucide-react';

import api from '../../utils/api';

const AboutUs = () => {
  // Fetch About Section
  const { data: about } = useQuery({
    queryKey: ['publicAbout'],
    queryFn: () => api.get('/website/about').then(res => res.data),
  });

  // Fetch Team Members
  const { data: team } = useQuery({
    queryKey: ['publicTeam'],
    queryFn: () => api.get('/team').then(res => res.data || []),
  });

  // Fetch Partners
  const { data: partners } = useQuery({
    queryKey: ['publicPartners'],
    queryFn: () => api.get('/partners').then(res => res.data || []),
  });

  return (
    <div className="flex flex-col py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. TOP STUDIO OVERVIEW */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-24">
        {/* Profile Image container */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-neutral-900/10 dark:bg-white/10 rounded-sm transform translate-x-4 translate-y-4 -z-10" />
          <img 
            src={about?.profileImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600'} 
            alt={about?.name || ' Elena Vance - ArchStudio'} 
            className="w-full h-auto aspect-[4/5] object-cover object-center rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-md"
          />
        </div>

        {/* Bio content */}
        <div className="lg:col-span-7">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
            About Our Practice
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display text-neutral-950 dark:text-white mt-2 mb-6">
            {about?.name || 'ArchStudio Practice'}
          </h1>
          <p className="text-sm font-semibold tracking-wider text-neutral-400 uppercase mb-6">
            {about?.profession || 'High-End Minimalist Architecture'}
          </p>
          <p className="text-base text-neutral-600 dark:text-neutral-300 font-light leading-relaxed mb-6">
            {about?.about || 'A multi-disciplinary architecture and spatial planning firm based in New York. We craft timeless spaces globally.'}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-8">
            {about?.biography || 'Founded in 2012 by principal architect Elena Vance, ArchStudio has grown into a highly recognized brand. We believe in removing the unnecessary to celebrate the essential, creating residences and corporate structures that feel deeply connected to their environment.'}
          </p>

          {/* Skills / Focus areas tags */}
          {about?.skills && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-950 dark:text-white mb-3">
                Core Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.split(',').map((skill) => (
                  <span 
                    key={skill} 
                    className="text-xs font-medium bg-neutral-200 text-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300 px-3 py-1.5 rounded-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. VISION & MISSION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-neutral-200 dark:border-neutral-800 pt-16 mb-24">
        {about?.vision && (
          <div className="flex gap-6 items-start">
            <div className="h-12 w-12 rounded flex items-center justify-center shrink-0" style={{ background: '#0A2540' }}>
              <Eye className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-950 dark:text-white mb-3">
                Our Vision
              </h2>
              <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {about.vision}
              </p>
            </div>
          </div>
        )}
        {about?.mission && (
          <div className="flex gap-6 items-start">
            <div className="h-12 w-12 rounded flex items-center justify-center shrink-0" style={{ background: '#0A2540' }}>
              <Target className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-950 dark:text-white mb-3">
                Our Mission
              </h2>
              <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {about.mission}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 3. TEAM MEMBERS */}
      {team && team.length > 0 && (
        <section className="border-t border-neutral-200 dark:border-neutral-800 pt-16 mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
              Our Staff
            </span>
            <h2 className="text-3xl font-bold tracking-tight font-display text-neutral-950 dark:text-white mt-2">
              Meet the Design Team
            </h2>
            <div className="w-10 h-0.5 mx-auto mt-4" style={{ background: '#D4AF37' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div 
                key={member.id} 
                className="group border border-neutral-300/60 dark:border-neutral-800 bg-white dark:bg-neutral-900/10 rounded-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square relative overflow-hidden bg-neutral-100">
                    {member.photo ? (
                      <img 
                        src={member.photo} 
                        alt={member.name} 
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users size={40} className="text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white font-display">
                      {member.name}
                    </h3>
                    <p className="text-xs font-medium uppercase mt-1 mb-3" style={{ color: '#D4AF37' }}>
                      {member.position}
                    </p>
                    <p className="text-xs font-light text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  </div>
                </div>

                {/* Social icons */}
                <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800/80 flex gap-4 text-neutral-400">
                  {member.facebook && (
                    <a href={member.facebook} target="_blank" rel="noreferrer" className="transition-colors" style={{ color: 'rgba(107,114,128,1)' }} onMouseEnter={e => e.currentTarget.style.color='#D4AF37'} onMouseLeave={e => e.currentTarget.style.color='rgba(107,114,128,1)'}>
                      <Facebook size={16} />
                    </a>
                  )}
                  {member.twitter && (
                    <a href={member.twitter} target="_blank" rel="noreferrer" className="transition-colors" style={{ color: 'rgba(107,114,128,1)' }} onMouseEnter={e => e.currentTarget.style.color='#D4AF37'} onMouseLeave={e => e.currentTarget.style.color='rgba(107,114,128,1)'}>
                      <Twitter size={16} />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="transition-colors" style={{ color: 'rgba(107,114,128,1)' }} onMouseEnter={e => e.currentTarget.style.color='#D4AF37'} onMouseLeave={e => e.currentTarget.style.color='rgba(107,114,128,1)'}>
                      <Linkedin size={16} />
                    </a>
                  )}
                  {member.instagram && (
                    <a href={member.instagram} target="_blank" rel="noreferrer" className="transition-colors" style={{ color: 'rgba(107,114,128,1)' }} onMouseEnter={e => e.currentTarget.style.color='#D4AF37'} onMouseLeave={e => e.currentTarget.style.color='rgba(107,114,128,1)'}>
                      <Instagram size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. PARTNERS & CLIENT BRANDS */}
      {partners && partners.length > 0 && (
        <section className="border-t border-neutral-200 dark:border-neutral-800 pt-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
              Collaboration
            </span>
            <h2 className="text-3xl font-bold tracking-tight font-display text-neutral-950 dark:text-white mt-2">
              Trusted Partners & Clients
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-12 py-6 filter grayscale opacity-60 dark:invert">
            {partners.map((partner) => (
              <a 
                key={partner.id} 
                href={partner.websiteUrl || '#'} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:scale-105 transition-transform"
                title={partner.companyName}
              >
                <img 
                  src={partner.logo} 
                  alt={partner.companyName} 
                  className="h-10 w-auto object-contain"
                />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AboutUs;
