/**
 * OrganSync - Priority Queue / Binary Heap Implementation
 * 
 * DSA CONCEPT:
 * A Binary Heap is a complete binary tree implemented compactly in an array.
 * We support two heap configurations:
 * 1. MAX-HEAP: Used for Waiting Recipients where the highest composite priority
 *    (urgency level + waiting time) is at the root.
 * 2. MIN-HEAP: Used for Available Organs where the organ with the minimum remaining
 *    ischemic shelf life (hours until expiration) is at the root.
 * 
 * Array Indexing Formulas (0-indexed):
 * - Parent(i)      = (i - 1) / 2
 * - LeftChild(i)   = 2 * i + 1
 * - RightChild(i)  = 2 * i + 2
 * 
 * Time Complexities:
 * - Insert: O(log n) via heapify_up
 * - Extract-Top (Max/Min): O(log n) via heapify_down
 * - Peek Top: O(1)
 * - Priority Update: O(n) scan + O(log n) re-heapify
 * - Space Complexity: O(n)
 */

#include "priority_queue.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void swap_nodes(PQNode* a, PQNode* b) {
    PQNode temp = *a;
    *a = *b;
    *b = temp;
}

/**
 * Evaluates whether child has higher priority precedence than parent based on heap type.
 */
static bool has_precedence(const PQNode* a, const PQNode* b, PQType type) {
    if (type == PQ_MAX_HEAP) {
        return a->priority > b->priority;
    } else {
        return a->priority < b->priority;
    }
}

PriorityQueue* pq_create(int capacity, PQType type) {
    if (capacity <= 0) capacity = 64;
    PriorityQueue* pq = (PriorityQueue*)malloc(sizeof(PriorityQueue));
    if (!pq) return NULL;
    
    pq->heap = (PQNode*)malloc(sizeof(PQNode) * capacity);
    if (!pq->heap) {
        free(pq);
        return NULL;
    }
    
    pq->capacity = capacity;
    pq->size = 0;
    pq->type = type;
    return pq;
}

void pq_free(PriorityQueue* pq) {
    if (!pq) return;
    if (pq->heap) free(pq->heap);
    free(pq);
}

bool pq_is_empty(const PriorityQueue* pq) {
    return (!pq || pq->size == 0);
}

int pq_size(const PriorityQueue* pq) {
    return pq ? pq->size : 0;
}

void pq_heapify_up(PriorityQueue* pq, int index) {
    if (!pq || index <= 0) return;
    int current = index;
    while (current > 0) {
        int parent = (current - 1) / 2;
        if (has_precedence(&pq->heap[current], &pq->heap[parent], pq->type)) {
            swap_nodes(&pq->heap[current], &pq->heap[parent]);
            current = parent;
        } else {
            break;
        }
    }
}

void pq_heapify_down(PriorityQueue* pq, int index) {
    if (!pq || index < 0) return;
    int current = index;
    int size = pq->size;
    
    while (true) {
        int left = 2 * current + 1;
        int right = 2 * current + 2;
        int target = current;
        
        if (left < size && has_precedence(&pq->heap[left], &pq->heap[target], pq->type)) {
            target = left;
        }
        if (right < size && has_precedence(&pq->heap[right], &pq->heap[target], pq->type)) {
            target = right;
        }
        
        if (target != current) {
            swap_nodes(&pq->heap[current], &pq->heap[target]);
            current = target;
        } else {
            break;
        }
    }
}

bool pq_insert(PriorityQueue* pq, const char* id, double priority, const char* label, const char* detail, const char* subtext) {
    if (!pq || !id) return false;
    
    /* Dynamic resizing if capacity is exceeded */
    if (pq->size >= pq->capacity) {
        int new_capacity = pq->capacity * 2;
        PQNode* new_heap = (PQNode*)realloc(pq->heap, sizeof(PQNode) * new_capacity);
        if (!new_heap) return false;
        pq->heap = new_heap;
        pq->capacity = new_capacity;
    }
    
    int index = pq->size;
    strncpy(pq->heap[index].id, id, MAX_ID_LEN - 1);
    pq->heap[index].id[MAX_ID_LEN - 1] = '\0';
    
    pq->heap[index].priority = priority;
    
    if (label) strncpy(pq->heap[index].label, label, MAX_NAME_LEN - 1);
    else pq->heap[index].label[0] = '\0';
    pq->heap[index].label[MAX_NAME_LEN - 1] = '\0';
    
    if (detail) strncpy(pq->heap[index].detail, detail, MAX_HOSPITAL_LEN - 1);
    else pq->heap[index].detail[0] = '\0';
    pq->heap[index].detail[MAX_HOSPITAL_LEN - 1] = '\0';

    if (subtext) strncpy(pq->heap[index].subtext, subtext, MAX_STATUS_LEN - 1);
    else pq->heap[index].subtext[0] = '\0';
    pq->heap[index].subtext[MAX_STATUS_LEN - 1] = '\0';
    
    pq->size++;
    pq_heapify_up(pq, index);
    return true;
}

bool pq_extract_top(PriorityQueue* pq, PQNode* out_node) {
    if (!pq || pq->size == 0) return false;
    
    if (out_node) {
        *out_node = pq->heap[0];
    }
    
    pq->heap[0] = pq->heap[pq->size - 1];
    pq->size--;
    
    if (pq->size > 0) {
        pq_heapify_down(pq, 0);
    }
    return true;
}

bool pq_peek(const PriorityQueue* pq, PQNode* out_node) {
    if (!pq || pq->size == 0) return false;
    if (out_node) {
        *out_node = pq->heap[0];
    }
    return true;
}

bool pq_update_priority(PriorityQueue* pq, const char* id, double new_priority) {
    if (!pq || !id) return false;
    
    int target_idx = -1;
    for (int i = 0; i < pq->size; i++) {
        if (strcmp(pq->heap[i].id, id) == 0) {
            target_idx = i;
            break;
        }
    }
    
    if (target_idx == -1) return false;
    
    double old_priority = pq->heap[target_idx].priority;
    pq->heap[target_idx].priority = new_priority;
    
    /* Re-heapify depending on whether priority increased or decreased */
    if (pq->type == PQ_MAX_HEAP) {
        if (new_priority > old_priority) {
            pq_heapify_up(pq, target_idx);
        } else {
            pq_heapify_down(pq, target_idx);
        }
    } else { /* MIN HEAP */
        if (new_priority < old_priority) {
            pq_heapify_up(pq, target_idx);
        } else {
            pq_heapify_down(pq, target_idx);
        }
    }
    return true;
}

void pq_print(const PriorityQueue* pq) {
    if (!pq) return;
    printf("=== Priority Queue [%s] Size: %d ===\n",
           pq->type == PQ_MAX_HEAP ? "MAX-HEAP" : "MIN-HEAP", pq->size);
    for (int i = 0; i < pq->size; i++) {
        printf(" [%2d] ID: %-10s | Priority: %6.2f | Label: %-16s | Detail: %s\n",
               i, pq->heap[i].id, pq->heap[i].priority, pq->heap[i].label, pq->heap[i].detail);
    }
}
