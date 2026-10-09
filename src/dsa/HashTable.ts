/**
 * Hash Table Data Structure Implementation
 * 
 * Concept:
 * A Hash Table provides O(1) average time complexity for insertions, deletions,
 * and lookups by converting keys into bucket indices using a hash function.
 * 
 * Collision Handling:
 * Implemented using Separate Chaining (each bucket contains a linked list / array of key-value pairs).
 * 
 * Educational Insight:
 * In OrganSync, Hash Tables allow instant O(1) lookup of Donor Organs and Waiting Recipients
 * by their unique alphanumeric IDs (e.g., 'ORG-101', 'REC-204'), avoiding costly O(N) linear scans.
 */

export interface HashNode<T> {
  key: string;
  value: T;
}

export interface HashTableMetrics {
  size: number;
  capacity: number;
  loadFactor: number;
  collisions: number;
  longestChain: number;
  bucketDistribution: number[];
}

export class HashTable<T> {
  private buckets: Array<Array<HashNode<T>>>;
  private capacity: number;
  private count: number;
  private collisionCount: number;

  constructor(initialCapacity = 31) {
    this.capacity = initialCapacity;
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
    this.count = 0;
    this.collisionCount = 0;
  }

  /**
   * Polynomial rolling hash function for strings
   * Formula: hash = (hash * 31 + charCode) % capacity
   */
  private hash(key: string): number {
    let hashVal = 0;
    const prime = 31;
    for (let i = 0; i < key.length; i++) {
      hashVal = (hashVal * prime + key.charCodeAt(i)) % this.capacity;
    }
    return Math.abs(hashVal);
  }

  /**
   * Rehash all elements into a new table with double capacity
   * Triggered when load factor exceeds 0.75
   */
  private rehash(): void {
    const oldBuckets = this.buckets;
    this.capacity = this.capacity * 2 + 1; // Keep prime-like odd number
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
    this.count = 0;
    this.collisionCount = 0;

    for (const bucket of oldBuckets) {
      for (const node of bucket) {
        this.set(node.key, node.value);
      }
    }
  }

  /**
   * Insert or update a key-value pair
   * Time Complexity: O(1) average, O(N) worst case (with massive collisions)
   */
  public set(key: string, value: T): void {
    if (this.count / this.capacity > 0.75) {
      this.rehash();
    }

    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i].value = value;
        return;
      }
    }

    if (bucket.length > 0) {
      this.collisionCount++;
    }

    bucket.push({ key, value });
    this.count++;
  }

  /**
   * Retrieve value by key
   * Time Complexity: O(1) average
   */
  public get(key: string): T | undefined {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (const node of bucket) {
      if (node.key === key) {
        return node.value;
      }
    }
    return undefined;
  }

  /**
   * Check if key exists
   * Time Complexity: O(1) average
   */
  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete a key-value pair
   * Time Complexity: O(1) average
   */
  public delete(key: string): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket.splice(i, 1);
        this.count--;
        return true;
      }
    }
    return false;
  }

  /**
   * Return all stored values
   */
  public values(): T[] {
    const allValues: T[] = [];
    for (const bucket of this.buckets) {
      for (const node of bucket) {
        allValues.push(node.value);
      }
    }
    return allValues;
  }

  /**
   * Return all stored keys
   */
  public keys(): string[] {
    const allKeys: string[] = [];
    for (const bucket of this.buckets) {
      for (const node of bucket) {
        allKeys.push(node.key);
      }
    }
    return allKeys;
  }

  /**
   * Return all entries as key-value pairs
   */
  public entries(): Array<[string, T]> {
    const result: Array<[string, T]> = [];
    for (const bucket of this.buckets) {
      for (const node of bucket) {
        result.push([node.key, node.value]);
      }
    }
    return result;
  }

  /**
   * Current number of stored items
   */
  public size(): number {
    return this.count;
  }

  /**
   * Clear all items
   */
  public clear(): void {
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
    this.count = 0;
    this.collisionCount = 0;
  }

  /**
   * Real-time metrics for educational visualizers
   */
  public getMetrics(): HashTableMetrics {
    let longestChain = 0;
    const bucketDistribution = this.buckets.map(b => {
      if (b.length > longestChain) longestChain = b.length;
      return b.length;
    });

    return {
      size: this.count,
      capacity: this.capacity,
      loadFactor: Number((this.count / this.capacity).toFixed(3)),
      collisions: this.collisionCount,
      longestChain,
      bucketDistribution,
    };
  }

  /**
   * Raw bucket structure for visualizer
   */
  public getRawBuckets(): Array<Array<HashNode<T>>> {
    return this.buckets;
  }
}
