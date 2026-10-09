import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  GitMerge, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  Building2, 
  FileText,
  UserCheck,
  AlertTriangle,
  History,
  X
} from 'lucide-react';

interface AllocationCentreProps {
  onNavigateToTransport?: (caseId: string) => void;
  onNavigateToSurgery?: (caseId: string) => void;
}

export const AllocationCentrePage: React.FC<AllocationCentreProps> = ({
  onNavigateToTransport,
  onNavigateToSurgery,
}) => {
  const { currentUser, canPerformAction } = useAuth();

  const [cases, setCases] = useState<any[]>([
    {
      id: 'CASE-ALC-701',
      organId: 'ORG-H001',
      organType: 'Heart',
      bloodGroup: 'O+',
      recipientId: 'REC-101',
      recipientName: 'Arthur Pendelton',
      urgency: 'Status 1A (Critical)',
      recipientHospital: 'Memorial General Hospital (Portland, OR)',
      donorHospital: 'St. Jude National Transplant Institute (Seattle, WA)',
      totalScore: 92.8,
      rank: 1,
      status: 'Awaiting Allocation Decision',
      policyVersion: 'OPTN-POL-2026.4',
      createdAt: '2026-10-09T03:00:00Z',
      history: [
        { state: 'Created', actor: 'Sarah Jenkins, RN (Coordinator)', time: '03:00 UTC', reason: 'Donor organ offer registered' },
        { state: 'Matching in Progress', actor: 'C Engine (Automated Core)', time: '03:15 UTC', reason: 'Evaluated 5 active waitlist heart candidates' },
        { state: 'Candidate Review', actor: 'Sarah Jenkins, RN', time: '03:30 UTC', reason: 'Candidate ranked #1 (Score 92.8, ABO compatible)' },
        { state: 'Awaiting Allocation Decision', actor: 'Sarah Jenkins, RN', time: '04:15 UTC', reason: 'Forwarded to Surgical Lead for formal clinical authorization' },
      ],
    },
    {
      id: 'CASE-ALC-698',
      organId: 'ORG-K001',
      organType: 'Kidney',
      bloodGroup: 'O+',
      recipientId: 'REC-103',
      recipientName: 'Marcus Chen',
      urgency: 'Status 2 (Moderate)',
      recipientHospital: 'St. Jude National Transplant Institute (Seattle, WA)',
      donorHospital: 'St. Jude National Transplant Institute (Seattle, WA)',
      totalScore: 84.5,
      rank: 1,
      status: 'Allocation Approved',
      authorizedBy: 'Dr. James Sterling, MD (Surgeon)',
      policyVersion: 'OPTN-POL-2026.4',
      createdAt: '2026-10-08T14:00:00Z',
      history: [
        { state: 'Created', actor: 'Coordinator', time: '14:00 UTC', reason: 'Kidney offer registered' },
        { state: 'Allocation Approved', actor: 'Dr. James Sterling, MD', time: '16:30 UTC', reason: 'Crossmatch negative, high seniority waitlist match' },
        { state: 'Procurement Coordination', actor: 'Surgical Team', time: '18:00 UTC', reason: 'OR scheduled' },
      ],
    },
  ]);

  const [selectedCase, setSelectedCase] = useState<any | null>(cases[0]);
  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [isDeclineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('Compatibility verified, zero crossmatch contraindications. Recipient hemodynamically ready for procedure.');

  const handleApprove = () => {
    if (!selectedCase) return;
    const updated = {
      ...selectedCase,
      status: 'Allocation Approved',
      authorizedBy: currentUser.fullName,
      authorizedAt: new Date().toISOString(),
      decisionReason: approvalNotes,
      history: [
        ...selectedCase.history,
        {
          state: 'Allocation Approved',
          actor: currentUser.fullName,
          time: new Date().toLocaleTimeString(),
          reason: approvalNotes,
        },
      ],
    };

    setCases(prev => prev.map(c => c.id === selectedCase.id ? updated : c));
    setSelectedCase(updated);
    setApproveModalOpen(false);

    // Call backend API if running
    api.approveAllocation(selectedCase.id, approvalNotes).catch(() => {});
  };

  const handleDecline = () => {
    if (!selectedCase || !declineReason.trim()) return;
    const updated = {
      ...selectedCase,
      status: 'Allocation Declined',
      decisionReason: declineReason,
      history: [
        ...selectedCase.history,
        {
          state: 'Allocation Declined',
          actor: currentUser.fullName,
          time: new Date().toLocaleTimeString(),
          reason: declineReason,
        },
      ],
    };

    setCases(prev => prev.map(c => c.id === selectedCase.id ? updated : c));
    setSelectedCase(updated);
    setDeclineModalOpen(false);
    setDeclineReason('');

    // Call backend API if running
    api.declineAllocation(selectedCase.id, declineReason).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-[#2457A7]" />
            Organ Allocation Operations Centre
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage end-to-end allocation cases from candidate review to authorized clinical authorization and surgical transfer.
          </p>
        </div>
      </div>

      {/* Main Split: Cases Table & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Active Allocation Cases ({cases.length})
            </h2>
            <span className="text-[11px] text-[#667085]">Policy: OPTN-POL-2026.4</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FC] text-[#667085] border-b border-[#E4E7EC] font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Case ID</th>
                  <th className="px-4 py-3">Organ Offer</th>
                  <th className="px-4 py-3">Selected Candidate</th>
                  <th className="px-4 py-3">Score & Rank</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {cases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  const isPending = c.status === 'Awaiting Allocation Decision';
                  return (
                    <tr 
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`hover:bg-[#F7F9FC] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EDF4FF]' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#2457A7]">
                        {c.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#172033]">{c.organType}</div>
                        <div className="text-[11px] text-[#667085]">{c.bloodGroup} • {c.organId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#172033]">{c.recipientName}</div>
                        <div className="text-[11px] text-[#C0392B] font-semibold">{c.urgency}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="font-bold text-[#172033]">{c.totalScore}</span>
                        <span className="text-[11px] text-[#667085] ml-1">(#{c.rank})</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isPending 
                            ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                            : c.status === 'Allocation Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-[#2457A7] font-semibold">
                          View Details →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Case Detail Drawer (5 Cols) */}
        {selectedCase && (
          <div className="lg:col-span-5 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085]">
                  Case Review Dossier
                </span>
                <h3 className="text-sm font-bold text-[#172033] font-mono">
                  {selectedCase.id}
                </h3>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                selectedCase.status === 'Allocation Approved'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {selectedCase.status}
              </span>
            </div>

            <div className="p-5 space-y-5 flex-1 overflow-y-auto">
              {/* Clinical Match Summary Card */}
              <div className="bg-[#F7F9FC] border border-[#E4E7EC] p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#172033]">
                  <span>Candidate: {selectedCase.recipientName}</span>
                  <span className="text-[#2457A7] font-mono">Score: {selectedCase.totalScore}/100</span>
                </div>
                <div className="text-xs text-[#667085] space-y-1">
                  <div><strong>Organ:</strong> {selectedCase.organType} ({selectedCase.bloodGroup}) — {selectedCase.organId}</div>
                  <div><strong>Urgency:</strong> <span className="text-[#C0392B] font-semibold">{selectedCase.urgency}</span></div>
                  <div><strong>Receiving Centre:</strong> {selectedCase.recipientHospital}</div>
                  <div><strong>Procurement Facility:</strong> {selectedCase.donorHospital}</div>
                </div>
              </div>

              {/* Algorithmic Notice Banner */}
              <div className="p-3 bg-[#EDF4FF] border border-[#2457A7]/20 rounded-lg text-xs text-[#2457A7] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Clinical Decision Authority Notice:</strong> System recommendations are algorithmic ranking aids. An allocation decision is only legally and procedurally binding when confirmed by an authorized transplant surgeon.
                </p>
              </div>

              {/* Action Buttons for Authorized Roles */}
              {selectedCase.status === 'Awaiting Allocation Decision' ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                    Authorized Clinical Decisions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setApproveModalOpen(true)}
                      className="w-full py-2 bg-[#16805D] text-white text-xs font-semibold rounded-lg hover:bg-[#12684B] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Allocation
                    </button>
                    <button
                      onClick={() => setDeclineModalOpen(true)}
                      className="w-full py-2 bg-white border border-[#C0392B] text-[#C0392B] text-xs font-semibold rounded-lg hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline Candidate
                    </button>
                  </div>
                </div>
              ) : selectedCase.status === 'Allocation Approved' ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#16805D] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Allocation Approved & Signed
                  </div>
                  <div className="text-xs text-[#667085] bg-slate-50 p-3 rounded-lg border border-[#E4E7EC]">
                    <div><strong>Authorized By:</strong> {selectedCase.authorizedBy || 'Dr. James Sterling, MD'}</div>
                    <div className="mt-1"><strong>Clinical Justification:</strong> {selectedCase.decisionReason || 'Candidate cleared for surgery.'}</div>
                  </div>
                  {onNavigateToTransport && (
                    <button
                      onClick={() => onNavigateToTransport(selectedCase.id)}
                      className="w-full py-2 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] transition-colors flex items-center justify-center gap-1.5"
                    >
                      Proceed to Transport Operations <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : null}

              {/* Transition History Audit Timeline */}
              <div className="space-y-3 pt-2 border-t border-[#E4E7EC]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#172033]">
                  <History className="w-4 h-4 text-[#667085]" />
                  <span>Immutable Case Transition History</span>
                </div>
                <div className="space-y-3">
                  {selectedCase.history.map((step: any, idx: number) => (
                    <div key={idx} className="relative pl-5 border-l-2 border-[#2457A7]/30 text-xs space-y-0.5">
                      <div className="font-semibold text-[#172033]">{step.state}</div>
                      <div className="text-[11px] text-[#667085]">{step.reason}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {step.actor} • {step.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approve Allocation Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EC] max-w-md w-full overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#16805D]" />
                Confirm Clinical Allocation Approval
              </h3>
              <button onClick={() => setApproveModalOpen(false)} className="text-[#667085] hover:text-[#172033]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#667085] space-y-2">
              <p>
                You are authorizing the formal allocation of <strong className="text-[#172033]">{selectedCase?.organType} ({selectedCase?.organId})</strong> to candidate <strong className="text-[#172033]">{selectedCase?.recipientName}</strong>.
              </p>
              <p>
                This action will advance the case to <span className="font-semibold text-[#16805D]">Allocation Approved</span>, lock the organ record, and generate an immediate organ transit coordination order.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Clinical Readiness Documentation / Operative Notes:
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2457A7] text-[#172033]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E7EC]">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="px-3.5 py-1.5 border border-[#E4E7EC] text-xs font-semibold rounded-lg hover:bg-[#F7F9FC]"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-1.5 bg-[#16805D] text-white text-xs font-semibold rounded-lg hover:bg-[#12684B] shadow-xs"
              >
                Sign & Authorize Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Candidate Modal (Mandatory Clinical Justification) */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EC] max-w-md w-full overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#C0392B] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#C0392B]" />
                Decline Recommended Candidate
              </h3>
              <button onClick={() => setDeclineModalOpen(false)} className="text-[#667085] hover:text-[#172033]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#667085]">
              Declining a system-recommended candidate requires an explicit clinical or operational reason under transplant governance policies.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Mandatory Clinical Justification:
              </label>
              <textarea
                placeholder="e.g. Acute intercurrent infection, positive prospective crossmatch, temporary clinical instability..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#C0392B] text-[#172033]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E7EC]">
              <button
                onClick={() => setDeclineModalOpen(false)}
                className="px-3.5 py-1.5 border border-[#E4E7EC] text-xs font-semibold rounded-lg hover:bg-[#F7F9FC]"
              >
                Cancel
              </button>
              <button
                disabled={!declineReason.trim()}
                onClick={handleDecline}
                className="px-4 py-1.5 bg-[#C0392B] text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
