import React from 'react';
import { UrgencyLevel } from '../../types';
import { AlertTriangle, Flame, Clock, ShieldCheck } from 'lucide-react';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, size = 'md' }) => {
  const getStyle = () => {
    switch (urgency) {
      case 'Status 1A (Critical)':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs',
          icon: <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />,
          label: 'Status 1A (Critical)',
          pulse: true,
        };
      case 'Status 1B (Urgent)':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Status 1B (Urgent)',
          pulse: false,
        };
      case 'Status 2 (Moderate)':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-300',
          icon: <Clock className="w-3.5 h-3.5 text-sky-600" />,
          label: 'Status 2 (Moderate)',
          pulse: false,
        };
      case 'Status 3 (Stable)':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Status 3 (Stable)',
          pulse: false,
        };
    }
  };

  const style = getStyle();
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-md border ${style.bg} ${sizeClass}`}>
      {style.icon}
      <span>{style.label}</span>
      {style.pulse && (
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
        </span>
      )}
    </span>
  );
};
