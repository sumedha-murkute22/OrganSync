import React from 'react';
import { MatchResult } from '../../types';
import { Modal } from '../common/Modal';
import { OrganBadge } from '../common/OrganBadge';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { UrgencyBadge } from '../common/UrgencyBadge';
import { ShelfLifeCountdown } from '../common/ShelfLifeCountdown';
import { ScoreBreakdownBar } from './ScoreBreakdownBar';
import { 
  Activity, 
  CheckCircle2, 
  Truck, 
  Hospital
} from 'lucide-react';

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchResult | null;
  onAccept?: (matchId: string) => void;
  onReject?: (matchId: string) => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  isOpen,
  onClose,
  match,
  onAccept,
  onReject,
}) => {
  if (!match) return null;

  const { organ, recipient, scoreBreakdown, reasons, compatibilityScore, distanceKm } = match;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Clinical Match Audit [${match.id}]`}
      subtitle={`Rank #${match.rank} Match Recommendation (${compatibilityScore}/100 Score)`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Pair Comparison Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          {/* Left: Donor Organ */}
          <div className="space-y-3 p-4 rounded-xl bg-white border border-teal-200 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-100 text-teal-800 text-[10px] px-2.5 py-0.5 rounded-bl font-mono font-bold">
              DONOR GRAFT
            </div>
            <div className="flex items-center gap-2">
              <OrganBadge type={organ.organType} size="lg" />
              <BloodGroupBadge bloodGroup={organ.bloodGroup} />
            </div>
            <div className="space-y-1 text-xs">
              <div className="text-slate-900 font-bold text-sm">{organ.id} • {organ.donorName || 'Anonymous Donor'}</div>
              <div className="text-slate-600">Donor: {organ.donorAge} yrs • {organ.donorGender}</div>
              <div className="text-slate-600 flex items-center gap-1">
                <Hospital className="w-3.5 h-3.5 text-teal-600" />
                <span>{organ.hospital} ({organ.city})</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 mb-1 font-semibold">Tissue HLA Typing:</div>
              <div className="flex gap-1.5 font-mono text-[11px] text-teal-800 font-bold">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">A: {organ.hlaMarkers.hlaA}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">B: {organ.hlaMarkers.hlaB}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">DR: {organ.hlaMarkers.hlaDR}</span>
              </div>
            </div>

            <div className="pt-2">
              <ShelfLifeCountdown organ={organ} />
            </div>
          </div>

          {/* Right: Recipient Patient */}
          <div className="space-y-3 p-4 rounded-xl bg-white border border-sky-200 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-sky-100 text-sky-800 text-[10px] px-2.5 py-0.5 rounded-bl font-mono font-bold">
              RECIPIENT PATIENT
            </div>
            <div className="flex items-center gap-2">
              <UrgencyBadge urgency={recipient.urgency} />
              <BloodGroupBadge bloodGroup={recipient.bloodGroup} />
            </div>
            <div className="space-y-1 text-xs">
              <div className="text-slate-900 font-bold text-sm">{recipient.name} ({recipient.id})</div>
              <div className="text-slate-600">Patient: {recipient.age} yrs • {recipient.gender} • PRA {recipient.praScore}%</div>
              <div className="text-slate-600 flex items-center gap-1">
                <Hospital className="w-3.5 h-3.5 text-sky-600" />
                <span>{recipient.hospital} ({recipient.city})</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 mb-1 font-semibold">Recipient HLA Alleles:</div>
              <div className="flex gap-1.5 font-mono text-[11px] text-sky-800 font-bold">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">A: {recipient.hlaMarkers.hlaA}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">B: {recipient.hlaMarkers.hlaB}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">DR: {recipient.hlaMarkers.hlaDR}</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-600 flex items-center justify-between">
              <span>Waitlist Tenure:</span>
              <strong className="text-slate-900 font-mono">
                {Math.floor((Date.now() - new Date(recipient.registrationDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </strong>
            </div>
          </div>
        </div>

        {/* Multi-Factor Score Calculation Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" /> Algorithmic Compatibility Decomposition
          </h4>
          <ScoreBreakdownBar score={compatibilityScore} breakdown={scoreBreakdown} />
        </div>

        {/* Clinical Rationale Audit Checklist */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Allocation Decision Rationale
          </h4>
          <ul className="space-y-2">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Transport & Distance Metrics */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Geographic Logistics</span>
            <strong className="text-slate-900 font-mono text-sm">{distanceKm} km</strong>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Estimated Transport Window</span>
            <strong className="text-teal-700 font-mono text-sm">
              ~{Math.max(1, Math.round(distanceKm / 120 + 0.8))} hours
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close Audit
          </button>

          <div className="flex items-center gap-2">
            {match.status === 'Proposed' && (
              <>
                <button
                  onClick={() => {
                    if (onReject) onReject(match.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  Reject Match
                </button>
                <button
                  onClick={() => {
                    if (onAccept) onAccept(match.id);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm shadow-teal-600/20 transition-all flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-white" />
                  <span>Accept Match & Dispatch</span>
                </button>
              </>
            )}
            {match.status === 'Accepted' && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Match Accepted & Dispatched
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
