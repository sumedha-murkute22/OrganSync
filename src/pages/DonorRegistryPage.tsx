import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  Plus, 
  Building2, 
  ShieldCheck, 
  FileCheck, 
  Activity, 
  History, 
  X,
  Layers
} from 'lucide-react';
import { Donor } from '../types';

export const DonorRegistryPage: React.FC = () => {
  const { currentUser, canPerformAction } = useAuth();

  const [donors, setDonors] = useState<Donor[]>([
    {
      id: 'DNR-801',
      donorCategory: 'Deceased',
      age: 32,
      gender: 'Male',
      bloodGroup: 'O+',
      hospital: 'St. Jude National Transplant Institute',
      city: 'Seattle, WA',
      consentStatus: 'Authorized',
      screeningStatus: 'Completed',
      infectiousScreening: { hiv: 'Negative', hbv: 'Negative', hcv: 'Negative', cmv: 'Negative', ebv: 'Negative' },
      responsiblePhysician: 'Dr. Robert Martinez, MD',
      registrationDate: '2026-10-08T18:00:00Z',
      status: 'Authorized',
      organsDonated: ['ORG-H001', 'ORG-K001', 'ORG-L001'],
    },
    {
      id: 'DNR-802',
      donorCategory: 'Deceased',
      age: 26,
      gender: 'Female',
      bloodGroup: 'A+',
      hospital: 'Memorial General Hospital',
      city: 'Portland, OR',
      consentStatus: 'Family Consent Confirmed',
      screeningStatus: 'Completed',
      infectiousScreening: { hiv: 'Negative', hbv: 'Negative', hcv: 'Negative', cmv: 'Negative', ebv: 'Negative' },
      responsiblePhysician: 'Dr. Katherine Bell, MD',
      registrationDate: '2026-10-09T02:30:00Z',
      status: 'Authorized',
      organsDonated: ['ORG-K002', 'ORG-LNG01'],
    },
    {
      id: 'DNR-803',
      donorCategory: 'Living',
      age: 38,
      gender: 'Female',
      bloodGroup: 'O-',
      hospital: 'St. Jude National Transplant Institute',
      city: 'Seattle, WA',
      consentStatus: 'Living Donor Independent Assessment Approved',
      screeningStatus: 'Completed',
      infectiousScreening: { hiv: 'Negative', hbv: 'Negative', hcv: 'Negative', cmv: 'Negative', ebv: 'Negative' },
      responsiblePhysician: 'Dr. James Sterling, MD',
      registrationDate: '2026-10-07T10:00:00Z',
      status: 'Authorized',
      organsDonated: ['ORG-K003'],
    },
  ]);

  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(donors[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'authorization' | 'organs' | 'audit'>('overview');
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  // New Donor Form State
  const [newCategory, setNewCategory] = useState<'Deceased' | 'Living'>('Deceased');
  const [newAge, setNewAge] = useState(35);
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newBlood, setNewBlood] = useState<'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'>('O+');
  const [newConsent, setNewConsent] = useState('Authorized');

  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Donor = {
      id: `DNR-${donors.length + 804}`,
      donorCategory: newCategory,
      age: Number(newAge),
      gender: newGender,
      bloodGroup: newBlood,
      hospital: currentUser.hospital,
      city: 'Seattle, WA',
      consentStatus: newCategory === 'Living' ? 'Living Donor Independent Assessment Approved' : (newConsent as any),
      screeningStatus: 'Completed',
      infectiousScreening: { hiv: 'Negative', hbv: 'Negative', hcv: 'Negative', cmv: 'Negative', ebv: 'Negative' },
      responsiblePhysician: currentUser.fullName,
      registrationDate: new Date().toISOString(),
      status: 'Authorized',
      organsDonated: [],
    };

    setDonors([created, ...donors]);
    setSelectedDonor(created);
    setRegisterModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#2457A7]" />
            Donor Registry & Consent Management
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Manages deceased and living donor admissions, independent assessments, statutory consents, and clinical screening.
          </p>
        </div>

        {canPerformAction('register_donor') && (
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="px-3.5 py-2 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Register Donor Record
          </button>
        )}
      </div>

      {/* Grid: Donors Table & Dossier Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donor List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Registered Donors ({donors.length})
            </h2>
            <span className="text-[11px] text-[#667085]">Filterable Records</span>
          </div>

          <div className="divide-y divide-[#E4E7EC]">
            {donors.map((d) => {
              const isSelected = selectedDonor?.id === d.id;
              const isLiving = d.donorCategory === 'Living';
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDonor(d)}
                  className={`p-4 hover:bg-[#F7F9FC] cursor-pointer transition-colors space-y-1.5 ${
                    isSelected ? 'bg-[#EDF4FF]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#2457A7]">
                      {d.id}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      isLiving 
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {d.donorCategory} Donation
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#172033]">
                    <span className="font-semibold">{d.bloodGroup} • Age {d.age} • {d.gender}</span>
                    <span className="text-[11px] text-[#16805D] font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Screening Verified
                    </span>
                  </div>

                  <div className="text-[11px] text-[#667085] truncate">
                    {d.hospital}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donor Dossier with Tabs (7 cols) */}
        {selectedDonor && (
          <div className="lg:col-span-7 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden flex flex-col">
            {/* Dossier Header */}
            <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085]">
                  Donor Dossier Record
                </span>
                <h3 className="text-sm font-bold text-[#172033] font-mono">
                  {selectedDonor.id} ({selectedDonor.donorCategory} Donor)
                </h3>
              </div>
              <span className="text-xs bg-[#16805D]/10 text-[#16805D] border border-[#16805D]/20 px-2.5 py-0.5 rounded-full font-semibold">
                Status: {selectedDonor.status}
              </span>
            </div>

            {/* Dossier Navigation Tabs */}
            <div className="flex border-b border-[#E4E7EC] px-5 bg-white text-xs">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'clinical', label: 'Clinical Assessment' },
                { id: 'authorization', label: 'Donation Authorization' },
                { id: 'organs', label: 'Associated Organs' },
                { id: 'audit', label: 'Audit Trail' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-3 font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#2457A7] text-[#2457A7]'
                      : 'border-transparent text-[#667085] hover:text-[#172033]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-5 flex-1 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-[#F7F9FC] p-3.5 rounded-lg border border-[#E4E7EC]">
                    <div><span className="text-[#667085]">Category:</span> <strong className="text-[#172033] ml-1">{selectedDonor.donorCategory} Donation</strong></div>
                    <div><span className="text-[#667085]">Blood Group & Rh:</span> <strong className="text-[#172033] ml-1">{selectedDonor.bloodGroup}</strong></div>
                    <div><span className="text-[#667085]">Age:</span> <strong className="text-[#172033] ml-1">{selectedDonor.age} years</strong></div>
                    <div><span className="text-[#667085]">Gender:</span> <strong className="text-[#172033] ml-1">{selectedDonor.gender}</strong></div>
                    <div><span className="text-[#667085]">Admitting Facility:</span> <strong className="text-[#172033] ml-1">{selectedDonor.hospital}</strong></div>
                    <div><span className="text-[#667085]">Attending Physician:</span> <strong className="text-[#172033] ml-1">{selectedDonor.responsiblePhysician}</strong></div>
                  </div>

                  <div className="border border-[#E4E7EC] rounded-lg p-3.5 space-y-2">
                    <h4 className="font-bold text-[#172033] uppercase text-[11px] tracking-wider">
                      Infectious Disease Serology & NAT Screening
                    </h4>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {Object.entries(selectedDonor.infectiousScreening).map(([virus, result]) => (
                        <div key={virus} className="p-2 rounded bg-emerald-50 border border-emerald-200">
                          <div className="font-mono uppercase font-bold text-[10px] text-emerald-800">{virus}</div>
                          <div className="font-semibold text-emerald-700 text-xs mt-0.5">{result}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'clinical' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F7F9FC] rounded-lg border border-[#E4E7EC]">
                    <h4 className="font-bold text-[#172033] mb-1">Clinical Assessment Status</h4>
                    <p className="text-[#667085]">
                      All critical organ systems evaluated according to OPTN/UNOS clinical procurement guidelines. Hemodynamic stability maintained with minimal vasopressor support. Zero systemic malignancy or uncontrolled bacteremia.
                    </p>
                  </div>
                  <div className="p-3 border border-[#E4E7EC] rounded-lg">
                    <span className="text-[#667085]">Screening Timestamp:</span> <strong className="text-[#172033] ml-1">{selectedDonor.registrationDate}</strong>
                  </div>
                </div>
              )}

              {activeTab === 'authorization' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-[#16805D]" />
                      Statutory Consent Status: {selectedDonor.consentStatus}
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      {selectedDonor.donorCategory === 'Living'
                        ? 'Independent Donor Advocate (IDA) evaluation completed. Voluntary informed consent without coercion verified by ethical review committee.'
                        : 'First-person donor registry authorization confirmed with next-of-kin acknowledgment.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'organs' && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#172033] mb-2">Procured / Associated Organ Offers:</h4>
                  {selectedDonor.organsDonated.length > 0 ? (
                    selectedDonor.organsDonated.map(orgId => (
                      <div key={orgId} className="flex items-center justify-between p-2.5 bg-[#F7F9FC] border border-[#E4E7EC] rounded-lg">
                        <span className="font-mono font-bold text-[#2457A7]">{orgId}</span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">Active Inventory</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#667085]">No organs assigned yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="space-y-3 text-xs">
                  <div className="pl-4 border-l-2 border-[#2457A7] space-y-1">
                    <div className="font-bold text-[#172033]">Donor Registered & Cleared</div>
                    <div className="text-[11px] text-[#667085]">Responsible Clinician: {selectedDonor.responsiblePhysician}</div>
                    <div className="text-[10px] font-mono text-slate-500">{selectedDonor.registrationDate}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Register Donor Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EC] max-w-md w-full overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#2457A7]" />
                Register New Donor Record
              </h3>
              <button onClick={() => setRegisterModalOpen(false)} className="text-[#667085] hover:text-[#172033]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterDonor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Donor Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                >
                  <option value="Deceased">Deceased Donor (Brain Death / Circulatory Death)</option>
                  <option value="Living">Living Donor (Independent Assessment Required)</option>
                </select>
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
                  <label className="block font-semibold text-[#172033] mb-1">Blood Group & Rh</label>
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

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Consent / Authorization Status</label>
                <select
                  value={newConsent}
                  onChange={(e) => setNewConsent(e.target.value)}
                  className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                >
                  <option value="Authorized">First-Person Donor Registry Authorized</option>
                  <option value="Family Consent Confirmed">Legal Next-of-Kin Consent Documented</option>
                  <option value="Living Donor Independent Assessment Approved">Living Donor Independent Advocacy Cleared</option>
                </select>
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
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
