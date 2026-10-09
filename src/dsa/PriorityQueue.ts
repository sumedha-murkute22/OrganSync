/**
 * Priority Queue / Binary Heap Implementation
 * 
 * Concept:
 * A Priority Queue is a tree-based complete binary heap data structure where each node satisfies
 * the heap property: parent is prioritized over children according to a comparator function.
 * 
 * Time Complexity:
 * - Insert (push): O(log N) using bubbleUp
 * - Remove top (pop): O(log N) using bubbleDown
 * - Peek top: O(1)
 * 
 * Use in OrganSync:
 * 1. Recipient Priority Max-Heap:
 *    Ranks waiting patients by clinical urgency score (Status 1A > 1B > 2 > 3), wait time, and immunological antibody sensitization (PRA).
 * 2. Organ Expiry Min-Heap:
 *    Ranks available donor organs by cold-ischemic shelf-life remaining (Organs closest to ischemic necrosis get prioritized for allocation first).
 */

export type Comparator<T> = (a: T, b: T) => number;

export interface HeapNodeVisual<T> {
  index: number;
  value: T;
  priorityScore: number;
  leftIndex?: number;
  rightIndex?: number;
  parentIndex?: number;
}

export class PriorityQueue<T> {
  private heap: T[];
  private comparator: Comparator<T>;
  private scoreExtractor?: (item: T) => number;

  constructor(comparator: Comparator<T>, scoreExtractor?: (item: T) => number) {
    this.heap = [];
    this.comparator = comparator;
    this.scoreExtractor = scoreExtractor;
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public peek(): T | undefined {
    return this.heap.length > 0 ? this.heap[0] : undefined;
  }

  /**
   * Insert item and bubble up to restore heap order
   * Time Complexity: O(log N)
   */
  public push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Remove and return root item, swap with last, and bubble down
   * Time Complexity: O(log N)
   */
  public pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    const last = this.heap.pop()!;
    this.heap[0] = last;
    this.bubbleDown(0);
    return root;
  }

  private bubbleUp(index: number): void {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      // If child has higher priority than parent
      if (this.comparator(this.heap[currentIndex], this.heap[parentIndex]) > 0) {
        this.swap(currentIndex, parentIndex);
        currentIndex = parentIndex;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    let currentIndex = index;
    const length = this.heap.length;

    while (true) {
      const leftChild = 2 * currentIndex + 1;
      const rightChild = 2 * currentIndex + 2;
      let highestPriority = currentIndex;

      if (
        leftChild < length &&
        this.comparator(this.heap[leftChild], this.heap[highestPriority]) > 0
      ) {
        highestPriority = leftChild;
      }

      if (
        rightChild < length &&
        this.comparator(this.heap[rightChild], this.heap[highestPriority]) > 0
      ) {
        highestPriority = rightChild;
      }

      if (highestPriority !== currentIndex) {
        this.swap(currentIndex, highestPriority);
        currentIndex = highestPriority;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Return a copy of the internal heap array
   */
  public toArray(): T[] {
    return [...this.heap];
  }

  /**
   * Return sorted elements without mutating the internal queue
   */
  public toSortedArray(): T[] {
    const clone = new PriorityQueue<T>(this.comparator, this.scoreExtractor);
    for (const item of this.heap) {
      clone.push(item);
    }
    const result: T[] = [];
    while (!clone.isEmpty()) {
      result.push(clone.pop()!);
    }
    return result;
  }

  /**
   * Generate visual node hierarchy for binary tree diagrams
   */
  public getTreeNodes(): HeapNodeVisual<T>[] {
    return this.heap.map((item, index) => {
      const leftIndex = 2 * index + 1 < this.heap.length ? 2 * index + 1 : undefined;
      const rightIndex = 2 * index + 2 < this.heap.length ? 2 * index + 2 : undefined;
      const parentIndex = index > 0 ? Math.floor((index - 1) / 2) : undefined;
      const score = this.scoreExtractor ? this.scoreExtractor(item) : 0;

      return {
        index,
        value: item,
        priorityScore: score,
        leftIndex,
        rightIndex,
        parentIndex,
      };
    });
  }
}
