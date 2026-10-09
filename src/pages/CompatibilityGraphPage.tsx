import React from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { BipartiteGraphVisualizer } from '../components/graph/BipartiteGraphVisualizer';
import { Layers, Info, BookOpen } from 'lucide-react';

export const CompatibilityGraphPage: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { graphData, bipartiteGraph } = useOrganSync();
  const stats = bipartiteGraph.getGraphStats();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-teal-600" />
            <span>Biomedical Compatibility Graph Network</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weighted Bipartite Graph G = (U, V, E) modeling valid biological compatibility paths and maximum weight assignments
          </p>
        </div>

        <button
          onClick={() => setActiveTab('algorithms')}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-teal-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <BookOpen className="w-4 h-4 text-teal-600" />
          <span>Graph Theory Guide</span>
        </button>
      </div>

      {/* Graph Theory Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold">Partition U (Organs)</span>
          <div className="text-2xl font-black text-teal-700 font-mono">{stats.organCount} vertices</div>
          <span className="text-[10px] text-slate-400">Left independent set</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold">Partition V (Recipients)</span>
          <div className="text-2xl font-black text-sky-700 font-mono">{stats.recipientCount} vertices</div>
          <span className="text-[10px] text-slate-400">Right independent set</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold">Compatible Edges (E)</span>
          <div className="text-2xl font-black text-indigo-700 font-mono">{stats.edgeCount} edges</div>
          <span className="text-[10px] text-slate-400">ABO & shelf-life verified</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold">Bipartite Density</span>
          <div className="text-2xl font-black text-amber-700 font-mono">{(stats.density * 100).toFixed(1)}%</div>
          <span className="text-[10px] text-slate-400">Edge existence ratio</span>
        </div>
      </div>

      {/* Main Interactive Visualizer Canvas */}
      <BipartiteGraphVisualizer graphData={graphData} />

      {/* Conceptual Explanation Box */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Info className="w-4 h-4 text-teal-600" />
          <span>Graph-Theoretic Model & Edge Construction Rules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <strong className="text-teal-800 block text-sm">1. Disjoint Vertex Partitions</strong>
            <p className="text-slate-600">
              A bipartite graph partitions vertices into two disjoint sets <code className="text-teal-700 font-bold">U</code> and <code className="text-sky-700 font-bold">V</code>. No edges exist between two organs in <code className="text-teal-700">U</code>, nor between two recipients in <code className="text-sky-700">V</code>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <strong className="text-teal-800 block text-sm">2. Biological Edge Existence</strong>
            <p className="text-slate-600">
              An edge <code className="text-teal-700 font-bold">(u, v)</code> is drawn if and only if organ type matches exactly, blood type is ABO compatible, and remaining shelf life is &gt; 0 hours. Incompatible pairs have 0 edges.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <strong className="text-teal-800 block text-sm">3. Maximum Weight Matching</strong>
            <p className="text-slate-600">
              Our matching engine selects a maximum weight independent edge subset <code className="text-teal-700 font-bold">M ⊆ E</code> such that no two edges share a vertex, guaranteeing strict 1-to-1 allocation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
