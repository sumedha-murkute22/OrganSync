import React from 'react';
import { OrganType } from '../../types';
import { Heart, Activity, Wind, ShieldAlert, Zap } from 'lucide-react';

interface OrganBadgeProps {
  type: OrganType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OrganBadge: React.FC<OrganBadgeProps> = ({ type, showIcon = true, size = 'md' }) => {
  const getColors = () => {
    switch (type) {
      case 'Heart':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Kidney':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Liver':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Lungs':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Pancreas':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getIcon = () => {
    const iconClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';
    switch (type) {
      case 'Heart':
        return <Heart className={`${iconClass} fill-rose-500/20 text-rose-600`} />;
      case 'Kidney':
        return <Activity className={`${iconClass} text-amber-600`} />;
      case 'Liver':
        return <Zap className={`${iconClass} text-emerald-600`} />;
      case 'Lungs':
        return <Wind className={`${iconClass} text-sky-600`} />;
      case 'Pancreas':
        return <ShieldAlert className={`${iconClass} text-purple-600`} />;
    }
  };

  const sizeClass = 
    size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' :
    size === 'lg' ? 'text-sm px-3 py-1.5 gap-2 font-semibold' :
    'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border ${getColors()} ${sizeClass}`}>
      {showIcon && getIcon()}
      <span>{type}</span>
    </span>
  );
};
