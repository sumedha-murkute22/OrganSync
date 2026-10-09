import React, { useState, useEffect } from 'react';
import { Recipient, OrganType, BloodGroup, UrgencyLevel, RecipientStatus } from '../../types';
import { Modal } from '../common/Modal';
import { ShieldCheck } from 'lucide-react';

interface RecipientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Recipient, 'id'>) => void;
  initialData?: Recipient | null;
}

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

export const RecipientFormModal: React.FC<RecipientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(38);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [organNeeded, setOrganNeeded] = useState<OrganType>('Heart');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Status 1A (Critical)');
  const [daysWaiting, setDaysWaiting] = useState<number>(180);
  const [hlaA, setHlaA] = useState('A*02');
  const [hlaB, setHlaB] = useState('B*07');
  const [hlaDR, setHlaDR] = useState('DRB1*04');
  const [praScore, setPraScore] = useState<number>(10);
  const [selectedHospitalIndex, setSelectedHospitalIndex] = useState<number>(0);
  const [status, setStatus] = useState<RecipientStatus>('Waiting');
  const [medicalNotes, setMedicalNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAge(initialData.age);
      setGender(initialData.gender);
      setOrganNeeded(initialData.organNeeded);
      setBloodGroup(initialData.bloodGroup);
      setUrgency(initialData.urgency);
      setHlaA(initialData.hlaMarkers.hlaA);
      setHlaB(initialData.hlaMarkers.hlaB);
      setHlaDR(initialData.hlaMarkers.hlaDR);
      setPraScore(initialData.praScore);
      setStatus(initialData.status);
      setMedicalNotes(initialData.medicalNotes || '');

      const now = new Date().getTime();
      const reg = new Date(initialData.registrationDate).getTime();
      setDaysWaiting(Math.max(1, Math.floor((now - reg) / (1000 * 60 * 60 * 24))));

      const hIndex = POPULAR_HOSPITALS.findIndex(h => h.name === initialData.hospital);
      if (hIndex >= 0) setSelectedHospitalIndex(hIndex);
    } else {
      setName('');
      setAge(42);
      setOrganNeeded('Kidney');
      setBloodGroup('O+');
      setUrgency('Status 1A (Critical)');
      setDaysWaiting(120);
      setPraScore(8);
      setStatus('Waiting');
      setMedicalNotes('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hosp = POPULAR_HOSPITALS[selectedHospitalIndex] || POPULAR_HOSPITALS[0];

    const regDate = new Date();
    regDate.setTime(regDate.getTime() - daysWaiting * 24 * 60 * 60 * 1000);

    onSubmit({
      name: name || 'Anonymous Patient',
      age: Number(age),
      gender,
      organNeeded,
      bloodGroup,
      urgency,
      registrationDate: regDate.toISOString(),
      hlaMarkers: {
        hlaA,
        hlaB,
        hlaDR,
      },
      praScore: Number(praScore),
      hospital: hosp.name,
      city: hosp.city,
      coordinates: { lat: hosp.lat, lng: hosp.lng },
      status,
      medicalNotes,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Recipient Patient [${initialData.id}]` : 'Register Waiting Recipient Patient'}
      subtitle="Adds record to hospital transplant priority registry"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Patient Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Patient Full Name <span className="text-teal-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Age & Gender</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="99"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 text-center"
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Required Organ & Blood Group & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Required Organ <span className="text-teal-600">*</span>
            </label>
            <select
              value={organNeeded}
              onChange={(e) => setOrganNeeded(e.target.value as OrganType)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
            >
              <option value="Kidney">Kidney</option>
              <option value="Liver">Liver</option>
              <option value="Heart">Heart</option>
              <option value="Lungs">Lungs</option>
              <option value="Pancreas">Pancreas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Blood Group (ABO) <span className="text-rose-600">*</span>
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
            >
              <option value="O-">O-</option>
              <option value="O+">O+</option>
              <option value="A-">A-</option>
              <option value="A+">A+</option>
              <option value="B-">B-</option>
              <option value="B+">B+</option>
              <option value="AB-">AB-</option>
              <option value="AB+">AB+ (Univ. Recipient)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Urgency Tier <span className="text-rose-600">*</span>
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
            >
              <option value="Status 1A (Critical)">Status 1A (Critical - Highest Priority)</option>
              <option value="Status 1B (Urgent)">Status 1B (Urgent)</option>
              <option value="Status 2 (Moderate)">Status 2 (Moderate)</option>
              <option value="Status 3 (Stable)">Status 3 (Stable)</option>
            </select>
          </div>
        </div>

        {/* Row 3: HLA Antigen Typing & PRA Score */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Recipient HLA Alleles & Antibody Sensitization
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">HLA-A</label>
              <input
                type="text"
                value={hlaA}
                onChange={(e) => setHlaA(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">HLA-B</label>
              <input
                type="text"
                value={hlaB}
                onChange={(e) => setHlaB(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">HLA-DR</label>
              <input
                type="text"
                value={hlaDR}
                onChange={(e) => setHlaDR(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">PRA (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={praScore}
                onChange={(e) => setPraScore(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold"
                title="Panel Reactive Antibodies %"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Hospital & Days on Waitlist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Registered Hospital <span className="text-teal-600">*</span>
            </label>
            <select
              value={selectedHospitalIndex}
              onChange={(e) => setSelectedHospitalIndex(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
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
              Days on National Waitlist
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={daysWaiting}
              onChange={(e) => setDaysWaiting(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Row 5: Medical Notes & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis & Clinical Presentation</label>
            <input
              type="text"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="e.g. Cardiogenic shock, VA-ECMO support active..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Waitlist Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RecipientStatus)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
            >
              <option value="Waiting">Waiting</option>
              <option value="Matched">Matched</option>
              <option value="Transplanted">Transplanted</option>
              <option value="Inactive">Inactive</option>
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
            {initialData ? 'Save Changes' : 'Register Recipient'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
