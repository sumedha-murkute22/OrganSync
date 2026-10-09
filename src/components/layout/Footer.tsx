import React from 'react';
import { Activity, ShieldCheck, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600 py-12 px-4 sm:px-6 lg:px-8 shadow-inner">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand & Mission */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
              <Activity className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-lg font-bold text-slate-900">OrganSync</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            High-precision algorithmic matching and clinical prioritization platform designed for transplant surgery centers, donor recovery teams, and hospital networks.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-teal-700 font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>Hash Indexing • Binary Heaps • Bipartite Optimization • FIFO Dispatch</span>
          </div>
        </div>

        {/* Clinical Data Structures */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Clinical Data Structures</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => setActiveTab('organs')} className="hover:text-teal-600 transition-colors text-slate-600">
                Hash Tables (O(1) Entity Indexing)
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('priority')} className="hover:text-teal-600 transition-colors text-slate-600">
                Priority Heaps (Status 1A & Ischemia Limits)
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('graph')} className="hover:text-teal-600 transition-colors text-slate-600">
                Bipartite Compatibility Network
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('transport')} className="hover:text-teal-600 transition-colors text-slate-600">
                FIFO Transplant Dispatch Pipeline
              </button>
            </li>
          </ul>
        </div>

        {/* Allocation Mechanics */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Allocation Mechanics</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => setActiveTab('matching')} className="hover:text-teal-600 transition-colors text-slate-600">
                Maximum Weight Bipartite Matching
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('algorithms')} className="hover:text-teal-600 transition-colors text-slate-600">
                Multi-Factor Compatibility Formula
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('algorithms')} className="hover:text-teal-600 transition-colors text-slate-600">
                ABO Blood Matrix & HLA Alleles
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('algorithms')} className="hover:text-teal-600 transition-colors text-slate-600">
                Cold-Ischemia Tolerance Thresholds
              </button>
            </li>
          </ul>
        </div>

        {/* Clinical Operations Note */}
        <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Transplant Decision Support</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            OrganSync is built for clinical workflow optimization and algorithmic donor-recipient matching. Always verify with local institutional donor-specific antibody (DSA) crossmatch protocols.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © 2026 OrganSync Clinical Platform. Optimized for Transplant Surgery Teams & Hospital Networks.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-teal-700 font-medium">
            <Heart className="w-3.5 h-3.5 fill-teal-600/20 text-teal-600" /> Algorithmic Precision in Transplant Surgery
          </span>
        </div>
      </div>
    </footer>
  );
};
