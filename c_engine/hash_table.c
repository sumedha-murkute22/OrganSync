/**
 * OrganSync - Hash Table Implementation
 * 
 * DSA CONCEPT:
 * A Hash Table provides average-case O(1) time complexity for record insertion,
 * lookup, and deletion. Keys (such as "ORG-101" or "REC-201") are transformed into
 * integer indices using the DJB2 hashing algorithm.
 * 
 * Collision Resolution:
 * We use Separate Chaining (singly linked lists at each bucket index).
 * When multiple distinct keys hash to the same bucket index (h(k1) == h(k2)),
 * the nodes are chained sequentially.
 * 
 * Complexity Analysis:
 * - Average Time Complexity: O(1) for insert, search, and delete, assuming a uniform
 *   hash function and reasonable load factor alpha = n / m <= 0.75.
 * - Worst-Case Time Complexity: O(n) if all n keys hash to the same bucket (degenerate linked list).
 * - Space Complexity: O(m + n), where m is the bucket array capacity and n is the total records.
 */

#include "hash_table.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * DJB2 Hash Algorithm by Dan Bernstein.
 * Multiplies hash by 33 (hash << 5 + hash) and adds character value.
 * Excellent bit-dispersion across alphanumeric ID strings.
 */
unsigned long ht_hash(const char* str, int capacity) {
    if (!str || capacity <= 0) return 0;
    unsigned long hash = 5381;
    int c;
    while ((c = (unsigned char)*str++)) {
        hash = ((hash << 5) + hash) + c; /* hash * 33 + c */
    }
    return hash % (unsigned long)capacity;
}

HashTable* ht_create(int capacity) {
    if (capacity <= 0) capacity = DEFAULT_HT_CAPACITY;
    
    HashTable* ht = (HashTable*)malloc(sizeof(HashTable));
    if (!ht) {
        fprintf(stderr, "Error: Memory allocation failed for HashTable.\n");
        return NULL;
    }
    
    ht->buckets = (HashNode**)calloc(capacity, sizeof(HashNode*));
    if (!ht->buckets) {
        fprintf(stderr, "Error: Memory allocation failed for HashTable buckets.\n");
        free(ht);
        return NULL;
    }
    
    ht->capacity = capacity;
    ht->size = 0;
    ht->collisions = 0;
    return ht;
}

void ht_free(HashTable* ht) {
    if (!ht) return;
    for (int i = 0; i < ht->capacity; i++) {
        HashNode* current = ht->buckets[i];
        while (current) {
            HashNode* temp = current;
            current = current->next;
            free(temp);
        }
    }
    free(ht->buckets);
    free(ht);
}

bool ht_insert_organ(HashTable* ht, const Organ* organ) {
    if (!ht || !organ || strlen(organ->id) == 0) return false;
    
    unsigned long index = ht_hash(organ->id, ht->capacity);
    HashNode* current = ht->buckets[index];
    
    /* Check if key already exists (Update existing record) */
    while (current) {
        if (strcmp(current->key, organ->id) == 0 && current->type == ENTRY_ORGAN) {
            current->data.organ = *organ;
            return true;
        }
        current = current->next;
    }
    
    /* Collision occurred if bucket is already non-empty */
    if (ht->buckets[index] != NULL) {
        ht->collisions++;
    }
    
    /* Allocate new node and insert at head of chain (O(1) insertion) */
    HashNode* new_node = (HashNode*)malloc(sizeof(HashNode));
    if (!new_node) return false;
    
    strncpy(new_node->key, organ->id, MAX_ID_LEN - 1);
    new_node->key[MAX_ID_LEN - 1] = '\0';
    new_node->type = ENTRY_ORGAN;
    new_node->data.organ = *organ;
    new_node->next = ht->buckets[index];
    ht->buckets[index] = new_node;
    ht->size++;
    
    return true;
}

Organ* ht_search_organ(HashTable* ht, const char* id) {
    if (!ht || !id) return NULL;
    unsigned long index = ht_hash(id, ht->capacity);
    HashNode* current = ht->buckets[index];
    
    while (current) {
        if (strcmp(current->key, id) == 0 && current->type == ENTRY_ORGAN) {
            return &current->data.organ;
        }
        current = current->next;
    }
    return NULL; /* Not found */
}

bool ht_delete_organ(HashTable* ht, const char* id) {
    if (!ht || !id) return false;
    unsigned long index = ht_hash(id, ht->capacity);
    HashNode* current = ht->buckets[index];
    HashNode* prev = NULL;
    
    while (current) {
        if (strcmp(current->key, id) == 0 && current->type == ENTRY_ORGAN) {
            if (prev) {
                prev->next = current->next;
            } else {
                ht->buckets[index] = current->next;
            }
            free(current);
            ht->size--;
            return true;
        }
        prev = current;
        current = current->next;
    }
    return false;
}

bool ht_insert_recipient(HashTable* ht, const Recipient* recipient) {
    if (!ht || !recipient || strlen(recipient->id) == 0) return false;
    
    unsigned long index = ht_hash(recipient->id, ht->capacity);
    HashNode* current = ht->buckets[index];
    
    /* Check if key already exists */
    while (current) {
        if (strcmp(current->key, recipient->id) == 0 && current->type == ENTRY_RECIPIENT) {
            current->data.recipient = *recipient;
            return true;
        }
        current = current->next;
    }
    
    if (ht->buckets[index] != NULL) {
        ht->collisions++;
    }
    
    HashNode* new_node = (HashNode*)malloc(sizeof(HashNode));
    if (!new_node) return false;
    
    strncpy(new_node->key, recipient->id, MAX_ID_LEN - 1);
    new_node->key[MAX_ID_LEN - 1] = '\0';
    new_node->type = ENTRY_RECIPIENT;
    new_node->data.recipient = *recipient;
    new_node->next = ht->buckets[index];
    ht->buckets[index] = new_node;
    ht->size++;
    
    return true;
}

Recipient* ht_search_recipient(HashTable* ht, const char* id) {
    if (!ht || !id) return NULL;
    unsigned long index = ht_hash(id, ht->capacity);
    HashNode* current = ht->buckets[index];
    
    while (current) {
        if (strcmp(current->key, id) == 0 && current->type == ENTRY_RECIPIENT) {
            return &current->data.recipient;
        }
        current = current->next;
    }
    return NULL;
}

bool ht_delete_recipient(HashTable* ht, const char* id) {
    if (!ht || !id) return false;
    unsigned long index = ht_hash(id, ht->capacity);
    HashNode* current = ht->buckets[index];
    HashNode* prev = NULL;
    
    while (current) {
        if (strcmp(current->key, id) == 0 && current->type == ENTRY_RECIPIENT) {
            if (prev) {
                prev->next = current->next;
            } else {
                ht->buckets[index] = current->next;
            }
            free(current);
            ht->size--;
            return true;
        }
        prev = current;
        current = current->next;
    }
    return false;
}

void ht_get_stats(const HashTable* ht, int* size, int* collisions, double* load_factor) {
    if (!ht) return;
    if (size) *size = ht->size;
    if (collisions) *collisions = ht->collisions;
    if (load_factor) *load_factor = (double)ht->size / (double)ht->capacity;
}

void ht_print_diagnostics(const HashTable* ht) {
    if (!ht) return;
    int size, collisions;
    double lf;
    ht_get_stats(ht, &size, &collisions, &lf);
    printf("--- Hash Table Diagnostics ---\n");
    printf("Total Capacity : %d buckets\n", ht->capacity);
    printf("Total Records  : %d items\n", size);
    printf("Collisions     : %d\n", collisions);
    printf("Load Factor    : %.4f\n", lf);
    printf("Average Lookup : O(1) [chain search depth ~ 1 + %.2f]\n", lf);
}
