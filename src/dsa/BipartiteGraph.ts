import { DonorOrgan, Recipient, GraphNode, GraphEdge, BipartiteGraphData, ScoreBreakdown } from '../types';
import { CompatibilityScorer } from './CompatibilityScorer';

/**
 * Weighted Bipartite Graph Data Structure
 * 
 * Concept:
 * A bipartite graph G = (V, E) is a graph whose vertices can be divided into two disjoint sets:
 * U (Organs) and V (Recipients), such that every edge connects a vertex in U to one in V.
 * 
 * In OrganSync:
 * - Left Set (U): Available Donated Organs
 * - Right Set (V): Waiting Registered Recipients
 * - Edges (E): Formed ONLY if the pair satisfies exact organ match, ABO compatibility, and shelf-life validity.
 * - Edge Weight (W): 0 - 100 compatibility score computed by multi-factor medical logic.
 */

export interface AdjacencyEdge {
  targetId: string;
  weight: number;
  breakdown: ScoreBreakdown;
  distanceKm: number;
  shelfLifeRemainingHours: number;
  reasons: string[];
}

export class BipartiteGraph {
  private organNodes: Map<string, DonorOrgan>;
  private recipientNodes: Map<string, Recipient>;
  private organAdjList: Map<string, AdjacencyEdge[]>;
  private recipientAdjList: Map<string, AdjacencyEdge[]>;

  constructor() {
    this.organNodes = new Map();
    this.recipientNodes = new Map();
    this.organAdjList = new Map();
    this.recipientAdjList = new Map();
  }

  public clear(): void {
    this.organNodes.clear();
    this.recipientNodes.clear();
    this.organAdjList.clear();
    this.recipientAdjList.clear();
  }

  public addOrgan(organ: DonorOrgan): void {
    this.organNodes.set(organ.id, organ);
    if (!this.organAdjList.has(organ.id)) {
      this.organAdjList.set(organ.id, []);
    }
  }

  public addRecipient(recipient: Recipient): void {
    this.recipientNodes.set(recipient.id, recipient);
    if (!this.recipientAdjList.has(recipient.id)) {
      this.recipientAdjList.set(recipient.id, []);
    }
  }

  /**
   * Automatically builds all valid weighted edges between U and V
   * Time Complexity: O(|U| * |V|)
   */
  public buildCompatibilityEdges(currentTime: Date = new Date()): void {
    // Reset adjacency lists
    for (const organId of this.organNodes.keys()) {
      this.organAdjList.set(organId, []);
    }
    for (const recId of this.recipientNodes.keys()) {
      this.recipientAdjList.set(recId, []);
    }

    for (const organ of this.organNodes.values()) {
      for (const recipient of this.recipientNodes.values()) {
        const evalResult = CompatibilityScorer.evaluatePair(organ, recipient, currentTime);
        if (evalResult && evalResult.isCompatible) {
          // Add forward edge: Organ -> Recipient
          this.organAdjList.get(organ.id)?.push({
            targetId: recipient.id,
            weight: evalResult.totalScore,
            breakdown: evalResult.breakdown,
            distanceKm: evalResult.distanceKm,
            shelfLifeRemainingHours: evalResult.remainingShelfLife,
            reasons: evalResult.reasons,
          });

          // Add backward edge: Recipient -> Organ
          this.recipientAdjList.get(recipient.id)?.push({
            targetId: organ.id,
            weight: evalResult.totalScore,
            breakdown: evalResult.breakdown,
            distanceKm: evalResult.distanceKm,
            shelfLifeRemainingHours: evalResult.remainingShelfLife,
            reasons: evalResult.reasons,
          });
        }
      }
    }
  }

  public getOrganNeighbors(organId: string): AdjacencyEdge[] {
    return this.organAdjList.get(organId) || [];
  }

  public getRecipientNeighbors(recipientId: string): AdjacencyEdge[] {
    return this.recipientAdjList.get(recipientId) || [];
  }

  public getOrgan(id: string): DonorOrgan | undefined {
    return this.organNodes.get(id);
  }

  public getRecipient(id: string): Recipient | undefined {
    return this.recipientNodes.get(id);
  }

  public getAllOrgans(): DonorOrgan[] {
    return Array.from(this.organNodes.values());
  }

  public getAllRecipients(): Recipient[] {
    return Array.from(this.recipientNodes.values());
  }

  /**
   * Total number of vertices and edges
   */
  public getGraphStats(): { organCount: number; recipientCount: number; edgeCount: number; density: number } {
    let edgeCount = 0;
    for (const edges of this.organAdjList.values()) {
      edgeCount += edges.length;
    }

    const organCount = this.organNodes.size;
    const recipientCount = this.recipientNodes.size;
    const maxPossibleEdges = organCount * recipientCount;
    const density = maxPossibleEdges > 0 ? Number((edgeCount / maxPossibleEdges).toFixed(3)) : 0;

    return {
      organCount,
      recipientCount,
      edgeCount,
      density,
    };
  }

  /**
   * Export complete Graph topology for SVG/Canvas rendering
   */
  public toGraphData(optimalMatchIds: Set<string> = new Set()): BipartiteGraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Left Partition Nodes (Organs)
    for (const organ of this.organNodes.values()) {
      const remaining = CompatibilityScorer.getRemainingShelfLifeHours(organ);
      nodes.push({
        id: organ.id,
        label: `${organ.organType} (${organ.bloodGroup})`,
        type: 'organ',
        organType: organ.organType,
        bloodGroup: organ.bloodGroup,
        urgencyOrShelfLife: `${remaining}h left`,
        hospital: organ.hospital,
        data: organ,
      });
    }

    // Right Partition Nodes (Recipients)
    for (const recipient of this.recipientNodes.values()) {
      nodes.push({
        id: recipient.id,
        label: `${recipient.name} [${recipient.organNeeded}]`,
        type: 'recipient',
        organType: recipient.organNeeded,
        bloodGroup: recipient.bloodGroup,
        urgencyOrShelfLife: recipient.urgency.split(' ')[0], // e.g. Status 1A
        hospital: recipient.hospital,
        data: recipient,
      });
    }

    // Graph Edges
    for (const [organId, adjEdges] of this.organAdjList.entries()) {
      for (const edge of adjEdges) {
        const edgeId = `${organId}->${edge.targetId}`;
        const isOptimal = optimalMatchIds.has(edgeId);

        edges.push({
          id: edgeId,
          source: organId,
          target: edge.targetId,
          weight: edge.weight,
          isOptimalMatch: isOptimal,
          scoreBreakdown: edge.breakdown,
        });
      }
    }

    return { nodes, edges };
  }
}
