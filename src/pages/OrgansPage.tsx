import React, { useState, useMemo } from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { DonorOrgan, OrganType, BloodGroup, OrganStatus } from '../types';
import { OrganBadge } from '../components/common/OrganBadge';
import { BloodGroupBadge } from '../components/common/BloodGroupBadge';
import { ShelfLifeCountdown } from '../components/common/ShelfLifeCountdown';
import { OrganFormModal } from '../components/organs/OrganFormModal';
import { CompatibilityScorer } from '../dsa/CompatibilityScorer';
import { 
  Plus, 
  Search, 
  Database, 
  Hospital, 
  Edit3, 
  Trash2, 
  ShieldCheck
} from 'lucide-react';

export const OrgansPage: React.FC = () => {
  const { organs, addOrgan, updateOrgan, deleteOrgan, organHashTable } = useOrganSync();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrgan, setEditingOrgan] = useState<DonorOrgan | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<OrganType | 'All'>('All');
  const [selectedBlood, setSelectedBlood] = useState<BloodGroup | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<OrganStatus | 'All'>('All');

  // Metrics from Hash Table
  const tableMetrics = organHashTable.getMetrics();

  // Filtered List
  const filteredOrgans = useMemo(() => {
    return organs.filter((organ) => {
      const matchesSearch =
        organ.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organ.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organ.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (organ.donorName && organ.donorName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'All' || organ.organType === selectedType;
      const matchesBlood = selectedBlood === 'All' || organ.bloodGroup === selectedBlood;
      const matchesStatus = selectedStatus === 'All' || organ.status === selectedStatus;

      return matchesSearch && matchesType && matchesBlood && matchesStatus;
    });
  }, [organs, searchQuery, selectedType, selectedBlood, selectedStatus]);

  const handleEdit = (organ: DonorOrgan) => {
    setEditingOrgan(organ);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete organ ${id}?`)) {
      deleteOrgan(id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Database className="w-7 h-7 text-teal-600" />
            <span>Donor Organs Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track available grafts, cold-ischemic shelf lives, HLA profiles, and hospital logistics
          </p>
        </div>

        <button
          onClick={() => {
            setEditingOrgan(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm shadow-teal-600/20 flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register New Organ</span>
        </button>
      </div>

      {/* Hash Table Architecture Banner */}
      <div className="p-4 rounded-2xl bg-white border border-teal-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-mono font-bold text-xs border border-teal-200">
              HASH TABLE • O(1) LOOKUPS
            </span>
            <span className="text-xs text-slate-700 font-bold">
              Separate Chaining with Dynamic Load Factor Rebalancing
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-600">Total Entries: <strong className="text-teal-700">{tableMetrics.size}</strong></span>
            <span className="text-slate-600">Buckets: <strong className="text-teal-700">{tableMetrics.capacity}</strong></span>
            <span className="text-slate-600">Load Factor: <strong className="text-teal-700">{tableMetrics.loadFactor}</strong></span>
            <span className="text-slate-600">Collisions: <strong className="text-amber-700">{tableMetrics.collisions}</strong></span>
          </div>
        </div>

        {/* Bucket Visualization Bar */}
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Bucket Chaining Distribution ({tableMetrics.capacity} slots)</span>
            <span>Avg Access Time: ~0.04 ms</span>
          </div>
          <div className="w-full bg-slate-100 rounded-lg p-1.5 flex gap-1 overflow-x-auto border border-slate-200">
            {tableMetrics.bucketDistribution.map((chainLen, idx) => (
              <div
                key={idx}
                className={`h-4 rounded-xs flex-1 min-w-[6px] transition-all ${
                  chainLen === 0
                    ? 'bg-slate-200'
                    : chainLen === 1
                    ? 'bg-teal-500'
                    : 'bg-amber-500'
                }`}
                title={`Bucket ${idx}: ${chainLen} node(s)`}
              />
            ))}
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
            placeholder="Search by Organ ID, Donor, Hospital, or City..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Organ Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
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
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
          >
            <option value="All">All Blood Groups</option>
            <option value="O-">O- (Universal)</option>
            <option value="O+">O+</option>
            <option value="A-">A-</option>
            <option value="A+">A+</option>
            <option value="B-">B-</option>
            <option value="B+">B+</option>
            <option value="AB-">AB-</option>
            <option value="AB+">AB+</option>
          </select>

          {/* Availability Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="In Transit">In Transit</option>
            <option value="Transplanted">Transplanted</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Organ Cards Grid */}
      {filteredOrgans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Database className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No matching donor organs found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgans.map((organ) => {
            const isAvailable = organ.status === 'Available';
            const remaining = CompatibilityScorer.getRemainingShelfLifeHours(organ);
            const isNearExpiry = remaining > 0 && remaining <= 3.5;

            return (
              <div
                key={organ.id}
                className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                  isNearExpiry && isAvailable
                    ? 'border-rose-300 shadow-xs bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Badges + Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <OrganBadge type={organ.organType} />
                      <BloodGroupBadge bloodGroup={organ.bloodGroup} />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(organ)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(organ.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ID & Demographics */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm font-mono">{organ.id}</h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        organ.status === 'Available'
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : organ.status === 'Reserved'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : organ.status === 'In Transit'
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {organ.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">
                      Donor: {organ.donorName || 'Anonymous'} • {organ.donorAge} yrs ({organ.donorGender})
                    </div>
                  </div>

                  {/* Location & Hospital */}
                  <div className="text-xs text-slate-700 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <Hospital className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">{organ.hospital}</div>
                      <div className="text-[11px] text-slate-500">{organ.city}</div>
                    </div>
                  </div>

                  {/* HLA Alleles */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>HLA Antigen Typing:</span>
                    </div>
                    <div className="flex gap-1.5 font-mono text-[11px] text-teal-800 font-bold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        A: {organ.hlaMarkers.hlaA}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        B: {organ.hlaMarkers.hlaB}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        DR: {organ.hlaMarkers.hlaDR}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Notes */}
                  {organ.medicalNotes && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                      "{organ.medicalNotes}"
                    </p>
                  )}
                </div>

                {/* Cold Ischemia Countdown Bar */}
                <div className="pt-3 border-t border-slate-100">
                  <ShelfLifeCountdown organ={organ} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <OrganFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          if (editingOrgan) {
            updateOrgan(editingOrgan.id, data);
          } else {
            addOrgan(data);
          }
        }}
        initialData={editingOrgan}
      />
    </div>
  );
};
