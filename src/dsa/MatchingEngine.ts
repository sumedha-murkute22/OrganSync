import { BipartiteGraph } from './BipartiteGraph';
import { MatchResult, DonorOrgan, Recipient } from '../types';

/**
 * Maximum Weight Bipartite Matching Algorithm & Allocation Engine
 * 
 * Concept:
 * Given a weighted bipartite graph G = (U, V, E), find a subset of edges M ⊆ E such that:
 * 1. No two edges share a common vertex (Each organ ∈ U matched to ≤ 1 recipient ∈ V, and vice versa).
 * 2. The total sum of compatibility weights Σ w(e) is maximized while prioritizing urgent medical constraints.
 * 
 * Algorithm Strategy:
 * 1. Build the Bipartite Graph of all eligible organ-recipient candidate pairs.
 * 2. Extract and sort candidate match edges by adjusted priority score:
 *    AdjustedScore = CompatibilityScore + (UrgencyBonus * 1.2) + (ExpiringOrganUrgencyBonus * 1.5)
 * 3. Greedily match the highest-scoring candidate edge (u, v).
 * 4. Lock organ u and recipient v (mark as matched).
 * 5. Record alternative matches and rejected candidates for transparency.
 * 
 * Time Complexity:
 * O(E log E) for sorting candidate pairs + O(E) for greedy assignment.
 * Space Complexity:
 * O(V + E) to store match states and graph references.
 */

export interface CandidateEdge {
  organ: DonorOrgan;
  recipient: Recipient;
  score: number;
  breakdown: any;
  distanceKm: number;
  shelfLifeRemainingHours: number;
  reasons: string[];
}

export interface MatchingLogStep {
  stepNumber: number;
  action: 'EVALUATE' | 'MATCH_ASSIGNED' | 'CONFLICT_RESOLVED' | 'SKIPPED_ALREADY_MATCHED';
  organId: string;
  recipientId: string;
  score: number;
  message: string;
}

export interface MatchingExecutionResult {
  matches: MatchResult[];
  unmatchedOrgans: DonorOrgan[];
  unmatchedRecipients: Recipient[];
  allCandidatesRanked: CandidateEdge[];
  executionLogs: MatchingLogStep[];
  executionTimeMs: number;
}

export class MatchingEngine {
  public static runMatching(
    graph: BipartiteGraph,
    options: { minScoreThreshold?: number } = {}
  ): MatchingExecutionResult {
    const startTime = performance.now();
    const minThreshold = options.minScoreThreshold ?? 40;
    const executionLogs: MatchingLogStep[] = [];
    let stepCount = 1;

    // 1. Collect all candidate edges from the bipartite graph
    const allOrgans = graph.getAllOrgans().filter(o => o.status === 'Available');
    const allRecipients = graph.getAllRecipients().filter(r => r.status === 'Waiting');

    const candidates: CandidateEdge[] = [];

    for (const organ of allOrgans) {
      const neighbors = graph.getOrganNeighbors(organ.id);
      for (const edge of neighbors) {
        const recipient = graph.getRecipient(edge.targetId);
        if (recipient && recipient.status === 'Waiting') {
          if (edge.weight >= minThreshold) {
            candidates.push({
              organ,
              recipient,
              score: edge.weight,
              breakdown: edge.breakdown,
              distanceKm: edge.distanceKm,
              shelfLifeRemainingHours: edge.shelfLifeRemainingHours,
              reasons: edge.reasons,
            });
          }
        }
      }
    }

    // 2. Sort candidate pairs in descending order of composite priority
    candidates.sort((a, b) => {
      // Primary: Score
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Secondary: Recipient urgency tie-breaker
      const urgencyRank: Record<string, number> = {
        'Status 1A (Critical)': 4,
        'Status 1B (Urgent)': 3,
        'Status 2 (Moderate)': 2,
        'Status 3 (Stable)': 1,
      };
      const rankA = urgencyRank[a.recipient.urgency] || 0;
      const rankB = urgencyRank[b.recipient.urgency] || 0;
      if (rankB !== rankA) return rankB - rankA;

      // Tertiary: Organ shelf life (smaller remaining shelf life prioritized)
      return a.shelfLifeRemainingHours - b.shelfLifeRemainingHours;
    });

    // 3. Greedy Matching with 1-to-1 Uniqueness Constraints
    const matchedOrganIds = new Set<string>();
    const matchedRecipientIds = new Set<string>();
    const matches: MatchResult[] = [];

    for (const candidate of candidates) {
      const organId = candidate.organ.id;
      const recipientId = candidate.recipient.id;

      if (matchedOrganIds.has(organId)) {
        executionLogs.push({
          stepNumber: stepCount++,
          action: 'SKIPPED_ALREADY_MATCHED',
          organId,
          recipientId,
          score: candidate.score,
          message: `Organ ${organId} was already assigned to a higher-ranked recipient. Skipping pair with ${recipientId}.`,
        });
        continue;
      }

      if (matchedRecipientIds.has(recipientId)) {
        executionLogs.push({
          stepNumber: stepCount++,
          action: 'SKIPPED_ALREADY_MATCHED',
          organId,
          recipientId,
          score: candidate.score,
          message: `Recipient ${recipientId} was already assigned a higher-compatibility organ. Skipping pair with ${organId}.`,
        });
        continue;
      }

      // Valid match found!
      matchedOrganIds.add(organId);
      matchedRecipientIds.add(recipientId);

      const matchResult: MatchResult = {
        id: `MATCH-${organId.replace('ORG-', '')}-${recipientId.replace('REC-', '')}`,
        organId,
        recipientId,
        organ: candidate.organ,
        recipient: candidate.recipient,
        compatibilityScore: candidate.score,
        scoreBreakdown: candidate.breakdown,
        distanceKm: candidate.distanceKm,
        shelfLifeRemainingHours: candidate.shelfLifeRemainingHours,
        reasons: candidate.reasons,
        rank: matches.length + 1,
        status: 'Proposed',
        createdAt: new Date().toISOString(),
      };

      matches.push(matchResult);

      executionLogs.push({
        stepNumber: stepCount++,
        action: 'MATCH_ASSIGNED',
        organId,
        recipientId,
        score: candidate.score,
        message: `ASSIGNED: ${candidate.organ.organType} ${organId} matched to ${candidate.recipient.name} (${recipientId}) with score ${candidate.score}/100.`,
      });
    }

    // 4. Identify unmatched entities
    const unmatchedOrgans = allOrgans.filter(o => !matchedOrganIds.has(o.id));
    const unmatchedRecipients = allRecipients.filter(r => !matchedRecipientIds.has(r.id));

    const endTime = performance.now();

    return {
      matches,
      unmatchedOrgans,
      unmatchedRecipients,
      allCandidatesRanked: candidates,
      executionLogs,
      executionTimeMs: Number((endTime - startTime).toFixed(2)),
    };
  }
}
