import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, Facebook, Twitter, Linkedin, Instagram 
} from 'lucide-react';

import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import SEO from '../../components/common/SEO';

const CONTACT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Da' Corridor Architecture",
  "description": "Connect with Da' Corridor for new project inquiries, consultation scheduling, and office location details.",
  "url": "https://dacorridor.com/contact",
  "mainEntity": {
    "@type": "Organization",
    "name": "Da' Corridor",
    "telephone": "+1-212-555-0199",
    "email": "contact@dacorridor.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "740 Fifth Avenue, Suite 1800",
      "addressLocality": "New York",
      "addressRegion": "NY",
      "postalCode": "10019",
      "addressCountry": "US"
    }
  }
};

const Contact = () => {
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  // Query Office Details — same queryKey as ClientLayout; TanStack Query deduplicates the fetch.
  // staleTime aligned to 10 min (matches ClientLayout) so cache behaviour is consistent.
  const { data: contactInfo, isLoading } = useQuery({
    queryKey: ['publicContactInfo'],
    queryFn: () => api.get('/contact/details').then(res => res.data),
    staleTime: 1000 * 60 * 10,
  });

  // Send message mutation
  const messageMutation = useMutation({
    mutationFn: (data) => api.post('/contact/messages', data),
    onSuccess: () => {
      setSubmitted(true);
      addToast('Your message has been sent successfully!', 'success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
      });
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Failed to send message. Please try again.', 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    messageMutation.mutate(formData);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SEO
        title="Contact Studio & Inquiries"
        description="Connect with Da' Corridor for new project inquiries, consultation scheduling, and office location details."
        path="/contact"
        schema={CONTACT_SCHEMA}
      />
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
          Connect With Us
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display text-neutral-950 dark:text-white mt-2">
          Contact Headquarters
        </h1>
        <div className="w-10 h-0.5 mx-auto mt-4" style={{ background: '#D4AF37' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        {/* Left Column: Office Details */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 bg-neutral-100 dark:bg-neutral-900/10 p-8 sm:p-10 rounded-sm border border-neutral-200 dark:border-neutral-800">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold font-display text-neutral-950 dark:text-white mb-6">
                Office Information
              </h3>
              <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                Have an upcoming custom spatial build or architectural inquiry? Fill out our form or call our office directly to discuss how we can execute your vision.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 animate-pulse" />
              </div>
            ) : contactInfo ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-neutral-900 dark:text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Office Address</h4>
                    <p className="text-sm text-neutral-800 dark:text-neutral-200 mt-1 font-light">{contactInfo.officeAddress}</p>
                    {contactInfo.googleMapsUrl && (
                      <a 
                        href={contactInfo.googleMapsUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-semibold text-neutral-950 dark:text-white hover:underline mt-1 inline-block focus-ring rounded-sm"
                      >
                        Open in Google Maps
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-neutral-900 dark:text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Phone & WhatsApp</h4>
                    <p className="text-sm text-neutral-800 dark:text-neutral-200 mt-1 font-light">{contactInfo.phone}</p>
                    {contactInfo.whatsApp && (
                      <p className="text-xs text-neutral-500 mt-0.5 font-light">WhatsApp: {contactInfo.whatsApp}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-neutral-900 dark:text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Email Inquiry</h4>
                    <a href={`mailto:${contactInfo.email}`} className="text-sm text-neutral-850 dark:text-neutral-200 mt-1 font-light hover:underline block focus-ring rounded-sm">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                {contactInfo.workingHours && (
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-neutral-900 dark:text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Studio Hours</h4>
                      <p className="text-sm text-neutral-800 dark:text-neutral-200 mt-1 font-light">{contactInfo.workingHours}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-light text-neutral-400">Failed to load office details.</p>
            )}
          </div>

          {/* Social icons */}
          {contactInfo && (
            <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider mb-4">Follow Our Feed</h4>
              <div className="flex gap-4 text-neutral-500">
                {contactInfo.socialFacebook && (
                  <a href={contactInfo.socialFacebook} target="_blank" rel="noreferrer" className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-colors focus-ring">
                    <Facebook size={18} />
                  </a>
                )}
                {contactInfo.socialTwitter && (
                  <a href={contactInfo.socialTwitter} target="_blank" rel="noreferrer" className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-colors focus-ring">
                    <Twitter size={18} />
                  </a>
                )}
                {contactInfo.socialLinkedin && (
                  <a href={contactInfo.socialLinkedin} target="_blank" rel="noreferrer" className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-colors focus-ring">
                    <Linkedin size={18} />
                  </a>
                )}
                {contactInfo.socialInsta && (
                  <a href={contactInfo.socialInsta} target="_blank" rel="noreferrer" className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-colors focus-ring">
                    <Instagram size={18} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 border border-neutral-200 dark:border-neutral-800 p-8 sm:p-10 rounded-sm bg-white dark:bg-neutral-900/10 flex flex-col justify-center">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold font-display text-neutral-950 dark:text-white">Message Transmitted</h2>
              <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                Thank you for your interest in Da' Corridor. Your project proposal or general inquiry has been saved. One of our design coordinators will follow up shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 bg-[#0A2540] text-white hover:bg-[#D4AF37] hover:text-[#0A2540] active:scale-[0.98] focus-ring"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold font-display text-neutral-950 dark:text-white mb-2">
                Send a Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Vance"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all text-neutral-900 dark:text-white focus-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all text-neutral-900 dark:text-white focus-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. elena@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all text-neutral-900 dark:text-white focus-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Residential Build Proposal"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all text-neutral-900 dark:text-white focus-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Your Message *</label>
                <textarea
                  rows="6"
                  required
                  placeholder="Detail your request, project dimensions, estimated budget, or structural specifications..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all text-neutral-900 dark:text-white focus-ring"
                />
              </div>

              <button
                type="submit"
                disabled={messageMutation.isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 bg-[#0A2540] text-white hover:bg-[#D4AF37] hover:text-[#0A2540] active:scale-[0.98] focus-ring"
              >
                <Send size={16} /> {messageMutation.isLoading ? 'Transmitting...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
