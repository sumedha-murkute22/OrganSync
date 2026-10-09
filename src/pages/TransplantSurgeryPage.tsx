import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Stethoscope, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  AlertTriangle,
  UserCheck,
  FileText
} from 'lucide-react';
import { SurgicalCase } from '../types';

export const TransplantSurgeryPage: React.FC = () => {
  const { currentUser, canPerformAction } = useAuth();

  const [surgeries, setSurgeries] = useState<SurgicalCase[]>([
    {
      id: 'SURG-301',
      allocationCaseId: 'CASE-ALC-701',
      organId: 'ORG-H001',
      recipientId: 'REC-101',
      hospital: 'Memorial General Hospital',
      leadSurgeon: 'Dr. James Sterling, MD, FACS',
      scheduledStart: new Date(Date.now() + 2.5 * 3600 * 1000).toISOString(),
      currentMilestone: 'Preoperative Review',
      surgicalStatus: 'Scheduled',
      organReceiptConfirmed: false,
      recipientIdentityVerified: true,
      notes: 'Cardiothoracic Operating Suite 4 booked. Anesthesia & cardiopulmonary bypass perfusionist on standby.',
      createdAt: '2026-10-09T04:15:00Z',
    },
  ]);

  const [selectedSurgery, setSelectedSurgery] = useState<SurgicalCase | null>(surgeries[0]);
  const [organReceiptConfirmed, setOrganReceiptConfirmed] = useState(false);
  const [recipientVerified, setRecipientVerified] = useState(true);

  const surgicalMilestones = [
    'Receiving Centre Acceptance',
    'Organ Handover Confirmed',
    'Recipient Identity Verification',
    'Preoperative Assessment Reviewed',
    'Surgical Team Confirmation',
    'Procedure Scheduled',
    'Procedure Started',
    'Organ Prepared for Implantation',
    'Implantation Commenced',
    'Implantation Completed',
    'Intraoperative Assessment Recorded',
    'Procedure Completed',
    'Postoperative Handover',
    'Outcome Documentation Completed',
  ];

  const handleAdvanceMilestone = (milestone: string) => {
    if (!selectedSurgery) return;
    const isCompleted = milestone === 'Implantation Completed' || milestone === 'Procedure Completed';
    const updated: SurgicalCase = {
      ...selectedSurgery,
      currentMilestone: milestone,
      surgicalStatus: isCompleted ? 'Implantation Completed' : 'Surgery in Progress',
      implantationCompletedAt: milestone === 'Implantation Completed' ? new Date().toISOString() : selectedSurgery.implantationCompletedAt,
    };

    setSelectedSurgery(updated);
    setSurgeries(prev => prev.map(s => s.id === updated.id ? updated : s));

    api.updateSurgicalMilestone(selectedSurgery.id, {
      milestone,
      surgicalStatus: updated.surgicalStatus,
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#2457A7]" />
            Transplant Surgical Coordination Suite
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Operating room coordination, preoperative safety checklists, and 14-milestone implantation tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Scheduled Surgical Cases ({surgeries.length})
            </h2>
            <span className="text-[11px] text-[#667085]">Cardiothoracic Suite</span>
          </div>

          <div className="divide-y divide-[#E4E7EC]">
            {surgeries.map((s) => {
              const isSelected = selectedSurgery?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSurgery(s)}
                  className={`p-4 hover:bg-[#F7F9FC] cursor-pointer transition-colors space-y-2 ${
                    isSelected ? 'bg-[#EDF4FF]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#2457A7]">{s.id}</span>
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                      {s.surgicalStatus}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#172033]">
                    Recipient: Arthur Pendelton ({s.recipientId})
                  </div>
                  <div className="text-[11px] text-[#667085]">
                    Organ: Donor Heart ({s.organId}) • Case: {s.allocationCaseId}
                  </div>
                  <div className="text-[11px] text-[#172033] font-medium flex items-center gap-1.5 pt-1">
                    <Stethoscope className="w-3.5 h-3.5 text-[#2457A7]" />
                    Lead Surgeon: {s.leadSurgeon}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Surgical Coordination Drawer (7 cols) */}
        {selectedSurgery && (
          <div className="lg:col-span-7 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085]">
                  Operative Dossier
                </span>
                <h3 className="text-sm font-bold text-[#172033]">
                  {selectedSurgery.id} — Orthotopic Heart Implantation
                </h3>
              </div>
              <span className="text-xs bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full font-semibold">
                Milestone: {selectedSurgery.currentMilestone}
              </span>
            </div>

            <div className="p-5 space-y-5 flex-1 overflow-y-auto text-xs">
              {/* Preoperative Verification Safety Checklist */}
              <div className="border border-[#E4E7EC] p-3.5 rounded-lg bg-[#F7F9FC] space-y-3">
                <div className="font-bold text-[11px] uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#2457A7]" />
                  Mandatory Preoperative Safety Checklist
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recipientVerified}
                      onChange={(e) => setRecipientVerified(e.target.checked)}
                      className="rounded border-slate-300 text-[#2457A7]"
                    />
                    <span className="text-[#172033] font-medium">
                      Recipient Identity Verification (Two independent identifiers matched with ABO typing)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={organReceiptConfirmed}
                      onChange={(e) => setOrganReceiptConfirmed(e.target.checked)}
                      className="rounded border-slate-300 text-[#2457A7]"
                    />
                    <span className="text-[#172033] font-medium">
                      Organ Package Receipt Confirmation (Intact cold-chain seal and documentation verified)
                    </span>
                  </label>
                </div>
              </div>

              {/* 14 Surgical Milestones Tracker */}
              <div className="space-y-2">
                <div className="font-bold text-[11px] uppercase tracking-wider text-[#172033]">
                  Surgical Milestones Progression (14 Stages)
                </div>
                <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
                  {surgicalMilestones.map((m, idx) => {
                    const currentIdx = surgicalMilestones.indexOf(selectedSurgery.currentMilestone);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={m}
                        className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                          isPassed ? 'border-emerald-200 bg-emerald-50/50' : 'border-[#E4E7EC] bg-[#F7F9FC]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isPassed ? 'bg-[#16805D] text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`font-semibold ${isPassed ? 'text-[#172033]' : 'text-[#667085]'}`}>
                            {m}
                          </span>
                        </div>

                        {canPerformAction('record_implantation') && idx === currentIdx + 1 && (
                          <button
                            onClick={() => handleAdvanceMilestone(m)}
                            className="px-2.5 py-1 bg-[#2457A7] text-white text-[11px] font-semibold rounded hover:bg-[#3978C5] transition-colors"
                          >
                            Advance to this Stage
                          </button>
                        )}
                        {isPassed && (
                          <span className="text-[10px] font-semibold text-[#16805D]">
                            Completed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Surgeon Implantation Sign-Off */}
              {canPerformAction('record_implantation') && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-900">Surgeon Sign-Off Authority</div>
                    <div className="text-[11px] text-emerald-700">Document procedural completion and initial graft reperfusion</div>
                  </div>
                  <button
                    onClick={() => handleAdvanceMilestone('Implantation Completed')}
                    className="px-3.5 py-2 bg-[#16805D] text-white font-semibold rounded-lg hover:bg-[#12684B] transition-colors shadow-xs"
                  >
                    Confirm Implantation Completed
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
