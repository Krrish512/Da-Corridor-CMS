import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ClientLayout from './pages/client/ClientLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HeroAbout from './pages/HeroAbout';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import MediaLibrary from './pages/MediaLibrary';
import TestimonialsTeamPartners from './pages/TestimonialsTeamPartners';
import BlogFAQ from './pages/BlogFAQ';
import Inquiries from './pages/Inquiries';
import SettingsSEO from './pages/SettingsSEO';
import Home from './pages/client/Home';
import AboutUs from './pages/client/AboutUs';
import PublicServices from './pages/client/Services';
import PublicPortfolio from './pages/client/Portfolio';
import Comments from './pages/client/Comments';
import Contact from './pages/client/Contact';
import Blog from './pages/client/Blog';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
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
                  
                  <Route path="seo" element={<SettingsSEO />} />
                  <Route path="media-library" element={<MediaLibrary />} />
                  <Route path="settings" element={<SettingsSEO />} />
                </Route>
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
