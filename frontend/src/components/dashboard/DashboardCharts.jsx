import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1e2832] border border-neutral-200 dark:border-neutral-700/80 rounded-md p-2.5 shadow-lg text-xs">
        <p className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">{label}</p>
        <p className="text-neutral-700 dark:text-neutral-200 font-medium">
          Inquiries: <span className="font-bold text-[#D4AF37]">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1e2832] border border-neutral-200 dark:border-neutral-700/80 rounded-md p-2.5 shadow-lg text-xs">
        <p className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">{payload[0].name}</p>
        <p className="text-neutral-700 dark:text-neutral-200 font-medium">
          Count: <span className="font-bold text-[#D4AF37]">{payload[0].value} projects</span>
        </p>
      </div>
    );
  }
  return null;
};

const DashboardCharts = ({ monthlyInquiries, projectsByCategory }) => {
  const PIE_COLORS = ['#0A2540', '#D4AF37', '#6B7280', '#B8941F', '#1e3a5f'];

  const cardStyle = {
    background: 'var(--arch-surface, white)',
    border: '1px solid var(--arch-border, rgba(10,37,64,0.08))',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Inquiries Bar Chart */}
      <div className="lg:col-span-2 rounded-lg p-4 md:p-6 dark:bg-neutral-900 dark:border-neutral-800" style={cardStyle}>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4" style={{ color: '#D4AF37' }} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2540] dark:text-neutral-100">Monthly Client Inquiries</h2>
        </div>
        <div className="h-[260px] w-full">
          {monthlyInquiries && monthlyInquiries.some(m => m.inquiries > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyInquiries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(10,37,64,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(10,37,64,0.03)' }} />
                <Bar dataKey="inquiries" fill="#0A2540" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
              No inquiries submitted in the current year.
            </div>
          )}
        </div>
      </div>

      {/* Projects by Category Donut */}
      <div className="rounded-lg p-4 md:p-6 dark:bg-neutral-900 dark:border-neutral-800" style={cardStyle}>
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-4 h-4" style={{ color: '#D4AF37' }} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A2540] dark:text-neutral-100">Projects by Category</h2>
        </div>
        <div className="h-[260px] w-full flex flex-col justify-between">
          {projectsByCategory && projectsByCategory.length > 0 ? (
            <>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={projectsByCategory} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {projectsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-neutral-500 mt-2">
                {projectsByCategory.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span className="truncate">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
              No project records registered.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
