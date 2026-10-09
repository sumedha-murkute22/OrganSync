import React from 'react';
import { DonorOrgan } from '../../types';
import { CompatibilityScorer } from '../../dsa/CompatibilityScorer';
import { Clock, AlertCircle } from 'lucide-react';

interface ShelfLifeCountdownProps {
  organ: DonorOrgan;
  showBar?: boolean;
}

export const ShelfLifeCountdown: React.FC<ShelfLifeCountdownProps> = ({ organ, showBar = true }) => {
  const remainingHours = CompatibilityScorer.getRemainingShelfLifeHours(organ);
  const maxHours = organ.maxShelfLifeHours;
  const percentage = Math.min(100, Math.max(0, (remainingHours / maxHours) * 100));

  const isCritical = remainingHours < 3.0 || percentage < 25;
  const isWarning = remainingHours < 6.0 || percentage < 50;

  const colorClass = isCritical
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : isWarning
    ? 'text-amber-800 bg-amber-50 border-amber-200'
    : 'text-teal-800 bg-teal-50 border-teal-200';

  const barColor = isCritical
    ? 'bg-rose-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-teal-600';

  return (
    <div className="space-y-1.5">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border ${colorClass}`}>
        {isCritical ? (
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
        ) : (
          <Clock className="w-3.5 h-3.5" />
        )}
        <span>
          {remainingHours > 0 ? (
            <>
              <strong>{remainingHours}h</strong> / {maxHours}h cold ischemia
            </>
          ) : (
            <span className="text-rose-700 font-bold">ISCHEMIC EXPIRED</span>
          )}
        </span>
        {isCritical && remainingHours > 0 && (
          <span className="bg-rose-200 text-rose-900 text-[10px] px-1.5 py-0.2 rounded font-sans uppercase font-bold animate-pulse">
            Urgent Expiry
          </span>
        )}
      </div>

      {showBar && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
