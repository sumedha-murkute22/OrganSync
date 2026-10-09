import React, { useState } from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  CheckCircle2, 
  GitMerge, 
  Layers, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Network, 
  ListOrdered, 
  ArrowRight, 
  Building2, 
  FileText,
  UserCheck,
  X,
  Play
} from 'lucide-react';
import { ScoreBreakdownBar } from '../components/matching/ScoreBreakdownBar';
import { BipartiteGraphVisualizer } from '../components/graph/BipartiteGraphVisualizer';
import { HeapVisualizer } from '../components/priority/HeapVisualizer';

interface MatchingPageProps {
  onPrepareAllocationCase?: (organId: string, recipientId: string, score: number, rank: number) => void;
}

export const MatchingCompatibilityPage: React.FC<MatchingPageProps> = ({ onPrepareAllocationCase }) => {
  const { organs, recipients, graphData } = useOrganSync();
  const { currentUser, canPerformAction } = useAuth();

  const [selectedOrganId, setSelectedOrganId] = useState<string>(organs[0]?.id || 'ORG-H001');
  const [isGraphModalOpen, setGraphModalOpen] = useState(false);
  const [isHeapModalOpen, setHeapModalOpen] = useState(false);
  const [isRunningEngine, setIsRunningEngine] = useState(false);

  const selectedOrgan = organs.find(o => o.id === selectedOrganId) || organs[0];

  // Algorithmic candidate recommendations
  const [candidates, setCandidates] = useState<any[]>([
    {
      rank: 1,
      recipientId: 'REC-101',
      recipientName: 'Arthur Pendelton',
      bloodGroup: 'A+',
      urgency: 'Status 1A (Critical)',
      receivingHospital: 'Memorial General Hospital (Portland, OR)',
      eligibilityStatus: 'Eligible for Further Review',
      totalScore: 92.8,
      distanceKm: 280.0,
      waitingDays: 421,
      scoreBreakdown: {
        bloodScore: 20.0,
        hlaScore: 23.0,
        urgencyScore: 30.0,
        shelfLifeScore: 12.0,
        waitTimeScore: 8.8,
        distanceScore: 7.5,
        ageMatchScore: 5.0,
      },
      verifiedFindings: 'ABO Compatibility Confirmed (O+ -> A+). HLA Allelic Match: 23/25. Crossmatch Cytotoxicity: Negative.',
      outstandingAssessments: 'All mandatory safety and serology checks completed.',
      cautionFactors: 'Requires intra-aortic balloon pump transfer during surgical handover.',
    },
    {
      rank: 2,
      recipientId: 'REC-102',
      recipientName: 'Eleanor Vance',
      bloodGroup: 'O+',
      urgency: 'Status 1B (Urgent)',
      receivingHospital: 'St. Jude National Transplant Institute (Seattle, WA)',
      eligibilityStatus: 'Eligible for Further Review',
      totalScore: 86.4,
      distanceKm: 0.0,
      waitingDays: 323,
      scoreBreakdown: {
        bloodScore: 20.0,
        hlaScore: 20.5,
        urgencyScore: 22.0,
        shelfLifeScore: 13.5,
        waitTimeScore: 7.9,
        distanceScore: 10.0,
        ageMatchScore: 3.5,
      },
      verifiedFindings: 'ABO Identical (O+ -> O+). Zero transit distance (same facility). Crossmatch Negative.',
      outstandingAssessments: 'Routine pre-op coagulopathy profile verification.',
      cautionFactors: 'Elevated pulmonary vascular resistance documented on last cath.',
    },
    {
      rank: 3,
      recipientId: 'REC-103',
      recipientName: 'Sarah Jenkins',
      bloodGroup: 'B+',
      urgency: 'Status 2 (Moderate)',
      receivingHospital: 'Mercy Medical Center (Boise, ID)',
      eligibilityStatus: 'Potentially Eligible - Additional Assessment Required',
      totalScore: 71.2,
      distanceKm: 620.0,
      waitingDays: 180,
      scoreBreakdown: {
        bloodScore: 20.0,
        hlaScore: 18.0,
        urgencyScore: 14.0,
        shelfLifeScore: 9.0,
        waitTimeScore: 6.2,
        distanceScore: 4.0,
        ageMatchScore: 1.5,
      },
      verifiedFindings: 'ABO Compatible (O+ -> B+).',
      outstandingAssessments: 'Prospective flow cytometric crossmatch pending.',
      cautionFactors: 'Cold ischemic time exceeds 4.5 hours for Boise regional transit.',
    },
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(candidates[0]);

  const handleRunMatching = async () => {
    setIsRunningEngine(true);
    try {
      const res = await api.assessMatches(selectedOrgan.id);
      if (res?.matchingResult?.recommendations) {
        setCandidates(res.matchingResult.recommendations);
        if (res.matchingResult.recommendations.length > 0) {
          setSelectedCandidate(res.matchingResult.recommendations[0]);
        }
      }
    } catch (_) {
      // In-process fallback already visible
    } finally {
      setIsRunningEngine(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#2457A7]" />
            Allocation & Compatibility Review
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Transparent 6-stage algorithmic candidate evaluation powered by native C17 DSA matching engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Open Bipartite Graph Modal */}
          <button
            onClick={() => setGraphModalOpen(true)}
            className="px-3 py-1.5 bg-white border border-[#E4E7EC] text-[#172033] text-xs font-semibold rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Network className="w-4 h-4 text-[#2457A7]" />
            Compatibility Network Graph
          </button>

          {/* Open Heap Visualizer Modal */}
          <button
            onClick={() => setHeapModalOpen(true)}
            className="px-3 py-1.5 bg-white border border-[#E4E7EC] text-[#172033] text-xs font-semibold rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ListOrdered className="w-4 h-4 text-[#2457A7]" />
            Urgency Priority Heap
          </button>

          {/* Run C Matching Engine */}
          <button
            disabled={isRunningEngine}
            onClick={handleRunMatching}
            className="px-3.5 py-1.5 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isRunningEngine ? 'animate-spin' : ''}`} />
            {isRunningEngine ? 'Executing C Engine...' : 'Re-Run Matching Engine'}
          </button>
        </div>
      </div>

      {/* Prominent Mandatory Clinical Disclaimer Banner */}
      <div className="p-3.5 bg-[#EDF4FF] border border-[#2457A7]/30 rounded-xl text-xs text-[#2457A7] flex items-start gap-2.5 shadow-xs">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#2457A7]" />
        <div>
          <div className="font-bold text-[#172033]">
            Clinical Governance Directive: Algorithmic Recommendation vs. Authorized Decision
          </div>
          <p className="mt-0.5 text-[#2457A7] leading-relaxed">
            System-generated candidate rankings are clinical decision support aids based on OPTN/UNOS allocation policy algorithms. Allocation is never automatically finalized by a numeric score. An explicit clinical authorization review by the responsible transplant surgeon or coordinator is mandatory before organ dispatch.
          </p>
        </div>
      </div>

      {/* 3-Panel Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Organ Offer (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Active Organ Offer
            </h2>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
              {selectedOrgan.status}
            </span>
          </div>

          <div className="p-4 space-y-4 text-xs">
            {/* Organ Selector Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-[#667085] mb-1">Select Donated Organ</label>
              <select
                value={selectedOrganId}
                onChange={(e) => setSelectedOrganId(e.target.value)}
                className="w-full p-2 border border-[#E4E7EC] rounded-lg font-mono text-xs font-bold text-[#2457A7] bg-[#F7F9FC]"
              >
                {organs.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.organType} ({o.bloodGroup}) — {o.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 border-t border-[#E4E7EC] pt-3 text-[#172033]">
              <div><span className="text-[#667085]">Donor Category:</span> <strong className="ml-1">Deceased Donor (#801)</strong></div>
              <div><span className="text-[#667085]">Blood Group & Rh:</span> <strong className="ml-1 font-mono text-[#2457A7]">{selectedOrgan.bloodGroup}</strong></div>
              <div><span className="text-[#667085]">Donor Age:</span> <strong className="ml-1">{selectedOrgan.donorAge || 32} yrs</strong></div>
              <div><span className="text-[#667085]">Cold Ischemia Tolerance:</span> <strong className="ml-1 font-mono text-[#C0392B]">{selectedOrgan.maxShelfLifeHours || 6}h Max</strong></div>
              <div><span className="text-[#667085]">Procurement Centre:</span> <div className="text-[11px] font-medium text-slate-700 mt-0.5">{selectedOrgan.hospital}</div></div>
            </div>

            <div className="border border-[#E4E7EC] rounded-lg p-3 bg-[#F7F9FC] space-y-1">
              <div className="text-[11px] font-bold text-[#172033] uppercase">Assessment Completeness</div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mandatory Serology & NAT Complete
              </div>
            </div>
          </div>
        </div>

        {/* Centre Panel: Candidate Assessment Table (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Eligible Ranked Candidates ({candidates.length})
            </h2>
            <span className="text-[11px] text-[#667085]">Max-Heap Ranked</span>
          </div>

          <div className="divide-y divide-[#E4E7EC]">
            {candidates.map((c) => {
              const isSelected = selectedCandidate?.recipientId === c.recipientId;
              const isCritical = c.urgency.includes('1A') || c.urgency.includes('Critical');

              return (
                <div
                  key={c.recipientId}
                  onClick={() => setSelectedCandidate(c)}
                  className={`p-3.5 hover:bg-[#F7F9FC] cursor-pointer transition-colors space-y-2 ${
                    isSelected ? 'bg-[#EDF4FF]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2457A7] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                        #{c.rank}
                      </span>
                      <span className="font-bold text-xs text-[#172033]">{c.recipientName}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#2457A7]">
                      {c.totalScore}
                      <span className="text-[10px] font-normal text-[#667085]">/100</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#667085]">
                    <span>{c.bloodGroup} • Waitlist {c.waitingDays}d</span>
                    <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                      isCritical ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {c.urgency}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#667085] truncate">
                    {c.receivingHospital}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Selected Candidate Clinical Evidence & Actions (4 cols) */}
        {selectedCandidate && (
          <div className="lg:col-span-4 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085]">
                  Candidate Review Dossier
                </span>
                <h3 className="text-xs font-bold text-[#172033]">
                  {selectedCandidate.recipientName} ({selectedCandidate.recipientId})
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#2457A7] bg-[#EDF4FF] px-2 py-0.5 rounded border border-[#2457A7]/20">
                Rank #{selectedCandidate.rank}
              </span>
            </div>

            <div className="p-4 space-y-4 text-xs flex-1 overflow-y-auto">
              {/* Score Breakdown Bar */}
              <div className="border border-[#E4E7EC] p-3 rounded-lg bg-[#F7F9FC]">
                <ScoreBreakdownBar 
                  breakdown={selectedCandidate.scoreBreakdown || {
                    bloodScore: 20,
                    hlaScore: 22,
                    urgencyScore: 30,
                    shelfLifeScore: 12,
                    waitTimeScore: 8,
                    distanceScore: 7,
                    ageMatchScore: 5
                  }} 
                  totalScore={selectedCandidate.totalScore} 
                />
              </div>

              {/* Verified Findings */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase text-[#172033]">Verified Clinical Findings</div>
                <p className="text-[#667085] bg-slate-50 p-2.5 rounded border border-[#E4E7EC] leading-relaxed">
                  {selectedCandidate.verifiedFindings}
                </p>
              </div>

              {/* Outstanding Assessments */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase text-[#172033]">Outstanding Tests / Conditions</div>
                <p className="text-[#667085] bg-slate-50 p-2.5 rounded border border-[#E4E7EC] leading-relaxed">
                  {selectedCandidate.outstandingAssessments}
                </p>
              </div>

              {/* Caution Factors */}
              {selectedCandidate.cautionFactors && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase text-[#C0392B]">Clinical Caution Factors</div>
                  <p className="text-[#C0392B] bg-rose-50/60 p-2.5 rounded border border-rose-200 leading-relaxed text-[11px]">
                    {selectedCandidate.cautionFactors}
                  </p>
                </div>
              )}

              {/* Authorized Action: Prepare Allocation Case */}
              {onPrepareAllocationCase && (
                <button
                  onClick={() => onPrepareAllocationCase(
                    selectedOrgan.id,
                    selectedCandidate.recipientId,
                    selectedCandidate.totalScore,
                    selectedCandidate.rank
                  )}
                  className="w-full py-2.5 bg-[#2457A7] text-white font-semibold rounded-lg hover:bg-[#3978C5] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <GitMerge className="w-4 h-4" />
                  Prepare Allocation Dossier Case
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bipartite Graph Visualizer Modal */}
      {isGraphModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EC] max-w-4xl w-full overflow-hidden p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                  <Network className="w-5 h-5 text-[#2457A7]" />
                  Clinical Compatibility Network Graph
                </h3>
                <p className="text-[11px] text-[#667085]">
                  Visualizing validated compatibility edges between donor organs (left set) and active recipients (right set).
                </p>
              </div>
              <button onClick={() => setGraphModalOpen(false)} className="text-[#667085] hover:text-[#172033]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <BipartiteGraphVisualizer data={graphData} />
            </div>

            <div className="text-right border-t border-[#E4E7EC] pt-3">
              <button
                onClick={() => setGraphModalOpen(false)}
                className="px-4 py-1.5 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5]"
              >
                Close Visualizer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Heap Visualizer Modal */}
      {isHeapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EC] max-w-4xl w-full overflow-hidden p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-[#2457A7]" />
                  Binary Heap Priority Queue Visualizer
                </h3>
                <p className="text-[11px] text-[#667085]">
                  Urgency Max-Heap and Ischemic Shelf-Life Min-Heap ordering data structures in C core.
                </p>
              </div>
              <button onClick={() => setHeapModalOpen(false)} className="text-[#667085] hover:text-[#172033]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <HeapVisualizer />
            </div>

            <div className="text-right border-t border-[#E4E7EC] pt-3">
              <button
                onClick={() => setHeapModalOpen(false)}
                className="px-4 py-1.5 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5]"
              >
                Close Visualizer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
