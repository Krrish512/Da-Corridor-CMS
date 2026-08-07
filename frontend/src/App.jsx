import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ProtectedRoute from './components/layout/ProtectedRoute';
import ClientLayout from './pages/client/ClientLayout';
import Home from './pages/client/Home';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Lazy-loaded auth & layout components
const Login = lazy(() => import('./pages/Login'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));

// Lazy-loaded public client subpages
const AboutUs = lazy(() => import('./pages/client/AboutUs'));
const PublicServices = lazy(() => import('./pages/client/Services'));
const PublicPortfolio = lazy(() => import('./pages/client/Portfolio'));
const Comments = lazy(() => import('./pages/client/Comments'));
const Contact = lazy(() => import('./pages/client/Contact'));
const Blog = lazy(() => import('./pages/client/Blog'));

// Lazy-loaded Admin CMS pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HeroAbout = lazy(() => import('./pages/HeroAbout'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary'));
const TestimonialsTeamPartners = lazy(() => import('./pages/TestimonialsTeamPartners'));
const BlogFAQ = lazy(() => import('./pages/BlogFAQ'));
const Inquiries = lazy(() => import('./pages/Inquiries'));
const SettingsSEO = lazy(() => import('./pages/SettingsSEO'));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const SystemBackup = lazy(() => import('./pages/SystemBackup'));

// Reusable minimal loading fallback spinner
const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5,  // 5 minutes — page-level overrides apply for static CMS data
      gcTime: 1000 * 60 * 30,    // 30 minutes — keep cache hot across SPA page navigations
      retry: (failureCount, error) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                {/* Public visitor paths */}
                <Route element={<ClientLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<AboutUs />} />
                  <Route path="services" element={<PublicServices />} />
                  <Route path="portfolio" element={<PublicPortfolio />} />
                  <Route path="comments" element={<Comments />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="blog" element={<Blog />} />
                </Route>

                {/* Public login paths */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<Login />} />

                {/* Protected dashboard paths */}
                <Route path="/admin" element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    {/* Redirect base admin to dashboard */}
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* Website Section CMS */}
                    <Route path="hero" element={<HeroAbout />} />
                    <Route path="about" element={<HeroAbout />} />
                    <Route path="achievements" element={<HeroAbout />} />
                    <Route path="process" element={<HeroAbout />} />
                    <Route path="why-choose-us" element={<HeroAbout />} />
                    
                    <Route path="services" element={<Services />} />
                    <Route path="portfolio" element={<Portfolio />} />
                    <Route path="gallery" element={<MediaLibrary />} />
                    
                    <Route path="testimonials" element={<TestimonialsTeamPartners />} />
                    <Route path="team" element={<TestimonialsTeamPartners />} />
                    <Route path="partners" element={<TestimonialsTeamPartners />} />
                    
                    <Route path="faq" element={<BlogFAQ />} />
                    <Route path="blog" element={<BlogFAQ />} />
                    
                    <Route path="messages" element={<Inquiries />} />
                    <Route path="newsletter" element={<Inquiries />} />
                    
                    {/* Permission Protected Routes */}
                    <Route path="seo" element={<ProtectedRoute requiredPermission="SEO_MANAGE"><SettingsSEO /></ProtectedRoute>} />
                    <Route path="media-library" element={<MediaLibrary />} />
                    <Route path="settings" element={<ProtectedRoute requiredPermission="SETTINGS_MANAGE"><SettingsSEO /></ProtectedRoute>} />
                    <Route path="users" element={<ProtectedRoute requiredPermission="USERS_MANAGE"><UsersManagement /></ProtectedRoute>} />
                    <Route path="backups" element={<ProtectedRoute requiredPermission="SYSTEM_LOGS_VIEW"><SystemBackup /></ProtectedRoute>} />
                  </Route>
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
