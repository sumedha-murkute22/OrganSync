import React, { useState } from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { MatchResult } from '../types';
import { OrganBadge } from '../components/common/OrganBadge';
import { BloodGroupBadge } from '../components/common/BloodGroupBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { ShelfLifeCountdown } from '../components/common/ShelfLifeCountdown';
import { ScoreBreakdownBar } from '../components/matching/ScoreBreakdownBar';
import { MatchDetailsModal } from '../components/matching/MatchDetailsModal';
import { 
  GitMerge, 
  Sparkles, 
  Sliders, 
  FileText, 
  Truck, 
  ShieldCheck,
  Layers
} from 'lucide-react';

export const MatchEnginePage: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { 
    matches, 
    generateMatches, 
    acceptMatch, 
    rejectMatch, 
    matchingLogs, 
    lastMatchResult 
  } = useOrganSync();

  const [minThreshold, setMinThreshold] = useState<number>(35);
  const [isMatchingRunning, setIsMatchingRunning] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [showLogs, setShowLogs] = useState<boolean>(true);

  const handleRunMatch = () => {
    setIsMatchingRunning(true);
    setTimeout(() => {
      generateMatches(minThreshold);
      setIsMatchingRunning(false);
    }, 450);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <GitMerge className="w-7 h-7 text-teal-600 stroke-[2.5]" />
            <span>Maximum Weight Bipartite Matching Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global optimization algorithm assigning compatible donor grafts to waiting recipients without conflicts
          </p>
        </div>

        <button
          onClick={handleRunMatch}
          disabled={isMatchingRunning}
          className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 text-white ${isMatchingRunning ? 'animate-spin' : ''}`} />
          <span>{isMatchingRunning ? 'Executing Matching...' : 'Generate Matches'}</span>
        </button>
      </div>

      {/* Threshold & Algorithmic Controls */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-[280px]">
          <Sliders className="w-5 h-5 text-teal-600 shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800">Minimum Compatibility Threshold</span>
              <span className="font-mono font-bold text-teal-700">{minThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="w-full accent-teal-600 bg-slate-200 rounded-lg h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Broad Matching (20)</span>
              <span>Strict High-Match (80)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setActiveTab('graph')}
            className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors font-semibold"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>View Graph Network</span>
          </button>

          <button
            onClick={() => setShowLogs(!showLogs)}
            className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors font-semibold"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>{showLogs ? 'Hide Audit Trace' : 'Show Audit Trace'}</span>
          </button>
        </div>
      </div>

      {/* Match Results Grid */}
      {matches.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4 max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600">
            <GitMerge className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No active matches generated yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Click <strong>"Generate Matches"</strong> above to run the Maximum Weight Bipartite Matching algorithm across all available donor organs and waiting recipients.
          </p>
          <button
            onClick={handleRunMatch}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Matching Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Optimal 1-to-1 Match Recommendations ({matches.length} pairs assigned)
              </span>
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                100% Conflict-Free
              </span>
            </div>
            {lastMatchResult && (
              <span className="text-xs text-slate-500 font-mono font-medium">
                Execution Time: <strong className="text-teal-700">{lastMatchResult.executionTimeMs} ms</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {matches.map((match) => {
              const isAccepted = match.status === 'Accepted';
              const isRejected = match.status === 'Rejected';

              return (
                <div
                  key={match.id}
                  className={`p-5 rounded-2xl bg-white border transition-all space-y-4 ${
                    isAccepted
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : isRejected
                      ? 'border-slate-200 opacity-60'
                      : 'border-slate-200 hover:border-teal-400 shadow-sm'
                  }`}
                >
                  {/* Top Header: Rank, Match ID, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold flex items-center justify-center text-xs">
                        #{match.rank}
                      </div>
                      <div>
                        <div className="font-mono font-bold text-xs text-slate-900">{match.id}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {match.distanceKm} km distance • ~{Math.max(1, Math.round(match.distanceKm / 120 + 0.8))}h transport window
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                        isAccepted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isRejected
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-teal-50 text-teal-800 border-teal-300'
                      }`}>
                        {match.status}
                      </span>

                      <button
                        onClick={() => setSelectedMatch(match)}
                        className="text-xs text-teal-700 hover:text-teal-800 font-bold underline"
                      >
                        Audit Details
                      </button>
                    </div>
                  </div>

                  {/* Donor & Recipient Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Donor Organ */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-teal-800 font-bold font-mono">DONOR GRAFT</span>
                        <OrganBadge type={match.organ.organType} size="sm" />
                      </div>
                      <div className="text-xs font-bold text-slate-900">{match.organ.id} • {match.organ.donorName || 'Anonymous Donor'}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <BloodGroupBadge bloodGroup={match.organ.bloodGroup} size="sm" />
                        <span>{match.organ.hospital} ({match.organ.city})</span>
                      </div>
                      <ShelfLifeCountdown organ={match.organ} />
                    </div>

                    {/* Right: Recipient */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-sky-800 font-bold font-mono">RECIPIENT PATIENT</span>
                        <UrgencyBadge urgency={match.recipient.urgency} size="sm" />
                      </div>
                      <div className="text-xs font-bold text-slate-900">{match.recipient.name} ({match.recipient.id})</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <BloodGroupBadge bloodGroup={match.recipient.bloodGroup} size="sm" />
                        <span>{match.recipient.hospital} ({match.recipient.city})</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        HLA DR: <strong className="text-sky-800">{match.recipient.hlaMarkers.hlaDR}</strong> • PRA: <strong className="text-amber-800">{match.recipient.praScore}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown Bar */}
                  <div className="pt-2 border-t border-slate-100">
                    <ScoreBreakdownBar score={match.compatibilityScore} breakdown={match.scoreBreakdown} />
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate max-w-md">{match.reasons[0]}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {match.status === 'Proposed' && (
                        <>
                          <button
                            onClick={() => rejectMatch(match.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => acceptMatch(match.id)}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm shadow-teal-600/20 transition-all flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5 text-white" />
                            <span>Accept & Dispatch</span>
                          </button>
                        </>
                      )}
                      {match.status === 'Accepted' && (
                        <button
                          onClick={() => setActiveTab('transport')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Track in Transit Queue</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step-by-Step Algorithm Execution Log */}
      {showLogs && matchingLogs.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Matching Engine Step-by-Step Audit Trace</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {matchingLogs.length} algorithmic evaluations recorded
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 font-mono text-xs">
            {matchingLogs.map((log) => {
              const isAssigned = log.action === 'MATCH_ASSIGNED';
              return (
                <div
                  key={log.stepNumber}
                  className={`p-2 rounded-lg border flex items-start justify-between gap-3 ${
                    isAssigned
                      ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">[{String(log.stepNumber).padStart(2, '0')}]</span>
                    <span>{log.message}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                    isAssigned ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {log.action}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit Modal */}
      <MatchDetailsModal
        isOpen={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        match={selectedMatch}
        onAccept={acceptMatch}
        onReject={rejectMatch}
      />
    </div>
  );
};
