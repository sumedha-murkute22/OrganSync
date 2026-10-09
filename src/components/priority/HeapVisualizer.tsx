import React, { useState } from 'react';
import { PriorityQueue, HeapNodeVisual } from '../../dsa/PriorityQueue';
import { DonorOrgan, Recipient } from '../../types';
import { UrgencyBadge } from '../common/UrgencyBadge';
import { ShelfLifeCountdown } from '../common/ShelfLifeCountdown';
import { ListOrdered, Sparkles, Binary, Cpu } from 'lucide-react';

interface HeapVisualizerProps {
  recipientPQ: PriorityQueue<Recipient>;
  organPQ: PriorityQueue<DonorOrgan>;
}

export const HeapVisualizer: React.FC<HeapVisualizerProps> = ({ recipientPQ, organPQ }) => {
  const [activeHeapType, setActiveHeapType] = useState<'recipients' | 'organs'>('recipients');
  const [selectedHeapIndex, setSelectedHeapIndex] = useState<number | null>(null);

  const recipientNodes = recipientPQ.getTreeNodes();
  const organNodes = organPQ.getTreeNodes();

  const currentNodes = activeHeapType === 'recipients' ? recipientNodes : organNodes;
  const currentRoot = currentNodes.length > 0 ? currentNodes[0] : null;

  return (
    <div className="space-y-6">
      {/* Heap Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveHeapType('recipients');
              setSelectedHeapIndex(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeHeapType === 'recipients'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Recipient Max-Heap ({recipientNodes.length} Waiting Patients)</span>
          </button>

          <button
            onClick={() => {
              setActiveHeapType('organs');
              setSelectedHeapIndex(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeHeapType === 'organs'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Organ Expiry Min-Heap ({organNodes.length} Active Grafts)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono font-medium">
          Heap Size: <strong className="text-teal-700 font-bold">{currentNodes.length}</strong> | Tree Height: <strong className="text-teal-700 font-bold">{Math.floor(Math.log2(Math.max(1, currentNodes.length))) + 1}</strong>
        </div>
      </div>

      {/* Top Priority Root Spotlight Banner */}
      {currentRoot && (
        <div className="p-4 rounded-2xl bg-white border border-teal-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Sparkles className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  ROOT NODE [Index 0] • Peek O(1)
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {activeHeapType === 'recipients'
                    ? (currentRoot.value as Recipient).name
                    : `${(currentRoot.value as DonorOrgan).organType} [${(currentRoot.value as DonorOrgan).id}]`}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {activeHeapType === 'recipients'
                  ? `Highest Urgency Priority: ${currentRoot.priorityScore} pts (Status 1A Critical + Waitlist)`
                  : `Nearest Ischemia Expiry: ${(currentRoot.value as DonorOrgan).id} (${currentRoot.priorityScore}h remaining)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeHeapType === 'recipients' ? (
              <UrgencyBadge urgency={(currentRoot.value as Recipient).urgency} />
            ) : (
              <ShelfLifeCountdown organ={currentRoot.value as DonorOrgan} showBar={false} />
            )}
          </div>
        </div>
      )}

      {/* Binary Tree Visualizer Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Binary className="w-4 h-4 text-teal-600" />
            <span>Complete Binary Tree Topology</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Parent at floor((i-1)/2), Left at 2i+1, Right at 2i+2
          </span>
        </div>

        {/* Tree Render Levels */}
        <div className="py-4 overflow-x-auto">
          <div className="min-w-[650px] space-y-6">
            {/* Level 0: Root */}
            {currentNodes.length > 0 && (
              <div className="flex justify-center">
                <HeapNodeCard
                  node={currentNodes[0]}
                  isSelected={selectedHeapIndex === 0}
                  onClick={() => setSelectedHeapIndex(0)}
                  activeHeapType={activeHeapType}
                />
              </div>
            )}

            {/* Level 1: Left & Right children */}
            {currentNodes.length > 1 && (
              <div className="flex justify-around px-8">
                {currentNodes.slice(1, 3).map((node) => (
                  <HeapNodeCard
                    key={node.index}
                    node={node}
                    isSelected={selectedHeapIndex === node.index}
                    onClick={() => setSelectedHeapIndex(node.index)}
                    activeHeapType={activeHeapType}
                  />
                ))}
              </div>
            )}

            {/* Level 2: Grandchildren */}
            {currentNodes.length > 3 && (
              <div className="flex justify-around px-2">
                {currentNodes.slice(3, 7).map((node) => (
                  <HeapNodeCard
                    key={node.index}
                    node={node}
                    isSelected={selectedHeapIndex === node.index}
                    onClick={() => setSelectedHeapIndex(node.index)}
                    activeHeapType={activeHeapType}
                  />
                ))}
              </div>
            )}

            {/* Level 3: Overflow */}
            {currentNodes.length > 7 && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2 border-t border-slate-100">
                {currentNodes.slice(7, 15).map((node) => (
                  <HeapNodeCard
                    key={node.index}
                    node={node}
                    isSelected={selectedHeapIndex === node.index}
                    onClick={() => setSelectedHeapIndex(node.index)}
                    activeHeapType={activeHeapType}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continuous Array Memory Representation */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Cpu className="w-4 h-4 text-teal-600" /> Contiguous Array Memory Buffer Representation
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Zero pointers needed • Cache-friendly sequential RAM
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {currentNodes.map((node) => {
            const isSelected = selectedHeapIndex === node.index;
            return (
              <div
                key={node.index}
                onClick={() => setSelectedHeapIndex(node.index)}
                className={`flex-shrink-0 cursor-pointer p-2 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-400/30'
                    : node.index === 0
                    ? 'bg-teal-50/50 border-teal-300 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                style={{ width: '88px' }}
              >
                <div className="text-[10px] font-mono text-slate-500 font-semibold">[{node.index}]</div>
                <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {activeHeapType === 'recipients'
                    ? (node.value as Recipient).name.split(' ')[0]
                    : `${(node.value as DonorOrgan).organType}`}
                </div>
                <div className="text-[10px] font-mono text-teal-700 font-bold mt-1">
                  {node.priorityScore} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Algorithmic Complexity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="text-teal-700 font-mono font-bold">Peek Maximum / Minimum: O(1)</div>
          <p className="text-slate-600">
            Immediate access to top priority candidate at root index 0 without searching.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="text-teal-700 font-mono font-bold">Insert (push): O(log N)</div>
          <p className="text-slate-600">
            Adds to next available array slot and bubbles up by comparing with parent at <code>floor((i-1)/2)</code>.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="text-teal-700 font-mono font-bold">Extract (pop): O(log N)</div>
          <p className="text-slate-600">
            Replaces root with last leaf and bubbles down to the highest-priority child branch.
          </p>
        </div>
      </div>
    </div>
  );
};

interface HeapNodeCardProps {
  node: HeapNodeVisual<any>;
  isSelected: boolean;
  onClick: () => void;
  activeHeapType: 'recipients' | 'organs';
  compact?: boolean;
}

const HeapNodeCard: React.FC<HeapNodeCardProps> = ({
  node,
  isSelected,
  onClick,
  activeHeapType,
  compact = false,
}) => {
  const isRoot = node.index === 0;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
          isSelected
            ? 'bg-teal-50 border-teal-500'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="text-[9px] font-mono text-slate-500 block">i={node.index}</span>
        <span className="text-[10px] font-bold text-slate-900 block truncate">
          {activeHeapType === 'recipients' ? node.value.name.split(' ')[0] : node.value.organType}
        </span>
        <span className="text-[9px] font-mono text-teal-700 font-bold block">{node.priorityScore}</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs select-none w-48 ${
        isSelected
          ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-400/30'
          : isRoot
          ? 'bg-teal-50/40 border-teal-300'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
        <span className="text-slate-500 font-bold">NODE [Index {node.index}]</span>
        {isRoot && (
          <span className="bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">
            ROOT
          </span>
        )}
      </div>

      <div className="text-xs font-bold text-slate-900 truncate mb-1">
        {activeHeapType === 'recipients' ? (
          node.value.name
        ) : (
          `${node.value.organType} (${node.value.bloodGroup})`
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
        <span className="text-slate-500 font-medium">
          {activeHeapType === 'recipients' ? node.value.urgency.split(' ')[0] : `${node.priorityScore}h left`}
        </span>
        <span className="font-mono font-bold text-teal-800 bg-slate-100 px-1.5 py-0.5 rounded">
          {node.priorityScore} pts
        </span>
      </div>
    </div>
  );
};
