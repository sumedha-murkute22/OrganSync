import React, { useState, useEffect } from 'react';
import { DonorOrgan, OrganType, BloodGroup, OrganStatus } from '../../types';
import { Modal } from '../common/Modal';
import { ShieldCheck } from 'lucide-react';

interface OrganFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<DonorOrgan, 'id'>) => void;
  initialData?: DonorOrgan | null;
}

const DEFAULT_SHELF_LIVES: Record<OrganType, number> = {
  Heart: 5.0,
  Lungs: 7.0,
  Liver: 12.0,
  Pancreas: 14.0,
  Kidney: 30.0,
};

const POPULAR_HOSPITALS = [
  { name: 'Johns Hopkins Hospital', city: 'Baltimore, MD', lat: 39.2965, lng: -76.5927 },
  { name: 'Massachusetts General Hospital', city: 'Boston, MA', lat: 42.3631, lng: -71.0686 },
  { name: 'Cleveland Clinic', city: 'Cleveland, OH', lat: 41.5036, lng: -81.6214 },
  { name: 'Northwestern Memorial Hospital', city: 'Chicago, IL', lat: 41.8953, lng: -87.6205 },
  { name: 'Mayo Clinic', city: 'Rochester, MN', lat: 44.0225, lng: -92.4668 },
  { name: 'Stanford Health Care', city: 'Stanford, CA', lat: 37.4339, lng: -122.1764 },
  { name: 'UCLA Medical Center', city: 'Los Angeles, CA', lat: 34.0664, lng: -118.4452 },
  { name: 'Mount Sinai Hospital', city: 'New York, NY', lat: 40.7903, lng: -73.9529 },
  { name: 'Vanderbilt University Medical Center', city: 'Nashville, TN', lat: 36.1437, lng: -86.8005 },
  { name: 'Emory University Hospital', city: 'Atlanta, GA', lat: 33.7925, lng: -84.3216 },
  { name: 'Cedars-Sinai Medical Center', city: 'Los Angeles, CA', lat: 34.0754, lng: -118.3807 },
  { name: 'UPMC Presbyterian', city: 'Pittsburgh, PA', lat: 40.4433, lng: -79.9599 },
];

export const OrganFormModal: React.FC<OrganFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [donorName, setDonorName] = useState('');
  const [donorAge, setDonorAge] = useState<number>(35);
  const [donorGender, setDonorGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [organType, setOrganType] = useState<OrganType>('Kidney');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [hlaA, setHlaA] = useState('A*02');
  const [hlaB, setHlaB] = useState('B*07');
  const [hlaDR, setHlaDR] = useState('DRB1*04');
  const [selectedHospitalIndex, setSelectedHospitalIndex] = useState<number>(0);
  const [maxShelfLifeHours, setMaxShelfLifeHours] = useState<number>(30.0);
  const [hoursElapsed, setHoursElapsed] = useState<number>(2.0);
  const [status, setStatus] = useState<OrganStatus>('Available');
  const [medicalNotes, setMedicalNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setDonorName(initialData.donorName || '');
      setDonorAge(initialData.donorAge);
      setDonorGender(initialData.donorGender);
      setOrganType(initialData.organType);
      setBloodGroup(initialData.bloodGroup);
      setHlaA(initialData.hlaMarkers.hlaA);
      setHlaB(initialData.hlaMarkers.hlaB);
      setHlaDR(initialData.hlaMarkers.hlaDR);
      setMaxShelfLifeHours(initialData.maxShelfLifeHours);
      setStatus(initialData.status);
      setMedicalNotes(initialData.medicalNotes || '');

      const hIndex = POPULAR_HOSPITALS.findIndex(h => h.name === initialData.hospital);
      if (hIndex >= 0) setSelectedHospitalIndex(hIndex);
    } else {
      setDonorName(`Donor D-${Math.floor(100 + Math.random() * 900)}`);
      setDonorAge(32);
      setOrganType('Kidney');
      setBloodGroup('O+');
      setMaxShelfLifeHours(DEFAULT_SHELF_LIVES['Kidney']);
      setHoursElapsed(1.5);
      setStatus('Available');
      setMedicalNotes('');
    }
  }, [initialData, isOpen]);

  const handleOrganTypeChange = (newType: OrganType) => {
    setOrganType(newType);
    if (!initialData) {
      setMaxShelfLifeHours(DEFAULT_SHELF_LIVES[newType]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hosp = POPULAR_HOSPITALS[selectedHospitalIndex] || POPULAR_HOSPITALS[0];

    const donationDate = new Date();
    donationDate.setTime(donationDate.getTime() - hoursElapsed * 60 * 60 * 1000);

    onSubmit({
      donorName,
      donorAge: Number(donorAge),
      donorGender,
      organType,
      bloodGroup,
      hlaMarkers: {
        hlaA,
        hlaB,
        hlaDR,
      },
      hospital: hosp.name,
      city: hosp.city,
      coordinates: { lat: hosp.lat, lng: hosp.lng },
      donationTime: donationDate.toISOString(),
      maxShelfLifeHours: Number(maxShelfLifeHours),
      status,
      medicalNotes,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Donor Organ Record [${initialData.id}]` : 'Register Donor Organ Record'}
      subtitle="Adds record to hospital procurement database & matching pipeline"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Organ Type & Blood Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Organ Type <span className="text-teal-600">*</span>
            </label>
            <select
              value={organType}
              onChange={(e) => handleOrganTypeChange(e.target.value as OrganType)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            >
              <option value="Kidney">Kidney (Max ~30h Ischemia)</option>
              <option value="Liver">Liver (Max ~12h Ischemia)</option>
              <option value="Heart">Heart (Max ~5h Ischemia)</option>
              <option value="Lungs">Lungs (Max ~7h Ischemia)</option>
              <option value="Pancreas">Pancreas (Max ~14h Ischemia)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Donor Blood Group (ABO/Rh) <span className="text-rose-600">*</span>
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            >
              <option value="O-">O- (Universal Donor)</option>
              <option value="O+">O+</option>
              <option value="A-">A-</option>
              <option value="A+">A+</option>
              <option value="B-">B-</option>
              <option value="B+">B+</option>
              <option value="AB-">AB-</option>
              <option value="AB+">AB+</option>
            </select>
          </div>
        </div>

        {/* Row 2: Donor Demographics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Donor Identifier</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Donor D-782"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Donor Age</label>
            <input
              type="number"
              min="1"
              max="95"
              value={donorAge}
              onChange={(e) => setDonorAge(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
            <select
              value={donorGender}
              onChange={(e) => setDonorGender(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 3: HLA Antigen Typing */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> HLA Antigen Typing (Tissue Matching)
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Used for 25% compatibility weight</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">HLA-A</label>
              <input
                type="text"
                value={hlaA}
                onChange={(e) => setHlaA(e.target.value)}
                placeholder="e.g. A*02"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">HLA-B</label>
              <input
                type="text"
                value={hlaB}
                onChange={(e) => setHlaB(e.target.value)}
                placeholder="e.g. B*07"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">HLA-DR</label>
              <input
                type="text"
                value={hlaDR}
                onChange={(e) => setHlaDR(e.target.value)}
                placeholder="e.g. DRB1*04"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Hospital Location & Logistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Donor Recovery Hospital <span className="text-teal-600">*</span>
            </label>
            <select
              value={selectedHospitalIndex}
              onChange={(e) => setSelectedHospitalIndex(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            >
              {POPULAR_HOSPITALS.map((hosp, idx) => (
                <option key={idx} value={idx}>
                  {hosp.name} ({hosp.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hours Elapsed Since Cross-Clamp
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max={maxShelfLifeHours}
              value={hoursElapsed}
              onChange={(e) => setHoursElapsed(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Row 5: Notes & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes & Biopsy Findings</label>
            <input
              type="text"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="e.g. Perfusion pump active, zero coronary calcification..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Graft Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrganStatus)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            >
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="In Transit">In Transit</option>
              <option value="Transplanted">Transplanted</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm shadow-teal-600/20"
          >
            {initialData ? 'Save Changes' : 'Register Organ'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
