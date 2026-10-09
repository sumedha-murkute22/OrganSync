import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  DonorOrgan, 
  Recipient, 
  MatchResult, 
  TransportQueueItem, 
  TransportStage,
  BipartiteGraphData,
  OrganType,
  BloodGroup
} from '../types';
import { HashTable } from '../dsa/HashTable';
import { PriorityQueue } from '../dsa/PriorityQueue';
import { BipartiteGraph } from '../dsa/BipartiteGraph';
import { MatchingEngine, MatchingExecutionResult, MatchingLogStep } from '../dsa/MatchingEngine';
import { CompatibilityScorer } from '../dsa/CompatibilityScorer';
import { TransportQueueManager } from '../dsa/FIFOQueue';
import { INITIAL_ORGANS, INITIAL_RECIPIENTS } from '../data/sampleData';
import confetti from 'canvas-confetti';

interface OrganSyncContextType {
  // Core Entities
  organs: DonorOrgan[];
  recipients: Recipient[];
  matches: MatchResult[];
  transportQueue: TransportQueueItem[];
  matchingLogs: MatchingLogStep[];
  lastMatchResult: MatchingExecutionResult | null;

  // DSA References
  organHashTable: HashTable<DonorOrgan>;
  recipientHashTable: HashTable<Recipient>;
  recipientPriorityQueue: PriorityQueue<Recipient>;
  organExpiryQueue: PriorityQueue<DonorOrgan>;
  bipartiteGraph: BipartiteGraph;
  graphData: BipartiteGraphData;

  // Actions
  addOrgan: (organ: Omit<DonorOrgan, 'id'>) => void;
  updateOrgan: (id: string, organ: Partial<DonorOrgan>) => void;
  deleteOrgan: (id: string) => void;

  addRecipient: (recipient: Omit<Recipient, 'id'>) => void;
  updateRecipient: (id: string, recipient: Partial<Recipient>) => void;
  deleteRecipient: (id: string) => void;

  generateMatches: (minThreshold?: number) => MatchingExecutionResult;
  acceptMatch: (matchId: string) => void;
  rejectMatch: (matchId: string) => void;

  advanceTransportStage: (transportId: string) => void;
  resetToSampleData: () => void;
  
  // Quick Lookups via Hash Table (O(1))
  getOrganById: (id: string) => DonorOrgan | undefined;
  getRecipientById: (id: string) => Recipient | undefined;
}

const OrganSyncContext = createContext<OrganSyncContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ORGANS: 'organsync_organs_v1',
  RECIPIENTS: 'organsync_recipients_v1',
  MATCHES: 'organsync_matches_v1',
  TRANSPORTS: 'organsync_transports_v1',
};

export const OrganSyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or sample data
  const [organs, setOrgans] = useState<DonorOrgan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORGANS);
    return saved ? JSON.parse(saved) : INITIAL_ORGANS;
  });

  const [recipients, setRecipients] = useState<Recipient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECIPIENTS);
    return saved ? JSON.parse(saved) : INITIAL_RECIPIENTS;
  });

  const [matches, setMatches] = useState<MatchResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return saved ? JSON.parse(saved) : [];
  });

  const [transportQueue, setTransportQueue] = useState<TransportQueueItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSPORTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [matchingLogs, setMatchingLogs] = useState<MatchingLogStep[]>([]);
  const [lastMatchResult, setLastMatchResult] = useState<MatchingExecutionResult | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORGANS, JSON.stringify(organs));
  }, [organs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(recipients));
  }, [recipients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSPORTS, JSON.stringify(transportQueue));
  }, [transportQueue]);

  // 1. Maintain Hash Tables (O(1) lookups)
  const organHashTable = useMemo(() => {
    const table = new HashTable<DonorOrgan>(31);
    for (const organ of organs) {
      table.set(organ.id, organ);
    }
    return table;
  }, [organs]);

  const recipientHashTable = useMemo(() => {
    const table = new HashTable<Recipient>(31);
    for (const recipient of recipients) {
      table.set(recipient.id, recipient);
    }
    return table;
  }, [recipients]);

  // 2. Maintain Priority Queues (Binary Heaps)
  // Max-Heap for Recipients: Prioritizes Urgency + Longest Wait Time
  const recipientPriorityQueue = useMemo(() => {
    const urgencyScoreMap: Record<string, number> = {
      'Status 1A (Critical)': 1000,
      'Status 1B (Urgent)': 500,
      'Status 2 (Moderate)': 200,
      'Status 3 (Stable)': 50,
    };

    const calculatePriority = (r: Recipient): number => {
      const urgencyBase = urgencyScoreMap[r.urgency] || 0;
      const waitDays = CompatibilityScorer.calculateWaitTimeScore(r.registrationDate).days;
      const praBonus = r.praScore * 2; // Extra points for high sensitization
      return urgencyBase + waitDays + praBonus;
    };

    const pq = new PriorityQueue<Recipient>(
      (a, b) => calculatePriority(a) - calculatePriority(b),
      calculatePriority
    );

    for (const r of recipients.filter(rec => rec.status === 'Waiting')) {
      pq.push(r);
    }
    return pq;
  }, [recipients]);

  // Min-Heap for Organs: Prioritizes Least Shelf-Life Remaining (Urgent Expiry)
  const organExpiryQueue = useMemo(() => {
    const calculateRemaining = (o: DonorOrgan): number => {
      return CompatibilityScorer.getRemainingShelfLifeHours(o);
    };

    // For Min-Heap using max-heap comparator: (b - a) gives min-heap root at top
    const pq = new PriorityQueue<DonorOrgan>(
      (a, b) => calculateRemaining(b) - calculateRemaining(a),
      calculateRemaining
    );

    for (const o of organs.filter(org => org.status === 'Available')) {
      pq.push(o);
    }
    return pq;
  }, [organs]);

  // 3. Maintain Bipartite Graph
  const bipartiteGraph = useMemo(() => {
    const graph = new BipartiteGraph();
    for (const organ of organs) {
      graph.addOrgan(organ);
    }
    for (const recipient of recipients) {
      graph.addRecipient(recipient);
    }
    graph.buildCompatibilityEdges();
    return graph;
  }, [organs, recipients]);

  // Generate Graph Visualization Data with Optimal Edges highlighted
  const graphData = useMemo(() => {
    const optimalEdgeKeys = new Set<string>();
    for (const match of matches) {
      optimalEdgeKeys.add(`${match.organId}->${match.recipientId}`);
    }
    return bipartiteGraph.toGraphData(optimalEdgeKeys);
  }, [bipartiteGraph, matches]);

  // Helper Lookups
  const getOrganById = (id: string) => organHashTable.get(id);
  const getRecipientById = (id: string) => recipientHashTable.get(id);

  // CRUD Actions
  const addOrgan = (newOrganData: Omit<DonorOrgan, 'id'>) => {
    const nextNum = organs.length + 101;
    const newOrgan: DonorOrgan = {
      ...newOrganData,
      id: `ORG-${nextNum}`,
    };
    setOrgans(prev => [newOrgan, ...prev]);
  };

  const updateOrgan = (id: string, updated: Partial<DonorOrgan>) => {
    setOrgans(prev => prev.map(o => (o.id === id ? { ...o, ...updated } : o)));
  };

  const deleteOrgan = (id: string) => {
    setOrgans(prev => prev.filter(o => o.id !== id));
  };

  const addRecipient = (newRecData: Omit<Recipient, 'id'>) => {
    const nextNum = recipients.length + 201;
    const newRecipient: Recipient = {
      ...newRecData,
      id: `REC-${nextNum}`,
    };
    setRecipients(prev => [newRecipient, ...prev]);
  };

  const updateRecipient = (id: string, updated: Partial<Recipient>) => {
    setRecipients(prev => prev.map(r => (r.id === id ? { ...r, ...updated } : r)));
  };

  const deleteRecipient = (id: string) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  // Run Matching Algorithm
  const generateMatches = (minThreshold = 35): MatchingExecutionResult => {
    const result = MatchingEngine.runMatching(bipartiteGraph, { minScoreThreshold: minThreshold });
    setMatches(result.matches);
    setMatchingLogs(result.executionLogs);
    setLastMatchResult(result);

    if (result.matches.length > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#0284c7', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        // Ignore in non-browser environments
      }
    }

    return result;
  };

  // Accept Match & Push to FIFO Transport Queue
  const acceptMatch = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    // 1. Update Match status
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'Accepted' } : m));

    // 2. Update Organ and Recipient statuses
    updateOrgan(match.organId, { status: 'Reserved' });
    updateRecipient(match.recipientId, { status: 'Matched' });

    // 3. Determine Courier Type based on distance & shelf-life
    let courierType: TransportQueueItem['courierType'] = 'High-Speed Ground Unit';
    if (match.distanceKm > 600 || match.shelfLifeRemainingHours < 3.0) {
      courierType = 'Emergency Air Ambulance';
    } else if (match.distanceKm > 200) {
      courierType = 'Medical Jet';
    }

    let priorityLevel: TransportQueueItem['priorityLevel'] = 'Tier 3 Standard';
    if (match.recipient.urgency === 'Status 1A (Critical)' || match.shelfLifeRemainingHours < 3.0) {
      priorityLevel = 'Tier 1 Critical';
    } else if (match.recipient.urgency === 'Status 1B (Urgent)') {
      priorityLevel = 'Tier 2 Urgent';
    }

    const newTransportItem: TransportQueueItem = {
      id: `TRN-${Date.now().toString().slice(-6)}`,
      matchId: match.id,
      organId: match.organId,
      recipientId: match.recipientId,
      organType: match.organ.organType,
      bloodGroup: match.organ.bloodGroup,
      sourceHospital: match.organ.hospital,
      sourceCity: match.organ.city,
      destinationHospital: match.recipient.hospital,
      destinationCity: match.recipient.city,
      distanceKm: match.distanceKm,
      stage: 'Match Accepted',
      estimatedArrival: `${Math.max(1, Math.round(match.distanceKm / 120 + 0.8))} hours`,
      courierType,
      priorityLevel,
      enqueuedAt: new Date().toISOString(),
      logs: [
        {
          timestamp: new Date().toISOString(),
          message: `Match confirmed by surgical team. Enqueued into Transplant Dispatch pipeline.`,
          stage: 'Match Accepted',
        }
      ],
    };

    setTransportQueue(prev => [newTransportItem, ...prev]);

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch (e) {}
  };

  const rejectMatch = (matchId: string) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'Rejected' } : m));
  };

  // Advance Transport Pipeline Stage
  const advanceTransportStage = (transportId: string) => {
    const stageMap: Record<TransportStage, TransportStage | null> = {
      'Match Accepted': 'Transport Scheduled',
      'Transport Scheduled': 'In Transit',
      'In Transit': 'Transplant Ready',
      'Transplant Ready': 'Completed',
      'Completed': null,
    };

    setTransportQueue(prev =>
      prev.map(item => {
        if (item.id === transportId) {
          const nextStage = stageMap[item.stage];
          if (!nextStage) return item;

          // If transitioning to In Transit, update organ status
          if (nextStage === 'In Transit') {
            updateOrgan(item.organId, { status: 'In Transit' });
          } else if (nextStage === 'Completed') {
            updateOrgan(item.organId, { status: 'Transplanted' });
            updateRecipient(item.recipientId, { status: 'Transplanted' });
          }

          return {
            ...item,
            stage: nextStage,
            logs: [
              ...item.logs,
              {
                timestamp: new Date().toISOString(),
                message: `Transport advanced to [${nextStage}]. Surgical teams alerted.`,
                stage: nextStage,
              }
            ]
          };
        }
        return item;
      })
    );
  };

  const resetToSampleData = () => {
    setOrgans(INITIAL_ORGANS);
    setRecipients(INITIAL_RECIPIENTS);
    setMatches([]);
    setTransportQueue([]);
    setMatchingLogs([]);
    setLastMatchResult(null);
    localStorage.removeItem(STORAGE_KEYS.ORGANS);
    localStorage.removeItem(STORAGE_KEYS.RECIPIENTS);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.TRANSPORTS);
  };

  return (
    <OrganSyncContext.Provider
      value={{
        organs,
        recipients,
        matches,
        transportQueue,
        matchingLogs,
        lastMatchResult,
        organHashTable,
        recipientHashTable,
        recipientPriorityQueue,
        organExpiryQueue,
        bipartiteGraph,
        graphData,
        addOrgan,
        updateOrgan,
        deleteOrgan,
        addRecipient,
        updateRecipient,
        deleteRecipient,
        generateMatches,
        acceptMatch,
        rejectMatch,
        advanceTransportStage,
        resetToSampleData,
        getOrganById,
        getRecipientById,
      }}
    >
      {children}
    </OrganSyncContext.Provider>
  );
};

export const useOrganSync = () => {
  const context = useContext(OrganSyncContext);
  if (!context) {
    throw new Error('useOrganSync must be used within an OrganSyncProvider');
  }
  return context;
};
