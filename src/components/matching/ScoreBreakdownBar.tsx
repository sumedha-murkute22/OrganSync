import React from 'react';
import { ScoreBreakdown } from '../../types';

interface ScoreBreakdownBarProps {
  score: number;
  breakdown?: ScoreBreakdown;
  compact?: boolean;
}

export const ScoreBreakdownBar: React.FC<ScoreBreakdownBarProps> = ({
  score,
  breakdown,
  compact = false,
}) => {
  const getBadgeColor = (val: number) => {
    if (val >= 85) return 'text-emerald-800 bg-emerald-50 border-emerald-300';
    if (val >= 70) return 'text-teal-800 bg-teal-50 border-teal-300';
    if (val >= 50) return 'text-amber-800 bg-amber-50 border-amber-300';
    return 'text-rose-800 bg-rose-50 border-rose-300';
  };

  const getTierLabel = (val: number) => {
    if (val >= 85) return 'Tier 1 Prime Match';
    if (val >= 70) return 'Tier 2 High Compatibility';
    if (val >= 50) return 'Tier 3 Moderate Match';
    return 'Tier 4 Borderline Match';
  };

  if (compact || !breakdown) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className={`h-full ${
              score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-teal-600' : 'bg-amber-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${getBadgeColor(score)}`}>
          {score}/100
        </span>
      </div>
    );
  }

  // Multi-segment percentages based on maximum potential contributions
  const items = [
    { label: 'ABO Blood', val: breakdown.bloodScore, max: 15, color: 'bg-rose-500', name: 'ABO' },
    { label: 'HLA Alleles', val: breakdown.hlaScore, max: 25, color: 'bg-teal-600', name: 'HLA' },
    { label: 'Urgency', val: breakdown.urgencyScore, max: 30, color: 'bg-amber-500', name: 'Urgency' },
    { label: 'Shelf Life', val: breakdown.shelfLifeScore, max: 15, color: 'bg-sky-500', name: 'Ischemia' },
    { label: 'Waitlist', val: breakdown.waitTimeScore, max: 10, color: 'bg-purple-500', name: 'Wait' },
    { label: 'Distance', val: breakdown.distanceScore, max: 10, color: 'bg-indigo-500', name: 'Logistics' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm px-2.5 py-0.5 rounded-md font-mono font-black border ${getBadgeColor(score)}`}>
            {score} / 100
          </span>
          <span className="text-xs font-bold text-slate-800">
            {getTierLabel(score)}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono font-medium">Weighted Multi-Factor Score</span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 flex overflow-hidden gap-0.5 p-0.5 border border-slate-200">
        {items.map((item, idx) => {
          const widthPct = (item.val / 100) * 100;
          return (
            <div
              key={idx}
              className={`h-full rounded-xs transition-all duration-500 ${item.color}`}
              style={{ width: `${widthPct}%` }}
              title={`${item.label}: ${item.val} pts`}
            />
          );
        })}
      </div>

      {/* Legend Chips */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1 text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            <span>{item.name}: <strong className="text-slate-900">+{item.val}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
};
