import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, Layers, CheckSquare, Leaf, Hexagon, Shield, Award, Users, Briefcase, FileText, HelpCircle 
} from 'lucide-react';

import api from '../../utils/api';

const iconMap = {
  Compass: Compass,
  Layers: Layers,
  CheckSquare: CheckSquare,
  Leaf: Leaf,
  Hexagon: Hexagon,
  Shield: Shield,
  Award: Award,
  Users: Users,
  Briefcase: Briefcase,
  FileText: FileText
};

const DynamicIcon = ({ name, className, size = 24 }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent className={className} size={size} />;
};

const Services = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ['publicServicesPage'],
    queryFn: () => api.get('/services').then(res => res.data || []),
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
          Professional Expertise
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-display text-neutral-950 dark:text-white mt-2">
          Design & Consulting Services
        </h1>
        <div className="w-10 h-0.5 mx-auto mt-4" style={{ background: '#D4AF37' }} />
        <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 mt-6 max-w-xl mx-auto leading-relaxed">
          From residential spatial organization to massive multi-use master plans, we apply clean minimal parameters and high material standards.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-\[#0A2540\]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {services?.map((service) => (
            <div 
              key={service.id} 
              className="p-8 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/10 rounded-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded flex items-center justify-center shrink-0" style={{ background: '#0A2540' }}>
                    <DynamicIcon name={service.icon} size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-[#0A2540] dark:text-neutral-100">
                    {service.title}
                  </h2>
                </div>

                {service.image && (
                  <div className="w-full h-56 overflow-hidden rounded-sm mb-6 border border-neutral-100 dark:border-neutral-800">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-semibold mb-3">
                  {service.shortDescription}
                </p>
                
                <p className="text-sm text-neutral-600 dark:text-neutral-300 font-light leading-relaxed mb-6 whitespace-pre-line">
                  {service.fullDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
