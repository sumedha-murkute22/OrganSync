import React, { useState } from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { OrganBadge } from '../components/common/OrganBadge';
import { OrganFormModal } from '../components/organs/OrganFormModal';
import { RecipientFormModal } from '../components/recipients/RecipientFormModal';
import { CompatibilityScorer } from '../dsa/CompatibilityScorer';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Clock, 
  GitMerge, 
  Truck, 
  Plus, 
  ArrowRight, 
  Flame, 
  TrendingUp
} from 'lucide-react';

export const DashboardPage: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { 
    organs, 
    recipients, 
    matches, 
    transportQueue, 
    addOrgan, 
    addRecipient, 
    generateMatches 
  } = useOrganSync();

  const [isOrganModalOpen, setIsOrganModalOpen] = useState(false);
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);

  const availableOrgans = organs.filter(o => o.status === 'Available');
  const waitingRecipients = recipients.filter(r => r.status === 'Waiting');
  const criticalRecipients = waitingRecipients.filter(r => r.urgency === 'Status 1A (Critical)');
  
  // Organs nearing expiry (< 4h remaining)
  const expiringOrgans = availableOrgans.filter(o => {
    const rem = CompatibilityScorer.getRemainingShelfLifeHours(o);
    return rem > 0 && rem <= 4.0;
  });

  const activeTransports = transportQueue.filter(t => t.stage !== 'Completed');

  // Distribution by organ type
  const organTypeCounts = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas'].map(type => ({
    type,
    available: availableOrgans.filter(o => o.organType === type).length,
    waiting: waitingRecipients.filter(r => r.organNeeded === type).length,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-teal-600" />
            <span>Clinical Operations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry, priority monitoring, and organ allocation status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsOrganModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-teal-800 border border-slate-300 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Organ</span>
          </button>

          <button
            onClick={() => setIsRecipientModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-sky-800 border border-slate-300 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Recipient</span>
          </button>

          <button
            onClick={() => {
              generateMatches();
              setActiveTab('matching');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-all shadow-sm shadow-teal-600/20"
          >
            <GitMerge className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Run Match Engine</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banner if there are expiring organs or critical patients */}
      {(expiringOrgans.length > 0 || criticalRecipients.length > 0) && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <Flame className="w-5 h-5 text-rose-600 animate-pulse" />
              <span>Priority Action Required: Active Critical Cases</span>
            </div>
            <span className="text-[11px] font-mono text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 font-bold">
              DSA HEAP ALERTS TRIGGERED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {expiringOrgans.length > 0 && (
              <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1 shadow-xs">
                <div className="text-rose-800 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>{expiringOrgans.length} Grafts Nearing Cold-Ischemia Limit</span>
                </div>
                <div className="text-slate-600 space-y-1">
                  {expiringOrgans.slice(0, 2).map(o => (
                    <div key={o.id} className="flex justify-between items-center text-[11px]">
                      <span>{o.organType} [{o.id}] ({o.hospital})</span>
                      <strong className="text-rose-600 font-mono">
                        {CompatibilityScorer.getRemainingShelfLifeHours(o)}h remaining
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {criticalRecipients.length > 0 && (
              <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1 shadow-xs">
                <div className="text-rose-800 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{criticalRecipients.length} Critical Status 1A Patients Awaiting Match</span>
                </div>
                <div className="text-slate-600 space-y-1">
                  {criticalRecipients.slice(0, 2).map(r => (
                    <div key={r.id} className="flex justify-between items-center text-[11px]">
                      <span>{r.name} ({r.organNeeded}, {r.bloodGroup})</span>
                      <span className="text-rose-700 font-semibold">{r.hospital.slice(0, 22)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => setActiveTab('organs')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 cursor-pointer hover:border-teal-500 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-teal-800 font-bold">
            <span>Available Organs</span>
            <Activity className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{availableOrgans.length}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Indexed in Hash Table</span>
            <ArrowRight className="w-3 h-3 text-teal-600" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('recipients')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 cursor-pointer hover:border-sky-500 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-sky-800 font-bold">
            <span>Waiting Patients</span>
            <Users className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{waitingRecipients.length}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Ranked in Priority Heap</span>
            <ArrowRight className="w-3 h-3 text-sky-600" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('priority')}
          className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-2 cursor-pointer hover:border-rose-400 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-rose-800 font-bold">
            <span>Urgent Status 1A</span>
            <Flame className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-rose-700 font-mono">{criticalRecipients.length}</div>
          <div className="flex items-center justify-between text-[11px] text-rose-600 font-medium">
            <span>Top Heap Nodes</span>
            <ArrowRight className="w-3 h-3 text-rose-600" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('priority')}
          className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2 cursor-pointer hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
            <span>Nearing Expiry</span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-amber-700 font-mono">{expiringOrgans.length}</div>
          <div className="flex items-center justify-between text-[11px] text-amber-600 font-medium">
            <span>&lt;4h Ischemia left</span>
            <ArrowRight className="w-3 h-3 text-amber-600" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('matching')}
          className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 cursor-pointer hover:border-emerald-500 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
            <span>Generated Matches</span>
            <GitMerge className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-emerald-700 font-mono">{matches.length}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Bipartite Max Weight</span>
            <ArrowRight className="w-3 h-3 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Grid: Organ Type Supply/Demand + Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply vs Demand by Organ Type */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Organ Supply vs Recipient Demand Breakdown</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Real-time counts</span>
          </div>

          <div className="space-y-3">
            {organTypeCounts.map(item => {
              const total = Math.max(1, item.available + item.waiting);
              const availPct = (item.available / total) * 100;
              const waitPct = (item.waiting / total) * 100;

              return (
                <div key={item.type} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <OrganBadge type={item.type as any} />
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-teal-700 font-bold"><strong>{item.available}</strong> available</span>
                      <span className="text-sky-700 font-bold"><strong>{item.waiting}</strong> waiting</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full flex overflow-hidden">
                    <div className="bg-teal-600 h-full" style={{ width: `${availPct}%` }} title={`Available: ${item.available}`} />
                    <div className="bg-sky-600 h-full" style={{ width: `${waitPct}%` }} title={`Waiting: ${item.waiting}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Transport Pipeline Preview */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Active Transplant Transport Pipeline</span>
              </h3>
              <button
                onClick={() => setActiveTab('transport')}
                className="text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1 font-bold"
              >
                <span>View Queue</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {activeTransports.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <Truck className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No active transport dispatches currently in transit.</p>
                <button
                  onClick={() => setActiveTab('matching')}
                  className="text-xs text-teal-700 font-bold hover:underline"
                >
                  Generate and accept matches in Match Engine
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTransports.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <OrganBadge type={item.organType} size="sm" />
                        <span>{item.id}</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        {item.stage}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      From <strong className="text-slate-900">{item.sourceCity}</strong> to <strong className="text-slate-900">{item.destinationCity}</strong> ({item.distanceKm} km)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs mt-4">
            <span className="text-slate-500 font-medium">Transplant Dispatch Queue Type:</span>
            <span className="font-mono text-teal-800 font-bold">FIFO Queue (O(1))</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OrganFormModal
        isOpen={isOrganModalOpen}
        onClose={() => setIsOrganModalOpen(false)}
        onSubmit={addOrgan}
      />

      <RecipientFormModal
        isOpen={isRecipientModalOpen}
        onClose={() => setIsRecipientModalOpen(false)}
        onSubmit={addRecipient}
      />
    </div>
  );
};
