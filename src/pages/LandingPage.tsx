import React from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { 
  Activity, 
  GitMerge, 
  Layers, 
  ListOrdered, 
  Truck, 
  BookOpen, 
  Database, 
  ArrowRight, 
  Users, 
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  const { organs, recipients, transportQueue } = useOrganSync();

  const availableOrgansCount = organs.filter(o => o.status === 'Available').length;
  const waitingRecipientsCount = recipients.filter(r => r.status === 'Waiting').length;
  const criticalCount = recipients.filter(r => r.status === 'Waiting' && r.urgency === 'Status 1A (Critical)').length;
  const activeTransportsCount = transportQueue.filter(t => t.stage !== 'Completed').length;

  const dsaFeatures = [
    {
      title: '1. Hash Tables',
      complexity: 'O(1) Avg Lookup',
      color: 'bg-white border-slate-200 hover:border-teal-400',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: Database,
      iconColor: 'text-teal-600 bg-teal-50 border-teal-200',
      tab: 'organs',
      description: 'Provides constant-time O(1) indexing and retrieval of Donor Grafts and Waiting Recipients by unique alphanumeric keys (e.g. ORG-101, REC-201).',
      points: [
        'Polynomial rolling string hash function',
        'Collision resolution via Separate Chaining',
        'Dynamic table resizing on load factor > 0.75',
      ],
    },
    {
      title: '2. Priority Queues (Binary Heaps)',
      complexity: 'O(log N) Push / Pop',
      color: 'bg-white border-slate-200 hover:border-sky-400',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
      icon: ListOrdered,
      iconColor: 'text-sky-600 bg-sky-50 border-sky-200',
      tab: 'priority',
      description: 'Dynamically prioritizes waiting patients by medical urgency status and prioritizes expiring organs approaching cold-ischemia limits to prevent graft necrosis.',
      points: [
        'Recipient Max-Heap: Status 1A/1B & waitlist tenure',
        'Organ Min-Heap: Nearest ischemic expiration first',
        'Contiguous array binary tree layout: [i], [2i+1], [2i+2]',
      ],
    },
    {
      title: '3. Weighted Bipartite Graph',
      complexity: 'O(V + E) Traversal',
      color: 'bg-white border-slate-200 hover:border-indigo-400',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: Layers,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      tab: 'graph',
      description: 'Models biological donor-recipient compatibility as a bipartite network with weighted edges reflecting ABO compatibility, HLA allelic matches, and logistics.',
      points: [
        'Disjoint sets: Partition U (Organs) & Partition V (Recipients)',
        'Strict biological filters: ABO match, organ type match',
        'Multi-factor scoring algorithm (0 - 100 points)',
      ],
    },
    {
      title: '4. FIFO Transport Queue',
      complexity: 'O(1) Enqueue / Dequeue',
      color: 'bg-white border-slate-200 hover:border-amber-400',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Truck,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
      tab: 'transport',
      description: 'Orchestrates accepted matches through sequential surgical dispatch pipelines from transport scheduling to surgical theatre intake.',
      points: [
        'First-In First-Out surgical intake ordering',
        '5-Stage state machine tracking lifecycle',
        'Courier telemetry: Air Ambulance, Jet, High-speed Unit',
      ],
    },
  ];

  return (
    <div className="space-y-16 py-6 animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Advanced Transplant Decision Support & Allocation Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Organ<span className="text-teal-600">Sync</span>
          <span className="block text-2xl sm:text-3xl font-bold text-slate-600 mt-2">
            Clinical Donor–Recipient Matching & Allocation Engine
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A high-precision clinical matching platform utilizing <strong>Hash Indexing</strong>, <strong>Priority Binary Heaps</strong>, <strong>Weighted Bipartite Graph Optimization</strong>, and <strong>FIFO Dispatch Queues</strong> to match donor grafts with waiting recipients with maximum medical compatibility and zero organ wastage.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('matching')}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <GitMerge className="w-4 h-4 stroke-[2.5]" />
            <span>Launch Matching Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Compatibility Network</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithms')}
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center gap-2 transition-all border border-slate-200"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span>Clinical DSA Docs</span>
          </button>
        </div>
      </section>

      {/* Live System Telemetry Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto px-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-teal-800 font-bold">
            <span>Available Organs</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{availableOrgansCount}</div>
          <div className="text-[11px] text-slate-500">Indexed in O(1) Hash Table</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-sky-800 font-bold">
            <span>Waiting Patients</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{waitingRecipientsCount}</div>
          <div className="text-[11px] text-slate-500">Ranked by Priority Max-Heap</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-800 font-bold">
            <span>Critical Status 1A</span>
            <Zap className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-rose-700 font-mono">{criticalCount}</div>
          <div className="text-[11px] text-rose-600 font-medium">Immediate allocation needed</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
            <span>Active Transports</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{activeTransportsCount}</div>
          <div className="text-[11px] text-slate-500">Managed in FIFO Transit Queue</div>
        </div>
      </section>

      {/* Explicit Data Structures Showcase */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Core Data Structures Applied in OrganSync
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Each computational data structure addresses a critical biomedical allocation challenge with optimal algorithmic time and space complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dsaFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 transition-all group ${feat.color}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-xl border ${feat.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{feat.title}</h3>
                    </div>
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${feat.badgeColor}`}>
                      {feat.complexity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                    {feat.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setActiveTab(feat.tab)}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors group-hover:border-teal-500 group-hover:text-teal-700"
                >
                  <span>Open Interactive Visualizer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Matching Pipeline Flow Preview */}
      <section className="max-w-6xl mx-auto px-4 p-8 rounded-3xl bg-white border border-teal-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-teal-700 font-bold">
            End-to-End Clinical Flow
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            How OrganSync Solves the Multi-Constrained Allocation Problem
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-mono font-bold flex items-center justify-center mx-auto text-xs">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Entity Ingestion</h4>
            <p className="text-[11px] text-slate-600">
              Grafts & patients indexed into Hash Tables with O(1) key lookups.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-mono font-bold flex items-center justify-center mx-auto text-xs">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Priority Queueing</h4>
            <p className="text-[11px] text-slate-600">
              Binary Heaps surface Status 1A patients & organs nearing cold ischemia.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold flex items-center justify-center mx-auto text-xs">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Bipartite Matching</h4>
            <p className="text-[11px] text-slate-600">
              Evaluates ABO, HLA & distance to compute 1-to-1 max compatibility assignments.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-mono font-bold flex items-center justify-center mx-auto text-xs">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-xs">FIFO Dispatch</h4>
            <p className="text-[11px] text-slate-600">
              Enqueues matched pairs for emergency transit and surgical readiness.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setActiveTab('matching')}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all inline-flex items-center gap-2"
          >
            <span>Run Match Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
