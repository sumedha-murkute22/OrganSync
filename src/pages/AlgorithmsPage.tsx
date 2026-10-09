import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  ListOrdered, 
  Layers, 
  Truck, 
  Cpu, 
  Zap, 
  Calculator
} from 'lucide-react';

export const AlgorithmsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'hashtable' | 'heap' | 'graph' | 'queue' | 'formula' | 'complexity'>('hashtable');

  // Interactive Scoring Calculator State
  const [calcBloodMatch, setCalcBloodMatch] = useState(true);
  const [calcHlaMatches, setCalcHlaMatches] = useState(2);
  const [calcUrgency, setCalcUrgency] = useState<'Status 1A (Critical)' | 'Status 1B (Urgent)' | 'Status 2 (Moderate)' | 'Status 3 (Stable)'>('Status 1A (Critical)');
  const [calcShelfLifePct, setCalcShelfLifePct] = useState(20);
  const [calcWaitDays, setCalcWaitDays] = useState(365);
  const [calcDistanceKm, setCalcDistanceKm] = useState(150);

  // Live calculation based on user inputs in sandbox
  const calculateSampleScore = () => {
    if (!calcBloodMatch) return 0;

    const bloodScore = 15;
    const hlaScore = Math.min(25, Math.round((calcHlaMatches / 3.5) * 25));
    
    let urgencyScore = 5;
    if (calcUrgency === 'Status 1A (Critical)') urgencyScore = 30;
    else if (calcUrgency === 'Status 1B (Urgent)') urgencyScore = 20;
    else if (calcUrgency === 'Status 2 (Moderate)') urgencyScore = 10;

    let shelfLifeScore = 3;
    if (calcShelfLifePct < 25) shelfLifeScore = 15;
    else if (calcShelfLifePct < 50) shelfLifeScore = 11;
    else if (calcShelfLifePct < 75) shelfLifeScore = 7;

    const waitScore = Math.min(10, Math.round(Math.log10(calcWaitDays + 1) * 3.8));

    let distanceScore = 2;
    if (calcDistanceKm <= 50) distanceScore = 10;
    else if (calcDistanceKm <= 200) distanceScore = 8;
    else if (calcDistanceKm <= 500) distanceScore = 6;
    else if (calcDistanceKm <= 1000) distanceScore = 4;

    const ageScore = 3;

    return Math.min(100, bloodScore + hlaScore + urgencyScore + shelfLifeScore + waitScore + distanceScore + ageScore);
  };

  const calculatedTotal = calculateSampleScore();

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-teal-600" />
            <span>Clinical Algorithms & Data Structures Guide</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete technical analysis, time/space complexities, mathematical formulations, and interactive simulator
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
        {[
          { id: 'hashtable', label: '1. Hash Tables (O(1))', icon: Database },
          { id: 'heap', label: '2. Priority Queues (Binary Heaps)', icon: ListOrdered },
          { id: 'graph', label: '3. Weighted Bipartite Graphs', icon: Layers },
          { id: 'queue', label: '4. FIFO Transport Queue', icon: Truck },
          { id: 'formula', label: '5. Scoring Formula & ABO Rules', icon: Calculator },
          { id: 'complexity', label: '6. Big-O Complexity Matrix', icon: Cpu },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Hash Tables */}
      {activeSection === 'hashtable' && (
        <div className="p-8 rounded-3xl bg-white border border-teal-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">1. Hash Table Data Structure</h2>
              <p className="text-xs text-teal-700 font-mono font-bold">Time Complexity: O(1) Average Lookup, Insert, Delete</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Core Purpose in OrganSync</h3>
              <p>
                In biomedical organ procurement, looking up a donor graft or recipient record by ID across thousands of active nationwide records must happen in constant time <code className="text-teal-700 font-bold">O(1)</code> without linear array scans <code className="text-rose-700 font-bold">O(N)</code>.
              </p>
              <p>
                OrganSync utilizes a generic typed Hash Table with separate chaining (linked lists in buckets) and dynamic table doubling when the load factor <code className="text-teal-700 font-bold">α = N / Capacity &gt; 0.75</code>.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Mathematical Hash Function</h3>
              <p>
                Keys like <code className="text-teal-800 font-bold">ORG-101</code> and <code className="text-sky-800 font-bold">REC-204</code> are hashed using a polynomial rolling hash with prime base 31:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-teal-900 text-[11px] border border-slate-200">
                hash(k) = ( \sum_{'{'}i=0{'}'}^{'{'}L-1{'}'} k[i] \cdot 31^{'{'}L-1-i{'}'} ) \pmod{'{'}Capacity{'}'}
              </div>
            </div>
          </div>

          {/* Code Snippet */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <div className="text-slate-500">// TypeScript Implementation excerpt: src/dsa/HashTable.ts</div>
            <pre className="text-teal-300">
{`public set(key: string, value: T): void {
  if (this.count / this.capacity > 0.75) this.rehash(); // O(N) amortized
  const index = this.hash(key);
  const bucket = this.buckets[index];
  for (const node of bucket) {
    if (node.key === key) { node.value = value; return; }
  }
  bucket.push({ key, value });
  this.count++;
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Section 2: Priority Queues & Heaps */}
      {activeSection === 'heap' && (
        <div className="p-8 rounded-3xl bg-white border border-sky-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200">
              <ListOrdered className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">2. Priority Queues & Complete Binary Heaps</h2>
              <p className="text-xs text-sky-700 font-mono font-bold">Time Complexity: O(log N) Push / Pop, O(1) Peek</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Dual-Heap Medical Optimization</h3>
              <p>
                A standard array requires <code className="text-rose-700 font-bold">O(N)</code> scans to find the most urgent patient or nearest-expiring organ. OrganSync maintains two synchronized Binary Heaps:
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                <li><strong>Recipient Urgency Max-Heap:</strong> Keeps Status 1A and longest-waiting patients at the root node for instant <code className="text-teal-700 font-bold">O(1)</code> access.</li>
                <li><strong>Organ Expiry Min-Heap:</strong> Keeps donor organs closest to cold-ischemic necrosis at the root so they are matched before expiration.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Contiguous Array Tree Mapping</h3>
              <p>
                Heaps are implemented over contiguous RAM arrays without dynamic node pointers:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-sky-900 text-[11px] border border-slate-200 space-y-1">
                <div>Parent Index(i) = \lfloor (i - 1) / 2 \rfloor</div>
                <div>Left Child Index(i) = 2i + 1</div>
                <div>Right Child Index(i) = 2i + 2</div>
              </div>
            </div>
          </div>

          {/* Tree Code Snippet */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <div className="text-slate-500">// Bubble Up & Bubble Down: O(log N) height traversal</div>
            <pre className="text-sky-300">
{`private bubbleUp(index: number): void {
  let curr = index;
  while (curr > 0) {
    const parent = Math.floor((curr - 1) / 2);
    if (this.comparator(this.heap[curr], this.heap[parent]) > 0) {
      this.swap(curr, parent);
      curr = parent;
    } else break;
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Section 3: Weighted Bipartite Graphs */}
      {activeSection === 'graph' && (
        <div className="p-8 rounded-3xl bg-white border border-indigo-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">3. Weighted Bipartite Matching Graph</h2>
              <p className="text-xs text-indigo-700 font-mono font-bold">Time Complexity: O(E log E) Greedy Allocation, O(V + E) Space</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Graph Theory Formalism</h3>
              <p>
                Let <code className="text-teal-700 font-bold">G = (U, V, E)</code> be a bipartite graph where:
              </p>
              <ul className="space-y-1 list-disc pl-4 text-slate-600">
                <li><code className="text-teal-800 font-bold">U</code> = Set of Available Donated Organs</li>
                <li><code className="text-sky-800 font-bold">V</code> = Set of Waiting Registered Recipients</li>
                <li><code className="text-indigo-800 font-bold">E ⊆ U × V</code> = Candidate compatibility edges</li>
                <li><code className="text-amber-800 font-bold">w(u, v) ∈ [0, 100]</code> = Edge weight (compatibility score)</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">1-to-1 Matching Uniqueness Guarantee</h3>
              <p>
                Each physical donor organ can only be transplanted into at most one patient, and each patient can only receive one graft. Our matching engine selects an independent edge subset <code className="text-teal-700 font-bold">M ⊆ E</code> that maximizes total allocation utility while respecting clinical priority constraints.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: FIFO Transport Queue */}
      {activeSection === 'queue' && (
        <div className="p-8 rounded-3xl bg-white border border-amber-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">4. First-In First-Out (FIFO) Transport Queue</h2>
              <p className="text-xs text-amber-700 font-mono font-bold">Time Complexity: O(1) Enqueue / Dequeue</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Sequential Surgical Dispatch</h3>
              <p>
                Once a match is accepted, it is enqueued into a FIFO Queue with head and tail pointers. This guarantees that donor recovery teams and surgical operating rooms are scheduled in exact order of match confirmation.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">5-Stage State Machine Lifecycle</h3>
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-amber-900 text-[11px] border border-slate-200 space-y-1 font-bold">
                <div>[1] Match Accepted ➔ [2] Transport Scheduled</div>
                <div>➔ [3] In Transit ➔ [4] Transplant Ready ➔ [5] Completed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Scoring Formula & Interactive Sandbox */}
      {activeSection === 'formula' && (
        <div className="p-8 rounded-3xl bg-white border border-teal-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">5. Multi-Factor Compatibility Scoring Formula</h2>
              <p className="text-xs text-teal-700 font-mono font-bold">Range: 0 to 100 Points</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-teal-900 font-bold overflow-x-auto">
            TotalScore = BloodBaseline(15) + HLA(25) + Urgency(30) + IschemiaUrgency(15) + Waitlist(10) + Distance(10) + AgeMatch(5)
          </div>

          {/* Interactive Calculator Sandbox */}
          <div className="p-6 rounded-2xl bg-white border border-teal-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-600" />
                <span>Interactive Algorithm Compatibility Sandbox</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Simulated Score:</span>
                <span className={`text-lg font-mono font-black px-3 py-1 rounded-lg border ${
                  calculatedTotal >= 80
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : calculatedTotal >= 60
                    ? 'bg-teal-50 text-teal-800 border-teal-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {calculatedTotal} / 100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ABO Blood Compatible?</label>
                <select
                  value={calcBloodMatch ? 'yes' : 'no'}
                  onChange={(e) => setCalcBloodMatch(e.target.value === 'yes')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="yes">Yes (Compatible: +15 pts)</option>
                  <option value="no">No (Incompatible: 0 pts total)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">HLA Allele Matches (0 to 3.5)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="3.5"
                  value={calcHlaMatches}
                  onChange={(e) => setCalcHlaMatches(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Clinical Urgency Tier</label>
                <select
                  value={calcUrgency}
                  onChange={(e) => setCalcUrgency(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="Status 1A (Critical)">Status 1A Critical (+30 pts)</option>
                  <option value="Status 1B (Urgent)">Status 1B Urgent (+20 pts)</option>
                  <option value="Status 2 (Moderate)">Status 2 Moderate (+10 pts)</option>
                  <option value="Status 3 (Stable)">Status 3 Stable (+5 pts)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Shelf-Life Remaining (%): {calcShelfLifePct}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={calcShelfLifePct}
                  onChange={(e) => setCalcShelfLifePct(Number(e.target.value))}
                  className="w-full accent-teal-600 bg-slate-200 rounded-lg h-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Days on Waitlist: {calcWaitDays}</label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={calcWaitDays}
                  onChange={(e) => setCalcWaitDays(Number(e.target.value))}
                  className="w-full accent-teal-600 bg-slate-200 rounded-lg h-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Distance: {calcDistanceKm} km</label>
                <input
                  type="range"
                  min="5"
                  max="1500"
                  value={calcDistanceKm}
                  onChange={(e) => setCalcDistanceKm(Number(e.target.value))}
                  className="w-full accent-teal-600 bg-slate-200 rounded-lg h-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: Big-O Complexity Matrix */}
      {activeSection === 'complexity' && (
        <div className="p-8 rounded-3xl bg-white border border-teal-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">6. Big-O Complexity Comparison Matrix</h2>
              <p className="text-xs text-teal-700 font-mono font-bold">Formal asymptotic performance analysis across all 4 data structures</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-teal-800 font-mono">
                  <th className="py-3 px-4">DATA STRUCTURE</th>
                  <th className="py-3 px-4">OPERATION</th>
                  <th className="py-3 px-4">AVERAGE TIME</th>
                  <th className="py-3 px-4">WORST TIME</th>
                  <th className="py-3 px-4">SPACE COMPLEXITY</th>
                  <th className="py-3 px-4">USE CASE IN ORGAN SYNC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-bold text-teal-700">Hash Table</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">Lookup / Insert / Delete</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(1)</td>
                  <td className="py-3 px-4 text-amber-700">O(N) (Rehash)</td>
                  <td className="py-3 px-4">O(N)</td>
                  <td className="py-3 px-4 font-sans text-[11px] text-slate-500">Instant lookup of organs and recipients by ID</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-sky-700">Binary Heap</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">Push (Bubble Up)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(log N)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(log N)</td>
                  <td className="py-3 px-4">O(N)</td>
                  <td className="py-3 px-4 font-sans text-[11px] text-slate-500">Inserting new urgent patient or graft</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-sky-700">Binary Heap</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">Pop (Bubble Down)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(log N)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(log N)</td>
                  <td className="py-3 px-4">O(N)</td>
                  <td className="py-3 px-4 font-sans text-[11px] text-slate-500">Extracting top-priority critical case</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-sky-700">Binary Heap</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">Peek Root Element</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(1)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(1)</td>
                  <td className="py-3 px-4">O(1)</td>
                  <td className="py-3 px-4 font-sans text-[11px] text-slate-500">Immediate inspection of top recipient/organ</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-indigo-700">Bipartite Graph</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">Build Compatibility Edges</td>
                  <td className="py-3 px-4 text-amber-700 font-bold">O(|U| × |V|)</td>
                  <td className="py-3 px-4 text-amber-700 font-bold">O(|U| × |V|)</td>
                  <td className="py-3 px-4">O(V + E)</td>
                  <td className="py-3 px-4 font-sans text-[11px] text-slate-500">Evaluating compatibility across all pairs</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-indigo-700">Bipartite Matching</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">Greedy Max Weight Assign</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(E log E)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(E log E)</td>
                  <td className="py-3 px-4">O(V + E)</td>
                  <td className="py-3 px-4 font-sans text-[11px] text-slate-500">Selecting optimal 1-to-1 matching without conflicts</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-amber-700">FIFO Queue</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">Enqueue / Dequeue / Peek</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(1)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">O(1)</td>
                  <td className="py-3 px-4">O(N)</td>
                  <td className="py-3 px-4 font-sans text-[11px] text-slate-500">Surgical room prep and transit intake</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
