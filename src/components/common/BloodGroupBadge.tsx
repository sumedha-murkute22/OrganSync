import React from 'react';
import { BloodGroup } from '../../types';
import { Droplet } from 'lucide-react';

interface BloodGroupBadgeProps {
  bloodGroup: BloodGroup;
  size?: 'sm' | 'md' | 'lg';
}

export const BloodGroupBadge: React.FC<BloodGroupBadgeProps> = ({ bloodGroup, size = 'md' }) => {
  const isUniversalDonor = bloodGroup === 'O-';
  const isUniversalRecipient = bloodGroup === 'AB+';

  const sizeClass = 
    size === 'sm' ? 'text-xs px-2 py-0.5' : 
    size === 'lg' ? 'text-sm px-3 py-1 font-bold' : 
    'text-xs px-2.5 py-0.5 font-bold';

  return (
    <span className={`inline-flex items-center gap-1 rounded bg-slate-100 text-rose-800 border border-rose-200 ${sizeClass}`}>
      <Droplet className="w-3 h-3 text-rose-600 fill-rose-500/30" />
      <span>{bloodGroup}</span>
      {isUniversalDonor && (
        <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded ml-1 font-mono font-bold">
          Univ. Donor
        </span>
      )}
      {isUniversalRecipient && (
        <span className="text-[10px] bg-sky-100 text-sky-800 px-1 rounded ml-1 font-mono font-bold">
          Univ. Recipient
        </span>
      )}
    </span>
  );
};
