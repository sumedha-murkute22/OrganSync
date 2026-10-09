import { TransportQueueItem, TransportStage } from '../types';

/**
 * First-In First-Out (FIFO) Queue Implementation
 * 
 * Concept:
 * A Queue is a linear data structure operating on a First-In-First-Out (FIFO) principle.
 * Elements are enqueued at the back (tail) and dequeued from the front (head).
 * 
 * Time Complexity:
 * - Enqueue: O(1)
 * - Dequeue: O(1)
 * - Peek Front: O(1)
 * 
 * Educational Insight:
 * In OrganSync, the FIFO Queue manages the lifecycle of accepted organ transplant logistics.
 * Organs matched first are prioritized for surgical room prep, transport courier dispatch,
 * and recipient intake in exact order of confirmation.
 */

export interface QueueNode<T> {
  value: T;
  next?: QueueNode<T>;
}

export class FIFOQueue<T> {
  private head?: QueueNode<T>;
  private tail?: QueueNode<T>;
  private length: number;

  constructor() {
    this.head = undefined;
    this.tail = undefined;
    this.length = 0;
  }

  /**
   * Add element to the tail of the queue
   * Time Complexity: O(1)
   */
  public enqueue(value: T): void {
    const newNode: QueueNode<T> = { value, next: undefined };

    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
  }

  /**
   * Remove and return the front element
   * Time Complexity: O(1)
   */
  public dequeue(): T | undefined {
    if (!this.head) return undefined;

    const value = this.head.value;
    this.head = this.head.next;

    if (!this.head) {
      this.tail = undefined;
    }

    this.length--;
    return value;
  }

  /**
   * Look at the front element without removing it
   * Time Complexity: O(1)
   */
  public peek(): T | undefined {
    return this.head?.value;
  }

  public size(): number {
    return this.length;
  }

  public isEmpty(): boolean {
    return this.length === 0;
  }

  public toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  public clear(): void {
    this.head = undefined;
    this.tail = undefined;
    this.length = 0;
  }
}

/**
 * Transport Queue Manager with Stage Transitions
 */
export class TransportQueueManager {
  private queue: FIFOQueue<TransportQueueItem>;
  private itemsMap: Map<string, TransportQueueItem>;

  constructor() {
    this.queue = new FIFOQueue<TransportQueueItem>();
    this.itemsMap = new Map();
  }

  public enqueueTransport(item: TransportQueueItem): void {
    this.itemsMap.set(item.id, item);
    this.queue.enqueue(item);
  }

  public advanceStage(id: string): TransportQueueItem | null {
    const item = this.itemsMap.get(id);
    if (!item) return null;

    const stageProgression: Record<TransportStage, TransportStage | null> = {
      'Match Accepted': 'Transport Scheduled',
      'Transport Scheduled': 'In Transit',
      'In Transit': 'Transplant Ready',
      'Transplant Ready': 'Completed',
      'Completed': null,
    };

    const nextStage = stageProgression[item.stage];
    if (nextStage) {
      item.stage = nextStage;
      item.logs.push({
        timestamp: new Date().toISOString(),
        message: `Status updated to [${nextStage}].`,
        stage: nextStage,
      });
      this.itemsMap.set(id, { ...item });
      return item;
    }
    return null;
  }

  public getAllItems(): TransportQueueItem[] {
    return Array.from(this.itemsMap.values());
  }

  public getItem(id: string): TransportQueueItem | undefined {
    return this.itemsMap.get(id);
  }

  public getActiveQueue(): TransportQueueItem[] {
    return this.getAllItems().filter(item => item.stage !== 'Completed');
  }

  public getCompletedQueue(): TransportQueueItem[] {
    return this.getAllItems().filter(item => item.stage === 'Completed');
  }

  public clear(): void {
    this.queue.clear();
    this.itemsMap.clear();
  }
}
