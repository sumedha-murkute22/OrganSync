import React, { useState, useMemo } from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { Recipient, OrganType, BloodGroup, UrgencyLevel, RecipientStatus } from '../types';
import { OrganBadge } from '../components/common/OrganBadge';
import { BloodGroupBadge } from '../components/common/BloodGroupBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { RecipientFormModal } from '../components/recipients/RecipientFormModal';
import { 
  Plus, 
  Search, 
  Users, 
  Hospital, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Clock
} from 'lucide-react';

export const RecipientsPage: React.FC = () => {
  const { recipients, addRecipient, updateRecipient, deleteRecipient, recipientHashTable } = useOrganSync();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgan, setSelectedOrgan] = useState<OrganType | 'All'>('All');
  const [selectedBlood, setSelectedBlood] = useState<BloodGroup | 'All'>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<RecipientStatus | 'All'>('All');

  const tableMetrics = recipientHashTable.getMetrics();

  // Filtered List
  const filteredRecipients = useMemo(() => {
    return recipients.filter((rec) => {
      const matchesSearch =
        rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOrgan = selectedOrgan === 'All' || rec.organNeeded === selectedOrgan;
      const matchesBlood = selectedBlood === 'All' || rec.bloodGroup === selectedBlood;
      const matchesUrgency = selectedUrgency === 'All' || rec.urgency === selectedUrgency;
      const matchesStatus = selectedStatus === 'All' || rec.status === selectedStatus;

      return matchesSearch && matchesOrgan && matchesBlood && matchesUrgency && matchesStatus;
    });
  }, [recipients, searchQuery, selectedOrgan, selectedBlood, selectedUrgency, selectedStatus]);

  const handleEdit = (rec: Recipient) => {
    setEditingRecipient(rec);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to remove recipient ${id}?`)) {
      deleteRecipient(id);
    }
  };

  const getDaysWaiting = (dateStr: string) => {
    const reg = new Date(dateStr).getTime();
    const now = Date.now();
    return Math.max(1, Math.floor((now - reg) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-sky-600" />
            <span>Waiting Recipients Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritize patients by urgency, waitlist tenure, HLA profile, and PRA sensitization
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRecipient(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm shadow-sky-600/20 flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register New Recipient</span>
        </button>
      </div>

      {/* Priority Queue & Hash Table Banner */}
      <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-mono font-bold text-xs border border-sky-200">
              PRIORITY MAX-HEAP & HASH TABLE
            </span>
            <span className="text-xs text-slate-700 font-bold">
              Dynamic multi-factor priority ranking with O(log N) operations
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-600">Total Registered: <strong className="text-sky-700">{recipients.length}</strong></span>
            <span className="text-slate-600">Hash Buckets: <strong className="text-sky-700">{tableMetrics.capacity}</strong></span>
            <span className="text-slate-600">Status 1A: <strong className="text-rose-600">{recipients.filter(r => r.urgency === 'Status 1A (Critical)').length}</strong></span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient Name, ID, Hospital, or City..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Organ Filter */}
          <select
            value={selectedOrgan}
            onChange={(e) => setSelectedOrgan(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
          >
            <option value="All">All Organ Types</option>
            <option value="Kidney">Kidney</option>
            <option value="Liver">Liver</option>
            <option value="Heart">Heart</option>
            <option value="Lungs">Lungs</option>
            <option value="Pancreas">Pancreas</option>
          </select>

          {/* Blood Group Filter */}
          <select
            value={selectedBlood}
            onChange={(e) => setSelectedBlood(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
          >
            <option value="All">All Blood Groups</option>
            <option value="O-">O-</option>
            <option value="O+">O+</option>
            <option value="A-">A-</option>
            <option value="A+">A+</option>
            <option value="B-">B-</option>
            <option value="B+">B+</option>
            <option value="AB-">AB-</option>
            <option value="AB+">AB+ (Univ. Recipient)</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
          >
            <option value="All">All Urgency Tiers</option>
            <option value="Status 1A (Critical)">Status 1A (Critical)</option>
            <option value="Status 1B (Urgent)">Status 1B (Urgent)</option>
            <option value="Status 2 (Moderate)">Status 2 (Moderate)</option>
            <option value="Status 3 (Stable)">Status 3 (Stable)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="Matched">Matched</option>
            <option value="Transplanted">Transplanted</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Recipient Cards Grid */}
      {filteredRecipients.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No matching recipients found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipients.map((rec) => {
            const isCritical = rec.urgency === 'Status 1A (Critical)';
            const daysWaiting = getDaysWaiting(rec.registrationDate);

            return (
              <div
                key={rec.id}
                className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                  isCritical && rec.status === 'Waiting'
                    ? 'border-rose-300 shadow-xs bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <OrganBadge type={rec.organNeeded} />
                      <BloodGroupBadge bloodGroup={rec.bloodGroup} />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(rec)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Patient Name & Urgency */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">{rec.name}</h3>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{rec.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <UrgencyBadge urgency={rec.urgency} size="sm" />
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        rec.status === 'Waiting'
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : rec.status === 'Matched'
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>

                  {/* Patient Demographics & PRA */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Demographics</span>
                      <strong className="text-slate-800">{rec.age} yrs • {rec.gender}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Antibody Sensitization</span>
                      <strong className="text-amber-700 font-mono">PRA: {rec.praScore}%</strong>
                    </div>
                  </div>

                  {/* Hospital */}
                  <div className="text-xs text-slate-700 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <Hospital className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">{rec.hospital}</div>
                      <div className="text-[11px] text-slate-500">{rec.city}</div>
                    </div>
                  </div>

                  {/* HLA Alleles */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-sky-600" />
                      <span>Recipient HLA Alleles:</span>
                    </div>
                    <div className="flex gap-1.5 font-mono text-[11px] text-sky-800 font-bold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        A: {rec.hlaMarkers.hlaA}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        B: {rec.hlaMarkers.hlaB}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        DR: {rec.hlaMarkers.hlaDR}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Notes */}
                  {rec.medicalNotes && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                      "{rec.medicalNotes}"
                    </p>
                  )}
                </div>

                {/* Waitlist Tenure Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Waitlist Duration:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {daysWaiting} days
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <RecipientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          if (editingRecipient) {
            updateRecipient(editingRecipient.id, data);
          } else {
            addRecipient(data);
          }
        }}
        initialData={editingRecipient}
      />
    </div>
  );
};
