import React from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Users, 
  Truck, 
  GitMerge, 
  AlertTriangle, 
  Stethoscope, 
  Clock, 
  Building2, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Layers
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (module: string) => void;
}

export const OverviewDashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { organs, recipients, matches, transportQueue } = useOrganSync();
  const { currentFacility } = useAuth();

  // Dynamic calculations from persistent data
  const availableOrgansCount = organs.filter(o => o.status === 'Available').length;
  const waitingRecipientsCount = recipients.filter(r => r.status === 'Active on Waiting List' || r.status === 'Waiting').length;
  const pendingAllocationsCount = organs.filter(o => o.status === 'Allocation Decision Pending' || o.allocationCaseId).length;
  const activeTransportsCount = transportQueue.filter(t => t.stage !== 'Completed').length;
  const transplantsInProgressCount = organs.filter(o => o.status === 'In Transit' || o.status === 'Received').length;
  const criticalCasesCount = recipients.filter(r => r.urgency.includes('1A') || r.urgency.includes('Critical')).length;

  // Organ distribution
  const organCountsByType: Record<string, number> = {
    Heart: organs.filter(o => o.organType === 'Heart' && o.status === 'Available').length,
    Kidney: organs.filter(o => o.organType === 'Kidney' && o.status === 'Available').length,
    Liver: organs.filter(o => o.organType === 'Liver' && o.status === 'Available').length,
    Lungs: organs.filter(o => o.organType === 'Lungs' && o.status === 'Available').length,
    Pancreas: organs.filter(o => o.organType === 'Pancreas' && o.status === 'Available').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Clinical Operations Overview
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#667085] mt-1 font-medium">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2457A7]" />
              {currentFacility}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#16805D]">
              <span className="w-2 h-2 rounded-full bg-[#16805D] inline-block animate-pulse"></span>
              Live Synchronization Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('matching')}
            className="px-3.5 py-2 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <GitMerge className="w-4 h-4" />
            Initiate Matching Run
          </button>
        </div>
      </div>

      {/* 6 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Available Organs */}
        <div 
          onClick={() => onNavigate('organs')}
          className="bg-white border border-[#E4E7EC] p-4 rounded-xl shadow-xs hover:border-[#2457A7]/40 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available Organs</span>
            <Layers className="w-4 h-4 text-[#2457A7] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2 font-mono">
            {availableOrgansCount}
          </div>
          <div className="text-[11px] text-[#16805D] font-medium mt-1 flex items-center gap-1">
            <span>Viable in cold storage</span>
          </div>
        </div>

        {/* 2. Candidates Awaiting Review */}
        <div 
          onClick={() => onNavigate('recipients')}
          className="bg-white border border-[#E4E7EC] p-4 rounded-xl shadow-xs hover:border-[#2457A7]/40 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Waitlist Candidates</span>
            <Users className="w-4 h-4 text-[#2457A7] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2 font-mono">
            {waitingRecipientsCount}
          </div>
          <div className="text-[11px] text-[#667085] font-medium mt-1">
            <span>Active on registry</span>
          </div>
        </div>

        {/* 3. Pending Allocations */}
        <div 
          onClick={() => onNavigate('allocation')}
          className="bg-white border border-[#E4E7EC] p-4 rounded-xl shadow-xs hover:border-[#B7791F]/50 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Decisions</span>
            <GitMerge className="w-4 h-4 text-[#B7791F] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#B7791F] mt-2 font-mono">
            {pendingAllocationsCount}
          </div>
          <div className="text-[11px] text-[#B7791F] font-semibold mt-1">
            <span>Awaiting clinical sign-off</span>
          </div>
        </div>

        {/* 4. Active Transports */}
        <div 
          onClick={() => onNavigate('transport')}
          className="bg-white border border-[#E4E7EC] p-4 rounded-xl shadow-xs hover:border-[#2457A7]/40 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Transports</span>
            <Truck className="w-4 h-4 text-[#2457A7] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2 font-mono">
            {activeTransportsCount}
          </div>
          <div className="text-[11px] text-[#16805D] font-medium mt-1">
            <span>Cold-chain verified</span>
          </div>
        </div>

        {/* 5. Transplants in Progress */}
        <div 
          onClick={() => onNavigate('surgery')}
          className="bg-white border border-[#E4E7EC] p-4 rounded-xl shadow-xs hover:border-[#2457A7]/40 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Surgery In Progress</span>
            <Stethoscope className="w-4 h-4 text-[#2457A7] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2 font-mono">
            {transplantsInProgressCount}
          </div>
          <div className="text-[11px] text-[#667085] font-medium mt-1">
            <span>OR coordination active</span>
          </div>
        </div>

        {/* 6. Cases Requiring Attention */}
        <div 
          onClick={() => onNavigate('allocation')}
          className="bg-white border border-[#C0392B]/20 p-4 rounded-xl shadow-xs hover:border-[#C0392B] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C0392B]">Critical Attention</span>
            <AlertTriangle className="w-4 h-4 text-[#C0392B] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#C0392B] mt-2 font-mono">
            {criticalCasesCount}
          </div>
          <div className="text-[11px] text-[#C0392B] font-semibold mt-1">
            <span>Status 1A candidates</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Critical Attention Queue & Allocation Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Critical Attention Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F7F9FC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C0392B]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                  Critical Operational Attention Queue
                </h2>
              </div>
              <span className="text-[11px] text-[#667085]">Prioritized by clinical urgency</span>
            </div>

            <div className="divide-y divide-[#E4E7EC]">
              {/* Item 1 */}
              <div className="p-4 hover:bg-[#F7F9FC] transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#C0392B]/10 text-[#C0392B] font-bold px-2 py-0.5 rounded border border-[#C0392B]/20">
                      Cold Ischemia Alert
                    </span>
                    <span className="font-mono text-xs font-bold text-[#172033]">ORG-H001 (Heart)</span>
                    <span className="text-xs text-[#667085]">• Remaining: 3.5h</span>
                  </div>
                  <p className="text-xs text-[#172033]">
                    Heart allocation awaiting surgical lead authorization for candidate <strong className="font-semibold">Arthur Pendelton (REC-101)</strong>.
                  </p>
                  <div className="text-[11px] text-[#667085] flex items-center gap-2">
                    <span>Assigned Team: Division of Cardiothoracic Surgery</span>
                    <span>•</span>
                    <span>Last Updated: 15m ago</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('allocation')}
                  className="px-3 py-1.5 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  Authorize Allocation <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item 2 */}
              <div className="p-4 hover:bg-[#F7F9FC] transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#B7791F]/10 text-[#B7791F] font-bold px-2 py-0.5 rounded border border-[#B7791F]/20">
                      Transport Coordination
                    </span>
                    <span className="font-mono text-xs font-bold text-[#172033]">TRN-501 (MEDEVAC-ANGEL-44)</span>
                    <span className="text-xs text-[#667085]">• Scheduled Departure</span>
                  </div>
                  <p className="text-xs text-[#172033]">
                    Receiving center (Memorial General, Portland) notification checkpoint in progress. Container temperature verified at 3.8°C.
                  </p>
                  <div className="text-[11px] text-[#667085] flex items-center gap-2">
                    <span>Assigned Team: Emergency Courier Logistics</span>
                    <span>•</span>
                    <span>Last Updated: 8m ago</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('transport')}
                  className="px-3 py-1.5 bg-white border border-[#E4E7EC] text-[#172033] text-xs font-semibold rounded-lg hover:bg-[#F7F9FC] transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  View Telemetry <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item 3 */}
              <div className="p-4 hover:bg-[#F7F9FC] transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#16805D]/10 text-[#16805D] font-bold px-2 py-0.5 rounded border border-[#16805D]/20">
                      Living Donor Assessment
                    </span>
                    <span className="font-mono text-xs font-bold text-[#172033]">DNR-803 (Kidney)</span>
                    <span className="text-xs text-[#667085]">• Independent Assessment Cleared</span>
                  </div>
                  <p className="text-xs text-[#172033]">
                    Living donor independent physician advocacy evaluation completed. Directed donation readiness confirmed.
                  </p>
                  <div className="text-[11px] text-[#667085] flex items-center gap-2">
                    <span>Assigned Team: Living Donor Coordination</span>
                    <span>•</span>
                    <span>Last Updated: 2h ago</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('donors')}
                  className="px-3 py-1.5 bg-white border border-[#E4E7EC] text-[#172033] text-xs font-semibold rounded-lg hover:bg-[#F7F9FC] transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  Review Donor <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Allocation Pipeline Tracker */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-xs p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033] mb-4">
              Active Case Allocation Pipeline Stages
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
              {[
                { stage: 'Assessment', count: 1, color: 'text-slate-600 bg-slate-50' },
                { stage: 'Matching Run', count: 2, color: 'text-[#2457A7] bg-[#EDF4FF]' },
                { stage: 'Review', count: 2, color: 'text-[#2457A7] bg-[#EDF4FF]' },
                { stage: 'Decision Due', count: pendingAllocationsCount, color: 'text-[#B7791F] bg-[#B7791F]/10' },
                { stage: 'Allocated', count: 1, color: 'text-[#16805D] bg-[#16805D]/10' },
                { stage: 'In Transit', count: activeTransportsCount, color: 'text-[#2457A7] bg-[#EDF4FF]' },
                { stage: 'Surgery', count: transplantsInProgressCount, color: 'text-purple-700 bg-purple-50' },
                { stage: 'Completed', count: 2, color: 'text-[#16805D] bg-[#16805D]/10' },
              ].map((step, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg border border-[#E4E7EC] ${step.color}`}>
                  <div className="text-lg font-bold font-mono">{step.count}</div>
                  <div className="text-[10px] font-semibold uppercase mt-0.5 truncate">{step.stage}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Organ Availability Breakdown & Recent Activity */}
        <div className="space-y-6">
          {/* Organ Availability */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                Available Organs by Type
              </h2>
              <button
                onClick={() => onNavigate('organs')}
                className="text-[11px] text-[#2457A7] font-semibold hover:underline"
              >
                View Inventory
              </button>
            </div>
            <div className="space-y-2.5">
              {Object.entries(organCountsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-[#F7F9FC] text-xs">
                  <span className="font-medium text-[#172033]">{type}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#2457A7]">{count} Available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Chronological Audit Activity */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                Recent Case Activity
              </h2>
              <button
                onClick={() => onNavigate('admin')}
                className="text-[11px] text-[#2457A7] font-semibold hover:underline"
              >
                Audit Log
              </button>
            </div>
            <div className="space-y-3">
              {[
                { time: '10:15 UTC', action: 'Matching engine executed for ORG-H001', actor: 'Sarah Jenkins, RN', icon: CheckCircle2, color: 'text-[#16805D]' },
                { time: '09:45 UTC', action: 'Cold-chain telemetry logged: 3.8°C', actor: 'Marcus Cole (Logistics)', icon: Truck, color: 'text-[#2457A7]' },
                { time: '09:00 UTC', action: 'Living donor independent evaluation cleared', actor: 'Dr. James Sterling, MD', icon: ShieldCheck, color: 'text-[#16805D]' },
                { time: '08:30 UTC', action: 'Follow-up Day 30 recorded: Stable graft', actor: 'Dr. Robert Martinez, MD', icon: Stethoscope, color: 'text-[#2457A7]' },
              ].map((ev, i) => {
                const Icon = ev.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${ev.color}`} />
                    <div className="flex-1">
                      <div className="text-[#172033] font-medium leading-tight">{ev.action}</div>
                      <div className="text-[11px] text-[#667085] mt-0.5 flex items-center gap-1.5">
                        <span>{ev.actor}</span>
                        <span>•</span>
                        <span>{ev.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
