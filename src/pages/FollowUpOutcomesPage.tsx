import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardCheck, 
  Plus, 
  Clock, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  X,
  Stethoscope
} from 'lucide-react';
import { FollowUpRecord } from '../types';

export const FollowUpOutcomesPage: React.FC = () => {
  const { currentUser, canPerformAction } = useAuth();

  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([
    {
      id: 'FOL-101',
      surgicalCaseId: 'SURG-299',
      recipientId: 'REC-098',
      recipientName: 'Claire Redfield',
      organType: 'Kidney',
      milestoneInterval: 'Day 30',
      assessmentDate: '2026-10-07',
      graftFunctionStatus: 'Immediate Graft Function',
      complications: 'No acute rejection episodes. Normal renal resistive index (0.62).',
      immunosuppressionRegimen: 'Tacrolimus 3mg BID (trough 7.8 ng/mL) + Mycophenolate Mofetil 1000mg BID + Prednisone 5mg QD',
      clinician: 'Dr. Robert Martinez, MD',
      notes: 'Serum creatinine stable at 1.1 mg/dL. Urine output > 2.2 L/day.',
    },
    {
      id: 'FOL-102',
      surgicalCaseId: 'SURG-285',
      recipientId: 'REC-077',
      recipientName: 'Gregory House',
      organType: 'Liver',
      milestoneInterval: 'Month 3',
      assessmentDate: '2026-10-05',
      graftFunctionStatus: 'Stable Graft Function',
      complications: 'None. Liver enzymes normalized.',
      immunosuppressionRegimen: 'Tacrolimus monotherapy (trough 6.2 ng/mL)',
      clinician: 'Dr. Katherine Bell, MD',
      notes: 'Total bilirubin 0.7 mg/dL, ALT 24 U/L, AST 22 U/L. Excellent synthetic function.',
    },
  ]);

  const [selectedRecord, setSelectedRecord] = useState<FollowUpRecord | null>(followUps[0]);
  const [isNewModalOpen, setNewModalOpen] = useState(false);

  // Form State
  const [patientName, setPatientName] = useState('Arthur Pendelton');
  const [organType, setOrganType] = useState('Heart');
  const [interval, setInterval] = useState<'Day 1' | 'Day 7' | 'Day 30' | 'Month 3' | 'Year 1'>('Day 7');
  const [graftStatus, setGraftStatus] = useState<'Immediate Graft Function' | 'Delayed Graft Function' | 'Stable Graft Function' | 'Primary Non-Function'>('Immediate Graft Function');
  const [complications, setComplications] = useState('No acute cellular or antibody-mediated rejection.');
  const [regimen, setRegimen] = useState('Tacrolimus + Mycophenolate + Prednisone');

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const created: FollowUpRecord = {
      id: `FOL-${followUps.length + 103}`,
      surgicalCaseId: 'SURG-301',
      recipientId: 'REC-101',
      recipientName: patientName,
      organType,
      milestoneInterval: interval,
      assessmentDate: new Date().toISOString().split('T')[0],
      graftFunctionStatus: graftStatus,
      complications,
      immunosuppressionRegimen: regimen,
      clinician: currentUser.fullName,
      notes: 'Postoperative graft assessment completed according to clinical protocol.',
    };

    setFollowUps([created, ...followUps]);
    setSelectedRecord(created);
    setNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-[#2457A7]" />
            Post-Transplant Follow-Up & Graft Function Registry
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Document structured graft survival milestones, immunosuppression therapeutic monitoring, and clinical complication surveillance.
          </p>
        </div>

        {canPerformAction('record_followup') && (
          <button
            onClick={() => setNewModalOpen(true)}
            className="px-3.5 py-2 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Document Follow-Up Visit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Follow-Up Milestones ({followUps.length})
            </h2>
            <span className="text-[11px] text-[#667085]">Scheduled Protocols</span>
          </div>

          <div className="divide-y divide-[#E4E7EC]">
            {followUps.map((f) => {
              const isSelected = selectedRecord?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedRecord(f)}
                  className={`p-4 hover:bg-[#F7F9FC] cursor-pointer transition-colors space-y-2 ${
                    isSelected ? 'bg-[#EDF4FF]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#2457A7]">{f.id}</span>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                      {f.milestoneInterval}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#172033]">
                    <span className="font-semibold">{f.recipientName}</span>
                    <span className="text-[#16805D] font-medium">{f.organType} Allograft</span>
                  </div>

                  <div className="text-[11px] text-[#667085] flex items-center justify-between">
                    <span>Status: {f.graftFunctionStatus}</span>
                    <span className="font-mono text-slate-500">{f.assessmentDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Record Detail Drawer (7 cols) */}
        {selectedRecord && (
          <div className="lg:col-span-7 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085]">
                  Clinical Milestone Assessment
                </span>
                <h3 className="text-sm font-bold text-[#172033]">
                  {selectedRecord.recipientName} ({selectedRecord.milestoneInterval})
                </h3>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                {selectedRecord.graftFunctionStatus}
              </span>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F7F9FC] p-3.5 rounded-lg border border-[#E4E7EC]">
                <div><span className="text-[#667085]">Assessment Date:</span> <strong className="text-[#172033] ml-1 font-mono">{selectedRecord.assessmentDate}</strong></div>
                <div><span className="text-[#667085]">Reporting Clinician:</span> <strong className="text-[#172033] ml-1">{selectedRecord.clinician}</strong></div>
                <div><span className="text-[#667085]">Organ Type:</span> <strong className="text-[#172033] ml-1">{selectedRecord.organType}</strong></div>
                <div><span className="text-[#667085]">Surgical Reference:</span> <strong className="text-[#172033] ml-1 font-mono">{selectedRecord.surgicalCaseId}</strong></div>
              </div>

              {/* Immunosuppression Regimen */}
              <div className="border border-[#E4E7EC] rounded-lg p-3.5 space-y-1.5">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#172033]">
                  Immunosuppressive Therapy Regimen
                </h4>
                <p className="text-[#172033] bg-[#F7F9FC] p-2.5 rounded font-mono leading-relaxed">
                  {selectedRecord.immunosuppressionRegimen}
                </p>
              </div>

              {/* Complications & Histology */}
              <div className="border border-[#E4E7EC] rounded-lg p-3.5 space-y-1.5">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#172033]">
                  Complications Surveillance & Graft Histology
                </h4>
                <p className="text-[#172033] leading-relaxed">
                  {selectedRecord.complications}
                </p>
              </div>

              {/* Notes */}
              <div className="border border-[#E4E7EC] rounded-lg p-3.5 space-y-1.5 bg-[#F7F9FC]">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#172033]">
                  Clinical Progress Summary
                </h4>
                <p className="text-[#667085] leading-relaxed">
                  {selectedRecord.notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Follow-up Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EC] max-w-md w-full overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#2457A7]" />
                Document Post-Transplant Follow-Up
              </h3>
              <button onClick={() => setNewModalOpen(false)} className="text-[#667085] hover:text-[#172033]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Patient</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Interval</label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value as any)}
                    className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                  >
                    <option value="Day 1">Day 1 Post-Op</option>
                    <option value="Day 7">Day 7 Post-Op</option>
                    <option value="Day 30">Day 30 Post-Op</option>
                    <option value="Month 3">Month 3</option>
                    <option value="Year 1">Year 1</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Graft Function Status</label>
                <select
                  value={graftStatus}
                  onChange={(e) => setGraftStatus(e.target.value as any)}
                  className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                >
                  <option value="Immediate Graft Function">Immediate Graft Function (Optimal)</option>
                  <option value="Delayed Graft Function">Delayed Graft Function (Requiring support)</option>
                  <option value="Stable Graft Function">Stable Graft Function</option>
                  <option value="Primary Non-Function">Primary Non-Function (Critical)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Immunosuppression Regimen</label>
                <input
                  type="text"
                  value={regimen}
                  onChange={(e) => setRegimen(e.target.value)}
                  className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Complications / Surveillance</label>
                <textarea
                  rows={2}
                  value={complications}
                  onChange={(e) => setComplications(e.target.value)}
                  className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-3 py-1.5 border border-[#E4E7EC] rounded-lg text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2457A7] text-white font-semibold rounded-lg hover:bg-[#3978C5]"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
