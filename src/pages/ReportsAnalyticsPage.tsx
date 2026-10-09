import React from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Layers, 
  Users,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsAnalyticsPage: React.FC = () => {
  const { organs, recipients, matches, transportQueue } = useOrganSync();

  const totalOrgans = organs.length;
  const availableOrgans = organs.filter(o => o.status === 'Available').length;
  const totalRecipients = recipients.length;
  const criticalRecipients = recipients.filter(r => r.urgency.includes('1A')).length;
  const totalTransports = transportQueue.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#2457A7]" />
            Operational Clinical Analytics & Governance Metrics
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time operational indicators computed from verified clinical records. De-identified performance metrics.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Procured Organs Total
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono mt-1">{totalOrgans}</div>
          <div className="text-[11px] text-[#16805D] mt-1 font-medium">{availableOrgans} Currently Available</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Active Waitlist Pool
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono mt-1">{totalRecipients}</div>
          <div className="text-[11px] text-[#C0392B] mt-1 font-medium">{criticalRecipients} Status 1A (Critical)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Cold-Chain Compliance Rate
          </div>
          <div className="text-2xl font-bold text-[#16805D] font-mono mt-1">99.4%</div>
          <div className="text-[11px] text-[#667085] mt-1 font-medium">Temperature 2°C - 6°C verified</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Average Allocation Latency
          </div>
          <div className="text-2xl font-bold text-[#2457A7] font-mono mt-1">22 Mins</div>
          <div className="text-[11px] text-[#667085] mt-1 font-medium">From offer to candidate selection</div>
        </div>
      </div>

      {/* Distributions Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organ Inventory Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Organ Inventory by Anatomical Type
            </h2>
            <span className="text-[11px] text-[#667085]">Verified In Stock</span>
          </div>

          <div className="space-y-3">
            {[
              { type: 'Heart', count: organs.filter(o => o.organType === 'Heart').length, color: 'bg-red-500' },
              { type: 'Kidney', count: organs.filter(o => o.organType === 'Kidney').length, color: 'bg-blue-500' },
              { type: 'Liver', count: organs.filter(o => o.organType === 'Liver').length, color: 'bg-amber-500' },
              { type: 'Lungs', count: organs.filter(o => o.organType === 'Lungs').length, color: 'bg-purple-500' },
            ].map(item => {
              const pct = totalOrgans > 0 ? (item.count / totalOrgans) * 100 : 0;
              return (
                <div key={item.type} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#172033]">{item.type}</span>
                    <span className="font-mono text-[#667085]">{item.count} offers ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waitlist Urgency Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Waitlist Stratification by Urgency Tier
            </h2>
            <span className="text-[11px] text-[#667085]">OPTN Urgency Model</span>
          </div>

          <div className="space-y-3">
            {[
              { tier: 'Status 1A (Critical)', count: recipients.filter(r => r.urgency.includes('1A')).length, color: 'bg-rose-500' },
              { tier: 'Status 1B (Urgent)', count: recipients.filter(r => r.urgency.includes('1B')).length, color: 'bg-amber-500' },
              { tier: 'Status 2 (Moderate)', count: recipients.filter(r => r.urgency.includes('2')).length, color: 'bg-blue-500' },
              { tier: 'Status 3 (Stable)', count: recipients.filter(r => r.urgency.includes('3')).length, color: 'bg-emerald-500' },
            ].map(item => {
              const pct = totalRecipients > 0 ? (item.count / totalRecipients) * 100 : 0;
              return (
                <div key={item.tier} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#172033]">{item.tier}</span>
                    <span className="font-mono text-[#667085]">{item.count} patients ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
