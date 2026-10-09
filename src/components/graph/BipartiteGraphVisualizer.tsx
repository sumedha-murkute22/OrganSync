import React, { useState, useMemo } from 'react';
import { BipartiteGraphData, GraphNode, GraphEdge, OrganType } from '../../types';
import { ScoreBreakdownBar } from '../matching/ScoreBreakdownBar';
import { Filter, Sparkles } from 'lucide-react';
import { OrganBadge } from '../common/OrganBadge';
import { BloodGroupBadge } from '../common/BloodGroupBadge';

interface BipartiteGraphVisualizerProps {
  graphData: BipartiteGraphData;
  onSelectNode?: (node: GraphNode) => void;
  selectedOrganTypeFilter?: OrganType | 'All';
}

export const BipartiteGraphVisualizer: React.FC<BipartiteGraphVisualizerProps> = ({
  graphData,
  selectedOrganTypeFilter = 'All',
}) => {
  const [organFilter, setOrganFilter] = useState<OrganType | 'All'>(selectedOrganTypeFilter);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [onlyOptimalMatches, setOnlyOptimalMatches] = useState<boolean>(false);

  // Filter nodes & edges
  const filteredNodes = useMemo(() => {
    if (organFilter === 'All') return graphData.nodes;
    return graphData.nodes.filter(n => n.organType === organFilter);
  }, [graphData.nodes, organFilter]);

  const leftOrgans = useMemo(() => {
    return filteredNodes.filter(n => n.type === 'organ');
  }, [filteredNodes]);

  const rightRecipients = useMemo(() => {
    return filteredNodes.filter(n => n.type === 'recipient');
  }, [filteredNodes]);

  const visibleNodeIds = useMemo(() => {
    return new Set(filteredNodes.map(n => n.id));
  }, [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return graphData.edges.filter(e => {
      const isVisible = visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target);
      if (!isVisible) return false;
      if (onlyOptimalMatches) return e.isOptimalMatch;
      return true;
    });
  }, [graphData.edges, visibleNodeIds, onlyOptimalMatches]);

  // Layout Dimensions
  const svgWidth = 840;
  const itemHeight = 65;
  const maxRows = Math.max(leftOrgans.length, rightRecipients.length, 6);
  const svgHeight = Math.max(500, maxRows * itemHeight + 60);

  const leftX = 140;
  const rightX = svgWidth - 140;

  // Calculate coordinates for nodes
  const nodeCoords = useMemo(() => {
    const coords: Record<string, { x: number; y: number }> = {};

    leftOrgans.forEach((organ, index) => {
      const step = (svgHeight - 80) / Math.max(1, leftOrgans.length);
      coords[organ.id] = {
        x: leftX,
        y: 40 + index * step + step / 2,
      };
    });

    rightRecipients.forEach((rec, index) => {
      const step = (svgHeight - 80) / Math.max(1, rightRecipients.length);
      coords[rec.id] = {
        x: rightX,
        y: 40 + index * step + step / 2,
      };
    });

    return coords;
  }, [leftOrgans, rightRecipients, svgHeight, leftX, rightX]);

  const getEdgeColor = (edge: GraphEdge) => {
    if (edge.isOptimalMatch) return '#0d9488'; // Vibrant teal
    if (edge.weight >= 80) return '#059669'; // Emerald
    if (edge.weight >= 60) return '#0284c7'; // Sky blue
    if (edge.weight >= 40) return '#d97706'; // Amber
    return '#94a3b8'; // Slate
  };

  const getEdgeOpacity = (edge: GraphEdge) => {
    if (hoveredNodeId) {
      if (edge.source === hoveredNodeId || edge.target === hoveredNodeId) return 0.95;
      return 0.1;
    }
    if (hoveredEdgeId) {
      if (edge.id === hoveredEdgeId) return 1.0;
      return 0.15;
    }
    if (edge.isOptimalMatch) return 0.9;
    return 0.35;
  };

  const getEdgeWidth = (edge: GraphEdge) => {
    if (edge.id === hoveredEdgeId) return 4.5;
    if (hoveredNodeId && (edge.source === hoveredNodeId || edge.target === hoveredNodeId)) return 3.5;
    if (edge.isOptimalMatch) return 3;
    return 1.5;
  };

  const hoveredEdgeData = useMemo(() => {
    if (!hoveredEdgeId) return null;
    return graphData.edges.find(e => e.id === hoveredEdgeId);
  }, [hoveredEdgeId, graphData.edges]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        {/* Organ Filter Chips */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-700">Filter Partition:</span>
          <div className="flex flex-wrap gap-1.5">
            {(['All', 'Heart', 'Kidney', 'Liver', 'Lungs', 'Pancreas'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrganFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  organFilter === type
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Optimal Matches */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyOptimalMatches}
              onChange={(e) => setOnlyOptimalMatches(e.target.checked)}
              className="rounded bg-white border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            <span className="font-bold text-teal-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Show 1-to-1 Optimal Matches Only
            </span>
          </label>
        </div>
      </div>

      {/* Legend & Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="w-3 h-3 rounded-full bg-teal-600 shadow-xs" />
          <span className="text-slate-800 font-semibold">Optimal 1-to-1 Match</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="w-3 h-3 rounded-full bg-emerald-600" />
          <span className="text-slate-800 font-semibold">High Compatibility (≥80)</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="w-3 h-3 rounded-full bg-sky-600" />
          <span className="text-slate-800 font-semibold">Medium (60-79)</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="w-3 h-3 rounded-full bg-amber-600" />
          <span className="text-slate-800 font-semibold">Moderate (40-59)</span>
        </div>
      </div>

      {/* Main SVG Bipartite Graph Canvas */}
      <div className="relative rounded-2xl bg-white border border-slate-200 p-4 overflow-x-auto shadow-sm">
        {/* Partition Headers */}
        <div className="flex justify-between items-center px-8 pb-3 border-b border-slate-100 text-xs font-bold tracking-wider uppercase">
          <div className="flex items-center gap-2 text-teal-700">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span>Partition U: Available Donor Organs ({leftOrgans.length})</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px] lowercase">
            weighted bipartite graph • G = (U, V, E)
          </div>
          <div className="flex items-center gap-2 text-sky-700">
            <span>Partition V: Waiting Recipients ({rightRecipients.length})</span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
          </div>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[750px] select-none"
          style={{ maxHeight: '720px' }}
        >
          <defs>
            <linearGradient id="edgeOptimalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Weighted Edges */}
          <g className="edges">
            {filteredEdges.map((edge) => {
              const src = nodeCoords[edge.source];
              const tgt = nodeCoords[edge.target];
              if (!src || !tgt) return null;

              // Bezier curve control points
              const dx = (tgt.x - src.x) * 0.5;
              const pathD = `M ${src.x} ${src.y} C ${src.x + dx} ${src.y}, ${tgt.x - dx} ${tgt.y}, ${tgt.x} ${tgt.y}`;

              const isHovered = hoveredEdgeId === edge.id;
              const isOptimal = edge.isOptimalMatch;

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isOptimal ? 'url(#edgeOptimalGrad)' : getEdgeColor(edge)}
                    strokeWidth={getEdgeWidth(edge)}
                    strokeOpacity={getEdgeOpacity(edge)}
                    strokeDasharray={isOptimal ? undefined : edge.weight < 50 ? '4,4' : undefined}
                    filter={isOptimal || isHovered ? 'url(#glow)' : undefined}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() => setHoveredEdgeId(null)}
                  />

                  {/* Midpoint score pill on hover / optimal */}
                  {(isHovered || (isOptimal && !hoveredEdgeId)) && (
                    <g transform={`translate(${(src.x + tgt.x) / 2}, ${(src.y + tgt.y) / 2})`}>
                      <rect
                        x="-20"
                        y="-10"
                        width="40"
                        height="20"
                        rx="10"
                        fill="#ffffff"
                        stroke={isOptimal ? '#0d9488' : getEdgeColor(edge)}
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Render Left Partition (Organs) */}
          <g className="left-nodes">
            {leftOrgans.map((node) => {
              const coord = nodeCoords[node.id];
              if (!coord) return null;
              const isHovered = hoveredNodeId === node.id;
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${coord.x}, ${coord.y})`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Node Connector Circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isHovered || isSelected ? 8 : 6}
                    fill="#0d9488"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all"
                  />

                  {/* Node Box */}
                  <rect
                    x="-135"
                    y="-22"
                    width="125"
                    height="44"
                    rx="8"
                    fill={isSelected ? '#f0fdfa' : isHovered ? '#f8fafc' : '#ffffff'}
                    stroke={isSelected ? '#0d9488' : isHovered ? '#94a3b8' : '#e2e8f0'}
                    strokeWidth={isSelected || isHovered ? '1.5' : '1'}
                    className="transition-all"
                  />

                  {/* Text Content */}
                  <text x="-125" y="-7" fill="#0f172a" fontSize="11" fontWeight="bold">
                    {node.id} • {node.organType}
                  </text>
                  <text x="-125" y="7" fill="#475569" fontSize="9" fontFamily="monospace" fontWeight="600">
                    {node.bloodGroup} | {node.urgencyOrShelfLife}
                  </text>
                  <text x="-125" y="17" fill="#64748b" fontSize="8" className="truncate">
                    {node.hospital.slice(0, 18)}...
                  </text>
                </g>
              );
            })}
          </g>

          {/* Render Right Partition (Recipients) */}
          <g className="right-nodes">
            {rightRecipients.map((node) => {
              const coord = nodeCoords[node.id];
              if (!coord) return null;
              const isHovered = hoveredNodeId === node.id;
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${coord.x}, ${coord.y})`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Node Connector Circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isHovered || isSelected ? 8 : 6}
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all"
                  />

                  {/* Node Box */}
                  <rect
                    x="10"
                    y="-22"
                    width="125"
                    height="44"
                    rx="8"
                    fill={isSelected ? '#f0f9ff' : isHovered ? '#f8fafc' : '#ffffff'}
                    stroke={isSelected ? '#0284c7' : isHovered ? '#94a3b8' : '#e2e8f0'}
                    strokeWidth={isSelected || isHovered ? '1.5' : '1'}
                    className="transition-all"
                  />

                  {/* Text Content */}
                  <text x="18" y="-7" fill="#0f172a" fontSize="11" fontWeight="bold">
                    {node.label.slice(0, 16)}
                  </text>
                  <text x="18" y="7" fill="#475569" fontSize="9" fontFamily="monospace" fontWeight="600">
                    {node.bloodGroup} | {node.urgencyOrShelfLife}
                  </text>
                  <text x="18" y="17" fill="#64748b" fontSize="8" className="truncate">
                    {node.hospital.slice(0, 18)}...
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Tooltip for Hovered Edge */}
        {hoveredEdgeData && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-3 rounded-xl bg-white border border-teal-300 shadow-xl text-xs space-y-1.5 animate-fadeIn z-20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-800">
                Compatibility Edge: {hoveredEdgeData.source} ➔ {hoveredEdgeData.target}
              </span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                {hoveredEdgeData.weight} / 100
              </span>
            </div>
            {hoveredEdgeData.isOptimalMatch && (
              <div className="text-[11px] text-teal-800 font-semibold flex items-center gap-1 bg-teal-50 p-1 rounded">
                <Sparkles className="w-3 h-3 text-teal-600" /> Maximum Weight Assignment Selected
              </div>
            )}
            <ScoreBreakdownBar score={hoveredEdgeData.weight} breakdown={hoveredEdgeData.scoreBreakdown} compact />
          </div>
        )}
      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedNode && (
        <div className="p-4 rounded-xl bg-white border border-teal-300 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <OrganBadge type={selectedNode.organType} />
              <BloodGroupBadge bloodGroup={selectedNode.bloodGroup} />
              <span className="text-sm font-bold text-slate-900">
                {selectedNode.type === 'organ' ? `Donor Organ [${selectedNode.id}]` : `Recipient [${selectedNode.id}] - ${selectedNode.label}`}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 font-semibold"
            >
              Close Inspector
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5 font-medium">Hospital Center</span>
              <strong className="text-slate-800">{selectedNode.hospital}</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5 font-medium">Clinical Priority</span>
              <strong className="text-teal-700">{selectedNode.urgencyOrShelfLife}</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5 font-medium">Incident Compatible Edges</span>
              <strong className="text-emerald-700 font-mono">
                {graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} edges
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
