import { describe, it, expect } from 'vitest';
import { HashTable } from '../HashTable';
import { PriorityQueue } from '../PriorityQueue';
import { CompatibilityScorer } from '../CompatibilityScorer';
import { BipartiteGraph } from '../BipartiteGraph';
import { MatchingEngine } from '../MatchingEngine';
import { FIFOQueue } from '../FIFOQueue';
import { DonorOrgan, Recipient } from '../../types';

describe('1. Hash Table Data Structure (O(1) Lookups)', () => {
  it('should insert, retrieve and delete items correctly', () => {
    const table = new HashTable<string>(5);
    table.set('ORG-101', 'Heart Data');
    table.set('REC-201', 'Recipient Data');

    expect(table.get('ORG-101')).toBe('Heart Data');
    expect(table.get('REC-201')).toBe('Recipient Data');
    expect(table.has('ORG-101')).toBe(true);
    expect(table.has('NON-EXISTENT')).toBe(false);

    expect(table.delete('ORG-101')).toBe(true);
    expect(table.get('ORG-101')).toBeUndefined();
    expect(table.size()).toBe(1);
  });

  it('should handle collisions gracefully using separate chaining', () => {
    const smallTable = new HashTable<number>(3);
    for (let i = 0; i < 20; i++) {
      smallTable.set(`KEY-${i}`, i * 10);
    }

    expect(smallTable.size()).toBe(20);
    for (let i = 0; i < 20; i++) {
      expect(smallTable.get(`KEY-${i}`)).toBe(i * 10);
    }

    const metrics = smallTable.getMetrics();
    expect(metrics.size).toBe(20);
    expect(metrics.loadFactor).toBeGreaterThan(0);
  });
});

describe('2. Priority Queue & Binary Heap (O(log N))', () => {
  it('should maintain Max-Heap order for urgent recipients', () => {
    const maxHeap = new PriorityQueue<number>((a, b) => a - b);
    maxHeap.push(10);
    maxHeap.push(50);
    maxHeap.push(30);
    maxHeap.push(100);
    maxHeap.push(5);

    expect(maxHeap.peek()).toBe(100);
    expect(maxHeap.pop()).toBe(100);
    expect(maxHeap.pop()).toBe(50);
    expect(maxHeap.pop()).toBe(30);
    expect(maxHeap.pop()).toBe(10);
    expect(maxHeap.pop()).toBe(5);
    expect(maxHeap.isEmpty()).toBe(true);
  });

  it('should correctly sort elements using toSortedArray without mutating heap', () => {
    const heap = new PriorityQueue<{ id: string; urgency: number }>((a, b) => a.urgency - b.urgency);
    heap.push({ id: 'P1', urgency: 20 });
    heap.push({ id: 'P2', urgency: 80 });
    heap.push({ id: 'P3', urgency: 40 });

    const sorted = heap.toSortedArray();
    expect(sorted[0].id).toBe('P2');
    expect(sorted[1].id).toBe('P3');
    expect(sorted[2].id).toBe('P1');
    expect(heap.size()).toBe(3); // Unmutated
  });
});

describe('3. Biomedical Compatibility Scoring & Strict Eligibility', () => {
  it('should strictly validate ABO blood compatibility matrix', () => {
    // O- is universal donor
    expect(CompatibilityScorer.isBloodCompatible('O-', 'O-')).toBe(true);
    expect(CompatibilityScorer.isBloodCompatible('O-', 'AB+')).toBe(true);
    expect(CompatibilityScorer.isBloodCompatible('O-', 'A+')).toBe(true);

    // O+ can donate to positive blood types only
    expect(CompatibilityScorer.isBloodCompatible('O+', 'A+')).toBe(true);
    expect(CompatibilityScorer.isBloodCompatible('O+', 'A-')).toBe(false);

    // AB+ is universal recipient
    expect(CompatibilityScorer.isBloodCompatible('A+', 'AB+')).toBe(true);
    expect(CompatibilityScorer.isBloodCompatible('B+', 'AB+')).toBe(true);
    expect(CompatibilityScorer.isBloodCompatible('AB+', 'O+')).toBe(false); // Incompatible
  });

  it('should reject pairs with mismatched organ types or incompatible blood', () => {
    const testOrgan: DonorOrgan = {
      id: 'ORG-T1',
      donorAge: 30,
      donorGender: 'Male',
      organType: 'Heart',
      bloodGroup: 'A+',
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*04' },
      hospital: 'General Hospital',
      city: 'Boston',
      coordinates: { lat: 42.36, lng: -71.06 },
      donationTime: new Date().toISOString(),
      maxShelfLifeHours: 5,
      status: 'Available',
    };

    const recipientWrongOrgan: Recipient = {
      id: 'REC-T1',
      name: 'Test Recipient',
      age: 35,
      gender: 'Female',
      organNeeded: 'Kidney', // Mismatch!
      bloodGroup: 'A+',
      urgency: 'Status 1A (Critical)',
      registrationDate: new Date().toISOString(),
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*04' },
      praScore: 0,
      hospital: 'General Hospital',
      city: 'Boston',
      coordinates: { lat: 42.36, lng: -71.06 },
      status: 'Waiting',
    };

    const recipientWrongBlood: Recipient = {
      ...recipientWrongOrgan,
      organNeeded: 'Heart',
      bloodGroup: 'O+', // A+ cannot donate to O+
    };

    expect(CompatibilityScorer.evaluatePair(testOrgan, recipientWrongOrgan)).toBeNull();
    expect(CompatibilityScorer.evaluatePair(testOrgan, recipientWrongBlood)).toBeNull();
  });
});

describe('4. Maximum Weight Bipartite Matching (1-to-1 Uniqueness)', () => {
  it('should guarantee that no organ or recipient is matched more than once', () => {
    const graph = new BipartiteGraph();

    // 2 Kidneys
    const organ1: DonorOrgan = {
      id: 'ORG-K1',
      donorAge: 25,
      donorGender: 'Male',
      organType: 'Kidney',
      bloodGroup: 'O+',
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*04' },
      hospital: 'Hospital A',
      city: 'City A',
      coordinates: { lat: 40.0, lng: -74.0 },
      donationTime: new Date().toISOString(),
      maxShelfLifeHours: 24,
      status: 'Available',
    };

    const organ2: DonorOrgan = {
      ...organ1,
      id: 'ORG-K2',
      bloodGroup: 'O+',
    };

    // 3 Recipients needing Kidney
    const rec1: Recipient = {
      id: 'REC-K1',
      name: 'Patient 1',
      age: 40,
      gender: 'Male',
      organNeeded: 'Kidney',
      bloodGroup: 'O+',
      urgency: 'Status 1A (Critical)',
      registrationDate: new Date().toISOString(),
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*04' },
      praScore: 10,
      hospital: 'Hospital A',
      city: 'City A',
      coordinates: { lat: 40.0, lng: -74.0 },
      status: 'Waiting',
    };

    const rec2: Recipient = { ...rec1, id: 'REC-K2', urgency: 'Status 1B (Urgent)' };
    const rec3: Recipient = { ...rec1, id: 'REC-K3', urgency: 'Status 2 (Moderate)' };

    graph.addOrgan(organ1);
    graph.addOrgan(organ2);
    graph.addRecipient(rec1);
    graph.addRecipient(rec2);
    graph.addRecipient(rec3);
    graph.buildCompatibilityEdges();

    const matchResult = MatchingEngine.runMatching(graph);

    // Exactly 2 matches (since only 2 organs exist)
    expect(matchResult.matches.length).toBe(2);

    const matchedOrgans = new Set(matchResult.matches.map(m => m.organId));
    const matchedRecipients = new Set(matchResult.matches.map(m => m.recipientId));

    // Ensure uniqueness: 1-to-1 constraint
    expect(matchedOrgans.size).toBe(2);
    expect(matchedRecipients.size).toBe(2);
    expect(matchResult.unmatchedRecipients.length).toBe(1);
    expect(matchResult.unmatchedOrgans.length).toBe(0);
  });
});

describe('5. FIFO Transport Processing Queue (O(1))', () => {
  it('should maintain strict First-In-First-Out ordering', () => {
    const queue = new FIFOQueue<string>();
    queue.enqueue('TRN-001');
    queue.enqueue('TRN-002');
    queue.enqueue('TRN-003');

    expect(queue.size()).toBe(3);
    expect(queue.peek()).toBe('TRN-001');
    expect(queue.dequeue()).toBe('TRN-001');
    expect(queue.dequeue()).toBe('TRN-002');
    expect(queue.dequeue()).toBe('TRN-003');
    expect(queue.dequeue()).toBeUndefined();
    expect(queue.isEmpty()).toBe(true);
  });
});
