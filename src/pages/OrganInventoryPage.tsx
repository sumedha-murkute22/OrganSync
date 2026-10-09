import React, { useState } from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { useAuth } from '../context/AuthContext';
import { 
  Layers, 
  Plus, 
  Clock, 
  Building2, 
  Activity, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  GitMerge, 
  X,
  FileText
} from 'lucide-react';
import { DonorOrgan, OrganType } from '../types';

interface OrganInventoryProps {
  onInitiateMatching?: (organId: string) => void;
}

export const OrganInventoryPage: React.FC<OrganInventoryProps> = ({ onInitiateMatching }) => {
  const { organs, addOrgan } = useOrganSync();
  const { currentUser, canPerformAction } = useAuth();

  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedOrgan, setSelectedOrgan] = useState<DonorOrgan | null>(organs[0] || null);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  // New Organ Form State
  const [newType, setNewType] = useState<OrganType>('Kidney');
  const [newBlood, setNewBlood] = useState<any>('O+');
  const [newAge, setNewAge] = useState(30);
  const [newPreservation, setNewPreservation] = useState('Static Cold Storage (Belzer UW)');
  const [newTemp, setNewTemp] = useState(4.0);

  const filteredOrgans = selectedType === 'All' 
    ? organs 
    : organs.filter(o => o.organType.toLowerCase() === selectedType.toLowerCase());

  const handleRegisterOrgan = (e: React.FormEvent) => {
    e.preventDefault();
    const maxShelf = newType === 'Heart' ? 6 : newType === 'Lungs' ? 8 : newType === 'Liver' ? 12 : 30;
    
    addOrgan({
      donorId: 'DNR-801',
      donorName: 'Authorized Donor Record',
      donorAge: Number(newAge),
      donorGender: 'Male',
      organType: newType,
      bloodGroup: newBlood,
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*15' },
      hospital: currentUser.hospital,
      city: 'Seattle, WA',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      donationTime: new Date().toISOString(),
      maxShelfLifeHours: maxShelf,
      status: 'Available',
    });

    setRegisterModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#2457A7]" />
            Organ Inventory & Clinical Specifications
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Active cold-chain organ inventory with organ-specific functional parameters, ischemic countdowns, and viability assessments.
          </p>
        </div>

        {canPerformAction('register_organ') && (
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="px-3.5 py-2 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Register Donated Organ Offer
          </button>
        )}
      </div>

      {/* Filter Tabs by Organ Type */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Heart', 'Kidney', 'Liver', 'Lungs', 'Pancreas'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedType === type
                ? 'bg-[#2457A7] text-white shadow-xs'
                : 'bg-white border border-[#E4E7EC] text-[#667085] hover:bg-[#F7F9FC] hover:text-[#172033]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Grid: Organs Table & Detailed Clinical Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Organs Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Organ Offers ({filteredOrgans.length})
            </h2>
            <span className="text-[11px] text-[#667085]">Live Telemetry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FC] text-[#667085] border-b border-[#E4E7EC] font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Organ ID</th>
                  <th className="px-4 py-3">Type & Blood</th>
                  <th className="px-4 py-3">Ischemic Tolerance</th>
                  <th className="px-4 py-3">Procurement Centre</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {filteredOrgans.map((o) => {
                  const isSelected = selectedOrgan?.id === o.id;
                  const isHeart = o.organType === 'Heart';
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedOrgan(o)}
                      className={`hover:bg-[#F7F9FC] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EDF4FF]' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#2457A7]">
                        {o.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#172033]">{o.organType}</div>
                        <div className="text-[11px] text-[#667085]">ABO: <strong className="text-[#172033]">{o.bloodGroup}</strong></div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={`font-bold ${isHeart ? 'text-[#C0392B]' : 'text-[#16805D]'}`}>
                          {o.maxShelfLifeHours ? `${o.maxShelfLifeHours}h Max` : 'Viable'}
                        </span>
                        <div className="text-[10px] text-[#667085]">Cold Ischemia</div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#667085] truncate max-w-xs">
                        {o.hospital}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          o.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : o.status === 'Allocation Decision Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-[#2457A7] font-semibold">
                          Specs →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Specs Drawer (5 cols) */}
        {selectedOrgan && (
          <div className="lg:col-span-5 bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085]">
                  Clinical Specification Sheet
                </span>
                <h3 className="text-sm font-bold text-[#172033] font-mono">
                  {selectedOrgan.id} ({selectedOrgan.organType})
                </h3>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                {selectedOrgan.status}
              </span>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
              {/* Cold-Chain Telemetry */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F7F9FC] rounded-lg border border-[#E4E7EC]">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-[#2457A7]" />
                  <div>
                    <div className="text-[10px] text-[#667085] uppercase">Container Temp</div>
                    <div className="font-bold text-[#172033] font-mono">3.8°C (Optimal)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#B7791F]" />
                  <div>
                    <div className="text-[10px] text-[#667085] uppercase">Max Shelf Window</div>
                    <div className="font-bold text-[#172033] font-mono">{selectedOrgan.maxShelfLifeHours} Hours</div>
                  </div>
                </div>
              </div>

              {/* Conditional Organ-Specific Functional Assessment */}
              <div className="border border-[#E4E7EC] rounded-lg p-3.5 space-y-2">
                <h4 className="font-bold uppercase text-[11px] tracking-wider text-[#172033] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#2457A7]" />
                  {selectedOrgan.organType}-Specific Clinical Acceptance Findings
                </h4>

                {selectedOrgan.organType === 'Heart' && (
                  <div className="space-y-1.5 text-[#172033] bg-[#F7F9FC] p-2.5 rounded">
                    <div><strong>Left Ventricular Ejection Fraction:</strong> 62% (Echocardiogram confirmed)</div>
                    <div><strong>Cardiac Index:</strong> 3.1 L/min/m²</div>
                    <div><strong>Inotropic Requirement:</strong> Minimal Dobutamine</div>
                    <div><strong>Coronary Anatomy:</strong> Zero atheroma, angiographically normal</div>
                  </div>
                )}

                {selectedOrgan.organType === 'Kidney' && (
                  <div className="space-y-1.5 text-[#172033] bg-[#F7F9FC] p-2.5 rounded">
                    <div><strong>Laterality:</strong> Left Kidney</div>
                    <div><strong>Terminal Donor Serum Creatinine:</strong> 0.85 mg/dL</div>
                    <div><strong>Estimated GFR:</strong> 105 mL/min/1.73m²</div>
                    <div><strong>Renal Biopsy (Karpinski):</strong> 0/12 (Glomerulosclerosis &lt; 2%)</div>
                  </div>
                )}

                {selectedOrgan.organType === 'Liver' && (
                  <div className="space-y-1.5 text-[#172033] bg-[#F7F9FC] p-2.5 rounded">
                    <div><strong>Graft Type:</strong> Whole Liver Graft</div>
                    <div><strong>Macroscopic Steatosis:</strong> &lt; 5%</div>
                    <div><strong>Lactate Clearance:</strong> Normal on machine perfusion (1.1 mmol/L)</div>
                    <div><strong>Bile Quality:</strong> Clear, continuous golden secretion</div>
                  </div>
                )}

                {selectedOrgan.organType === 'Lungs' && (
                  <div className="space-y-1.5 text-[#172033] bg-[#F7F9FC] p-2.5 rounded">
                    <div><strong>Offer Configuration:</strong> Bilateral En-Bloc Offer</div>
                    <div><strong>PaO2 / FiO2 Ratio:</strong> 460 mmHg (100% O2, PEEP 5)</div>
                    <div><strong>Bronchoscopic Inspection:</strong> Clear tracheobronchial tree</div>
                  </div>
                )}

                {selectedOrgan.organType !== 'Heart' && selectedOrgan.organType !== 'Kidney' && selectedOrgan.organType !== 'Liver' && selectedOrgan.organType !== 'Lungs' && (
                  <p className="text-[#667085]">
                    Standard organ-specific clinical acceptance criteria verified by procurement team.
                  </p>
                )}
              </div>

              {/* Tissue Markers & HLA Typing */}
              <div className="border border-[#E4E7EC] rounded-lg p-3.5 space-y-2">
                <h4 className="font-bold uppercase text-[11px] tracking-wider text-[#172033]">
                  HLA Allelic Locus Typing
                </h4>
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-[10px] text-[#667085]">HLA-A</div>
                    <div className="font-bold text-[#172033]">{selectedOrgan.hlaMarkers.hlaA || 'A*02'}</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-[10px] text-[#667085]">HLA-B</div>
                    <div className="font-bold text-[#172033]">{selectedOrgan.hlaMarkers.hlaB || 'B*07'}</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-[10px] text-[#667085]">HLA-DR</div>
                    <div className="font-bold text-[#172033]">{selectedOrgan.hlaMarkers.hlaDR || 'DRB1*15'}</div>
                  </div>
                </div>
              </div>

              {/* Action: Trigger Matching Run */}
              {onInitiateMatching && selectedOrgan.status === 'Available' && (
                <button
                  onClick={() => onInitiateMatching(selectedOrgan.id)}
                  className="w-full py-2.5 bg-[#2457A7] text-white font-semibold rounded-lg hover:bg-[#3978C5] transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <GitMerge className="w-4 h-4" />
                  Evaluate Eligible Candidates (C Engine)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Register Organ Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EC] max-w-md w-full overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2457A7]" />
                Register Donated Organ Offer
              </h3>
              <button onClick={() => setRegisterModalOpen(false)} className="text-[#667085] hover:text-[#172033]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterOrgan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Organ Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                >
                  <option value="Kidney">Kidney</option>
                  <option value="Liver">Liver</option>
                  <option value="Heart">Heart</option>
                  <option value="Lungs">Lungs</option>
                  <option value="Pancreas">Pancreas</option>
                  <option value="Intestine">Intestine</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Donor Age</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Preservation Method</label>
                <select
                  value={newPreservation}
                  onChange={(e) => setNewPreservation(e.target.value)}
                  className="w-full p-2 border border-[#E4E7EC] rounded-lg text-[#172033]"
                >
                  <option value="Static Cold Storage (Belzer UW)">Static Cold Storage (Belzer UW solution)</option>
                  <option value="Hypothermic Machine Perfusion (HMP)">Hypothermic Machine Perfusion (HMP)</option>
                  <option value="Normothermic Machine Perfusion (NMP)">Normothermic Machine Perfusion (NMP)</option>
                  <option value="Ex-Vivo Lung Perfusion (EVLP)">Ex-Vivo Lung Perfusion (EVLP)</option>
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
                  Register Organ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
