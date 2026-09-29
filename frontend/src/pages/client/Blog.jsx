import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronDown, ChevronUp, Calendar, HelpCircle, X, ArrowRight, Tag 
} from 'lucide-react';

import api from '../../utils/api';
import SEO from '../../components/common/SEO';

const Blog = () => {
  // Accordion active indexes
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  // Selected blog article for overlay reading
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedArticle) {
        setSelectedArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArticle]);

  // Queries
  const { data: blogs, isLoading: blogsLoading } = useQuery({
    queryKey: ['publicBlogs'],
    queryFn: () => api.get('/blog', { params: { isPublic: true } }).then(res => res.data?.data || []),
    staleTime: 1000 * 60 * 5,
  });

  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['publicFaqs'],
    queryFn: () => api.get('/faqs').then(res => res.data || []),
    staleTime: 1000 * 60 * 10,
  });

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      <SEO
        title="Design Notebook & Architectural Insights"
        description="Quarterly design analysis, architectural insights, material reviews, and answers to frequently asked client questions."
        path="/blog"
      />
      
      {/* 1. BLOGS SECTION */}
      <section>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
            Design Notebook
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display text-neutral-950 dark:text-white mt-2">
            Insights & Articles
          </h1>
          <div className="w-10 h-0.5 mx-auto mt-4" style={{ background: '#D4AF37' }} />
        </div>

        {blogsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, idx) => (
              <div
                key={idx}
                className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/10 rounded-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] w-full arch-skeleton" />
                  <div className="p-6 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-3 w-16 arch-skeleton" />
                      <div className="h-3 w-20 arch-skeleton" />
                    </div>
                    <div className="h-5 w-5/6 arch-skeleton" />
                    <div className="flex gap-1.5 pt-1">
                      <div className="h-4 w-12 arch-skeleton" />
                      <div className="h-4 w-14 arch-skeleton" />
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-0">
                  <div className="h-4 w-24 arch-skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : !blogs || blogs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm text-neutral-400">
            No design articles published yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div 
                key={blog.id} 
                className="group border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900/10 rounded-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-neutral-400 font-light mb-3">
                      <span className="flex items-center gap-1 font-bold uppercase tracking-widest text-[9px]" style={{ color: '#D4AF37' }}>
                        {blog.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(blog.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold font-display text-neutral-950 dark:text-white leading-snug mb-3 line-clamp-2">
                      {blog.title}
                    </h2>

                    {blog.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {blog.tags.split(',').slice(0, 3).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.12)', color: '#B8941F' }}>
                            <Tag size={8} /> {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <button 
                    onClick={() => setSelectedArticle(blog)}
                    className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors text-[#D4AF37] hover:text-[#B8941F] focus-ring rounded-sm"
                  >
                    Read Article <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. FAQS SECTION */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
            Frequently Asked
          </span>
          <h2 className="text-3xl font-bold tracking-tight font-display text-neutral-950 dark:text-white mt-2">
            Design & Build FAQ
          </h2>
          <div className="w-10 h-0.5 mx-auto mt-4" style={{ background: '#D4AF37' }} />
        </div>

        {faqsLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="border border-neutral-200 dark:border-neutral-800 rounded-sm p-5 space-y-3">
                <div className="h-4 w-3/4 arch-skeleton" />
              </div>
            ))}
          </div>
        ) : !faqs || faqs.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            No questions populated. Contact our team if you need assistance.
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={faq.id} 
                  className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/10 rounded-sm overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-neutral-100/50 dark:hover:bg-neutral-900/40 transition-colors focus-ring"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-neutral-950 dark:text-white font-display flex items-center gap-3">
                      <HelpCircle size={18} className="shrink-0" style={{ color: '#D4AF37' }} />
                      {faq.question}
                    </span>
                    <span className="transition-transform duration-200 ease-out" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown size={18} className="text-neutral-500" />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pt-0 text-sm font-light text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ARTICLE READ DETAIL MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={() => setSelectedArticle(null)}>
          <div 
            className="bg-neutral-50 dark:bg-neutral-950 max-w-3xl w-full rounded-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col relative max-h-[90vh] shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute right-4 top-4 z-30 p-2 bg-neutral-900/60 hover:bg-neutral-900 text-white rounded-full transition-colors focus-ring"
              aria-label="Close Article Modal"
            >
              <X size={20} />
            </button>

            <div className="overflow-y-auto">
              <div className="h-64 sm:h-80 w-full relative">
                <img 
                  src={selectedArticle.featuredImage} 
                  alt={selectedArticle.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                    {selectedArticle.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display mt-1 leading-snug">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              <div className="p-8">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400 font-light pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-6">
                  <span>Published: {new Date(selectedArticle.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  {selectedArticle.tags && (
                    <div className="flex gap-1">
                      {selectedArticle.tags.split(',').map(tag => (
                        <span key={tag} className="bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-350 px-2 py-0.5 rounded-sm">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Article Body */}
                <div 
                  className="text-sm font-light text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap markdown-body"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.richText }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
