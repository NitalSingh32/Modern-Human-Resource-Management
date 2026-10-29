import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  colorTheme?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

const themeStyles = {
  blue: {
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
    accent: 'bg-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    border: 'border-purple-100',
    accent: 'bg-purple-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
    accent: 'bg-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    border: 'border-amber-100',
    accent: 'bg-amber-600',
  },
  rose: {
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    border: 'border-rose-100',
    accent: 'bg-rose-600',
  },
  indigo: {
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    border: 'border-indigo-100',
    accent: 'bg-indigo-600',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorTheme = 'indigo',
}) => {
  const theme = themeStyles[colorTheme];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${theme.accent}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${theme.bg} ${theme.iconColor} ring-1 ring-black/5`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
