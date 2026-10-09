import React, { useState } from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  X,
  Stethoscope,
  Activity
} from 'lucide-react';
import { Recipient, UrgencyLevel, OrganType } from '../types';

export const RecipientRegistryPage: React.FC = () => {
  const { recipients, addRecipient } = useOrganSync();
  const { currentUser, canPerformAction } = useAuth();

  const [selectedOrganFilter, setSelectedOrganFilter] = useState<string>('All');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(recipients[0] || null);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  // New Recipient Form State
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(45);
  const [newOrganNeeded, setNewOrganNeeded] = useState<OrganType>('Kidney');
  const [newBlood, setNewBlood] = useState<any>('O+');
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>('Status 2 (Moderate)');
  const [newWaitDays, setNewWaitDays] = useState(180);

  const filteredRecipients = selectedOrganFilter === 'All'
    ? recipients
    : recipients.filter(r => r.organNeeded.toLowerCase() === selectedOrganFilter.toLowerCase());

  const handleRegisterRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addRecipient({
      name: newName,
      age: Number(newAge),
      gender: 'Male',
      organNeeded: newOrganNeeded,
      bloodGroup: newBlood,
      urgency: newUrgency,
      registrationDate: new Date(Date.now() - newWaitDays * 24 * 3600 * 1000).toISOString(),
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*15' },
      praScore: 12,
      hospital: currentUser.hospital,
      city: 'Seattle, WA',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      status: 'Waiting',
    });

    setRegisterModalOpen(false);
    setNewName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#2457A7]" />
            Recipient Waitlist Registry
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Active national and regional transplant candidate waitlist registry with clinical urgency grading and tissue typing.
          </p>
        </div>

        {canPerformAction('register_donor') && (
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="px-3.5 py-2 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Admit Candidate to Waitlist
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Heart', 'Kidney', 'Liver', 'Lungs', 'Pancreas'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedOrganFilter(type)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedOrganFilter === type
                ? 'bg-[#2457A7] text-white shadow-xs'
                : 'bg-white border border-[#E4E7EC] text-[#667085] hover:bg-[#F7F9FC] hover:text-[#172033]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Grid: Recipients Table & Candidate Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Waitlist Candidates ({filteredRecipients.length})
            </h2>
            <span className="text-[11px] text-[#667085]">Urgency-Stratified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FC] text-[#667085] border-b border-[#E4E7EC] font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Recipient ID</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Organ Required</th>
                  <th className="px-4 py-3">Clinical Urgency</th>
                  <th className="px-4 py-3">Waitlist Seniority</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {filteredRecipients.map((r) => {
                  const isSelected = selectedRecipient?.id === r.id;
                  const isCritical = r.urgency.includes('1A') || r.urgency.includes('Critical');
                  const isUrgent = r.urgency.includes('1B') || r.urgency.includes('Urgent');

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRecipient(r)}
                      className={`hover:bg-[#F7F9FC] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EDF4FF]' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#2457A7]">
                        {r.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#172033]">{r.name}</div>
                        <div className="text-[11px] text-[#667085]">{r.bloodGroup} • Age {r.age}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#172033]">
                        {r.organNeeded}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : isUrgent
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {r.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {r.waitingDays || 120} Days
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-[#2457A7] font-semibold">
                          View →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Dossier Drawer (5 cols) */}
        {selectedRecipient && (
          <div className="lg:col-span-5 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085]">
                  Candidate Medical Record
                </span>
                <h3 className="text-sm font-bold text-[#172033]">
                  {selectedRecipient.name} ({selectedRecipient.id})
                </h3>
              </div>
              <span className="text-xs bg-[#EDF4FF] text-[#2457A7] border border-[#2457A7]/20 px-2 py-0.5 rounded-full font-semibold">
                Status: {selectedRecipient.status}
              </span>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
              {/* Urgency & Seniority Stats */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F7F9FC] rounded-lg border border-[#E4E7EC]">
                <div>
                  <div className="text-[10px] text-[#667085] uppercase">Urgency Tier</div>
                  <div className="font-bold text-[#C0392B] mt-0.5">{selectedRecipient.urgency}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#667085] uppercase">Waitlist Seniority</div>
                  <div className="font-bold text-[#172033] font-mono mt-0.5">{selectedRecipient.waitingDays || 180} Days</div>
                </div>
              </div>

              {/* Clinical Criteria */}
              <div className="border border-[#E4E7EC] rounded-lg p-3.5 space-y-2">
                <h4 className="font-bold uppercase text-[11px] tracking-wider text-[#172033]">
                  Clinical & Immunological Profile
                </h4>
                <div className="space-y-1.5 text-[#172033]">
                  <div><strong>Organ Required:</strong> {selectedRecipient.organNeeded}</div>
                  <div><strong>Blood Group:</strong> {selectedRecipient.bloodGroup}</div>
                  <div><strong>Panel Reactive Antibodies (PRA):</strong> {selectedRecipient.praScore || 10}%</div>
                  <div><strong>Crossmatch Status:</strong> <span className="text-[#16805D] font-semibold">{selectedRecipient.crossmatchStatus || 'Negative'}</span></div>
                  <div><strong>Registration Facility:</strong> {selectedRecipient.hospital}</div>
                </div>
              </div>

              {/* HLA Markers */}
              <div className="border border-[#E4E7EC] rounded-lg p-3.5 space-y-2">
                <h4 className="font-bold uppercase text-[11px] tracking-wider text-[#172033]">
                  Candidate HLA Markers
                </h4>
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-[10px] text-[#667085]">HLA-A</div>
                    <div className="font-bold text-[#172033]">{selectedRecipient.hlaMarkers?.hlaA || 'A*02'}</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-[10px] text-[#667085]">HLA-B</div>
                    <div className="font-bold text-[#172033]">{selectedRecipient.hlaMarkers?.hlaB || 'B*07'}</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-[10px] text-[#667085]">HLA-DR</div>
                    <div className="font-bold text-[#172033]">{selectedRecipient.hlaMarkers?.hlaDR || 'DRB1*15'}</div>
                  </div>
                </div>
              </div>

              {/* Medical Diagnostic Notes */}
              <div className="border border-[#E4E7EC] rounded-lg p-3.5 space-y-1 bg-[#F7F9FC]">
                <h4 className="font-bold text-[11px] text-[#172033] uppercase">Attending Clinical Notes</h4>
                <p className="text-[#667085] leading-relaxed">
                  {selectedRecipient.medicalNotes || 'End-stage organ failure candidate maintained on medical therapy. Hemodynamically stable for urgent transplant.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Register Candidate Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EC] max-w-md w-full overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2457A7]" />
                Admit Candidate to Waitlist
              </h3>
              <button onClick={() => setRegisterModalOpen(false)} className="text-[#667085] hover:text-[#172033]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterRecipient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Patient Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Blood Group</label>
                  <select
                    value={newBlood}
                    onChange={(e) => setNewBlood(e.target.value as any)}
                    className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Organ Needed</label>
                  <select
                    value={newOrganNeeded}
                    onChange={(e) => setNewOrganNeeded(e.target.value as any)}
                    className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                  >
                    <option value="Kidney">Kidney</option>
                    <option value="Heart">Heart</option>
                    <option value="Liver">Liver</option>
                    <option value="Lungs">Lungs</option>
                    <option value="Pancreas">Pancreas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Urgency Status</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                  >
                    <option value="Status 1A (Critical)">Status 1A (Critical)</option>
                    <option value="Status 1B (Urgent)">Status 1B (Urgent)</option>
                    <option value="Status 2 (Moderate)">Status 2 (Moderate)</option>
                    <option value="Status 3 (Stable)">Status 3 (Stable)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Waitlist Seniority (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={newWaitDays}
                  onChange={(e) => setNewWaitDays(Number(e.target.value))}
                  className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-3 py-1.5 border border-[#E4E7EC] rounded-lg text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2457A7] text-white font-semibold rounded-lg hover:bg-[#3978C5]"
                >
                  Register Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
