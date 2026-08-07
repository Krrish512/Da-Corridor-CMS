import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition
 *
 * Wraps public page content with a subtle fade + slide-up entry animation.
 * The parent (ClientLayout) passes key={location.pathname} to this component
 * so React unmounts + remounts it on every route change, replaying the CSS
 * animation from the start.
 *
 * Animation: 250 ms ease-out opacity 0->1 + translateY 12px->0 (see index.css)
 * Accessibility: CSS @media (prefers-reduced-motion: reduce) disables animation.
 * Scroll: scrolls to top on each navigation, preserving browser history.
 * Scope: imported only by ClientLayout — admin/login routes are unaffected.
 *
 * LCP Optimization: The animation is skipped on the very first mount so the
 * hero section can paint immediately without being hidden by opacity:0.
 */

// Module-level flag: persists across component remounts but not page reloads.
let hasNavigated = false;

const PageTransition = ({ children }) => {
  const location = useLocation();

  // Scroll to top on every public-page navigation.
  // 'instant' avoids a visible scroll animation competing with the page transition.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // On initial page load, skip the animation so LCP image paints immediately.
  // On subsequent SPA navigations, apply the page-enter animation.
  const applyAnimation = hasNavigated;
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <div className={applyAnimation ? 'page-enter' : undefined}>
      {children}
    </div>
  );
};

export default PageTransition;

