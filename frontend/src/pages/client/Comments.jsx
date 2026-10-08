import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Quote, CheckCircle2, User } from 'lucide-react';

import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import SEO from '../../components/common/SEO';

const Comments = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    rating: 5,
    review: '',
  });

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['publicTestimonials'],
    queryFn: () => api.get('/testimonials').then(res => res.data || []),
    staleTime: 1000 * 60 * 5,
  });

  // Filter out only active testimonials
  const activeTestimonials = testimonials?.filter(item => item.isActive) || [];

  // Calculate average rating
  const averageRating = activeTestimonials.length > 0
    ? (activeTestimonials.reduce((acc, curr) => acc + curr.rating, 0) / activeTestimonials.length).toFixed(1)
    : '0.0';

  const saveMutation = useMutation({
    mutationFn: (data) => api.post('/testimonials', data),
    onSuccess: () => {
      setSubmitted(true);
      addToast('Review submitted successfully for moderation!', 'success');
      // Reset form
      setFormData({
        clientName: '',
        rating: 5,
        review: '',
      });
      queryClient.invalidateQueries(['publicTestimonials']);
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.review) {
      addToast('Please fill in your name and comment.', 'error');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleRatingClick = (val) => {
    setFormData(prev => ({ ...prev, rating: val }));
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SEO
        title="Client Reviews & Comments"
        description="Read verified reviews, experiences, and architectural feedback from Da' Corridor clients."
        path="/comments"
      />
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-[#805B00] dark:text-[#D4AF37]">
          Client Feedback
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display text-neutral-950 dark:text-white mt-2">
          Comments & Reviews
        </h1>
        <div className="w-10 h-0.5 mx-auto mt-4" style={{ background: '#D4AF37' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left column: Overview stats and Submit review card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/10 rounded-sm text-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-2">Average Rating</h3>
            <div className="text-6xl font-bold font-display text-neutral-950 dark:text-white mb-4">
              {activeTestimonials.length > 0 ? averageRating : '—'}
            </div>
            <div className="flex justify-center gap-1 text-amber-500 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  fill={activeTestimonials.length > 0 && star <= Math.round(parseFloat(averageRating)) ? 'currentColor' : 'none'} 
                  size={20} 
                />
              ))}
            </div>
            <p className="text-xs text-neutral-500 font-light">
              {activeTestimonials.length > 0 
                ? `Based on ${activeTestimonials.length} verified client reviews.`
                : 'No client reviews published yet.'}
            </p>

            <button
              onClick={() => {
                setFormOpen(true);
                setSubmitted(false);
              }}
              className="mt-8 w-full inline-flex items-center justify-center px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-neutral-900 hover:bg-neutral-800 dark:text-neutral-900 dark:bg-white dark:hover:bg-neutral-100 transition-all active:scale-[0.98] rounded-sm shadow-sm focus-ring"
            >
              Write a Comment
            </button>
          </div>

          {/* Comment submission form */}
          {formOpen && (
            <div className="p-8 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/10 rounded-sm animate-scale-in">
              <h3 className="text-lg font-bold font-display text-neutral-950 dark:text-white mb-6">
                Share Your Experience
              </h3>

              {submitted ? (
                <div className="space-y-4 text-center py-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-450 mb-2">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-base font-bold text-neutral-950 dark:text-white">Review Received</h4>
                  <p className="text-xs font-light text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Thank you for your feedback! Your comments have been submitted and will appear on the site once approved by our moderation team.
                  </p>
                  <button 
                    onClick={() => setFormOpen(false)}
                    className="text-xs font-bold uppercase tracking-wider underline hover:text-neutral-600 focus-ring rounded-sm"
                  >
                    Close Form
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Your name or company"
                      value={formData.clientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all text-neutral-900 dark:text-white focus-ring"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">Rating</label>
                    <div 
                      className="flex gap-2"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (hoverRating || formData.rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onFocus={() => setHoverRating(star)}
                            onBlur={() => setHoverRating(0)}
                            className="hover:scale-110 active:scale-95 transition-transform focus-ring rounded-sm p-0.5"
                            style={{ color: '#D4AF37' }}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            <Star 
                              size={24} 
                              fill={isFilled ? 'currentColor' : 'none'} 
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Your Comment</label>
                    <textarea 
                      rows="4"
                      required
                      placeholder="Share your thoughts about working with Da' Corridor..."
                      value={formData.review}
                      onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all text-neutral-900 dark:text-white focus-ring"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="flex-grow inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 bg-[#0A2540] text-white hover:bg-[#D4AF37] hover:text-[#0A2540] active:scale-[0.98] focus-ring"
                    >
                      {saveMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormOpen(false)}
                      className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors focus-ring"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right column: Comments/Reviews feed */}
        <div className="lg:col-span-8 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {Array(3).fill(0).map((_, idx) => (
                <div
                  key={idx}
                  className="p-8 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/10 rounded-sm space-y-4"
                >
                  <div className="flex gap-1">
                    {Array(5).fill(0).map((_, sIdx) => (
                      <div key={sIdx} className="h-4 w-4 arch-skeleton rounded-sm" />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full arch-skeleton" />
                    <div className="h-3 w-4/5 arch-skeleton" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-10 w-10 arch-skeleton rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 arch-skeleton" />
                      <div className="h-2.5 w-20 arch-skeleton" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTestimonials.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm text-neutral-400">
              No reviews available. Be the first to leave a comment!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeTestimonials.map((item) => (
                <div 
                  key={item.id} 
                  className="p-8 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/10 rounded-sm relative overflow-hidden group shadow-sm hover:shadow transition-shadow"
                >
                  <Quote className="absolute right-6 top-6 text-neutral-100 dark:text-neutral-900 size-16 pointer-events-none group-hover:scale-105 transition-transform duration-300" />
                  
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      {/* Rating stars */}
                      <div className="flex gap-1 mb-4" style={{ color: '#D4AF37' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={16} 
                            fill={star <= item.rating ? 'currentColor' : 'none'} 
                          />
                        ))}
                      </div>

                      {/* Comment text */}
                      <p className="text-sm font-light text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 italic">
                        "{item.review}"
                      </p>
                    </div>

                    {/* Author Meta */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="h-10 w-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                        {item.profileImage ? (
                          <img 
                            src={item.profileImage} 
                            alt={item.clientName} 
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <User size={16} className="text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-950 dark:text-white font-display">
                          {item.clientName}
                        </h4>
                        {(item.company || item.designation) && (
                          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#D4AF37' }}>
                            {item.designation} {item.company && `at ${item.company}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
