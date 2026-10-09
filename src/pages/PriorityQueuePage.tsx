import React from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { HeapVisualizer } from '../components/priority/HeapVisualizer';
import { ListOrdered, Zap, BookOpen } from 'lucide-react';

export const PriorityQueuePage: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { recipientPriorityQueue, organExpiryQueue } = useOrganSync();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-7 h-7 text-teal-600" />
            <span>Priority Queue & Binary Heap Visualizer</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Min/Max Binary Heaps maintaining dynamic prioritization for urgent recipients and expiring organs with O(log N) efficiency
          </p>
        </div>

        <button
          onClick={() => setActiveTab('algorithms')}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-teal-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <BookOpen className="w-4 h-4 text-teal-600" />
          <span>Priority Queue DSA Docs</span>
        </button>
      </div>

      {/* Interactive Binary Heap Canvas & Array Inspector */}
      <HeapVisualizer
        recipientPQ={recipientPriorityQueue}
        organPQ={organExpiryQueue}
      />

      {/* Priority Scoring Formula Breakdown Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Zap className="w-4 h-4 text-amber-600" />
          <span>Mathematical Priority Ranking Formulations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Recipient Priority Formula */}
          <div className="p-4 bg-slate-50 rounded-xl border border-sky-200 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-sky-900 text-sm">Recipient Max-Heap Priority Formula</strong>
              <span className="font-mono text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded font-bold border border-sky-200">
                MAX HEAP
              </span>
            </div>
            <p className="text-slate-600 text-xs font-medium">
              Higher score earns root placement at index 0 for immediate allocation consideration.
            </p>
            <div className="p-2.5 bg-white rounded font-mono text-teal-800 font-bold text-[11px] border border-slate-200">
              PriorityScore = UrgencyBase + WaitlistDays + (PRA% * 2)
            </div>
            <ul className="text-slate-600 space-y-1 text-[11px]">
              <li>• <strong>Status 1A (Critical):</strong> +1,000 base points (VA-ECMO / Cardiogenic shock)</li>
              <li>• <strong>Status 1B (Urgent):</strong> +500 base points (Inotropic support)</li>
              <li>• <strong>Status 2 (Moderate):</strong> +200 base points</li>
              <li>• <strong>Status 3 (Stable):</strong> +50 base points</li>
            </ul>
          </div>

          {/* Organ Expiry Formula */}
          <div className="p-4 bg-slate-50 rounded-xl border border-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-rose-900 text-sm">Organ Expiry Min-Heap Priority Formula</strong>
              <span className="font-mono text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-bold border border-rose-200">
                MIN HEAP
              </span>
            </div>
            <p className="text-slate-600 text-xs font-medium">
              Smallest remaining cold-ischemia window rises to root index 0 to avoid cellular necrosis.
            </p>
            <div className="p-2.5 bg-white rounded font-mono text-rose-800 font-bold text-[11px] border border-slate-200">
              RemainingHours = MaxShelfLife - (CurrentTime - CrossClampTime)
            </div>
            <ul className="text-slate-600 space-y-1 text-[11px]">
              <li>• <strong>Heart:</strong> 4 - 6 hours max cold ischemia limit</li>
              <li>• <strong>Lungs:</strong> 6 - 8 hours max cold ischemia limit</li>
              <li>• <strong>Liver:</strong> 12 hours max cold ischemia limit</li>
              <li>• <strong>Kidney:</strong> 24 - 36 hours max cold ischemia limit (pulsed pump)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
