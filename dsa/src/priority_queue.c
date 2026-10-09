/**
 * OrganSync - Priority Queue (Binary Heap) Implementation
 * 
 * Supports Max-Heap (for urgency ranking) and Min-Heap (for organ shelf-life urgency).
 * Includes clinically approved tie-breaking by waitlist seniority.
 */

#include "../include/priority_queue.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

#define EPSILON 0.0001

static bool should_swap(const PQNode* parent, const PQNode* child, HeapType type) {
    if (type == PQ_MAX_HEAP) {
        if (child->priority > parent->priority + EPSILON) return true;
        /* Tie-break rule: if priority scores are essentially identical, break tie by secondary factor */
        if (fabs(child->priority - parent->priority) <= EPSILON) {
            return child->secondary_tie_break > parent->secondary_tie_break;
        }
        return false;
    } else { /* PQ_MIN_HEAP */
        if (child->priority < parent->priority - EPSILON) return true;
        if (fabs(child->priority - parent->priority) <= EPSILON) {
            return child->secondary_tie_break < parent->secondary_tie_break;
        }
        return false;
    }
}

PriorityQueue* pq_create(int initial_capacity, HeapType type) {
    if (initial_capacity <= 0) initial_capacity = 32;
    PriorityQueue* pq = (PriorityQueue*)malloc(sizeof(PriorityQueue));
    if (!pq) return NULL;
    
    pq->heap = (PQNode*)malloc(sizeof(PQNode) * initial_capacity);
    if (!pq->heap) {
        free(pq);
        return NULL;
    }
    
    pq->capacity = initial_capacity;
    pq->size = 0;
    pq->type = type;
    return pq;
}

void pq_free(PriorityQueue* pq) {
    if (!pq) return;
    if (pq->heap) {
        free(pq->heap);
    }
    free(pq);
}

static void sift_up(PriorityQueue* pq, int idx) {
    while (idx > 0) {
        int parent = (idx - 1) / 2;
        if (should_swap(&pq->heap[parent], &pq->heap[idx], pq->type)) {
            PQNode temp = pq->heap[parent];
            pq->heap[parent] = pq->heap[idx];
            pq->heap[idx] = temp;
            idx = parent;
        } else {
            break;
        }
    }
}

static void sift_down(PriorityQueue* pq, int idx) {
    while (idx * 2 + 1 < pq->size) {
        int left = idx * 2 + 1;
        int right = idx * 2 + 2;
        int target = idx;
        
        if (left < pq->size && should_swap(&pq->heap[target], &pq->heap[left], pq->type)) {
            target = left;
        }
        if (right < pq->size && should_swap(&pq->heap[target], &pq->heap[right], pq->type)) {
            target = right;
        }
        
        if (target != idx) {
            PQNode temp = pq->heap[idx];
            pq->heap[idx] = pq->heap[target];
            pq->heap[target] = temp;
            idx = target;
        } else {
            break;
        }
    }
}

bool pq_insert(PriorityQueue* pq, const char* id, double priority, double tie_break, const char* label, const char* facility, const char* meta) {
    if (!pq || !id) return false;
    
    if (pq->size >= pq->capacity) {
        int new_capacity = pq->capacity * 2;
        PQNode* new_heap = (PQNode*)realloc(pq->heap, sizeof(PQNode) * new_capacity);
        if (!new_heap) return false;
        pq->heap = new_heap;
        pq->capacity = new_capacity;
    }
    
    PQNode node;
    strncpy(node.id, id, MAX_PQ_ID_LEN - 1);
    node.id[MAX_PQ_ID_LEN - 1] = '\0';
    node.priority = priority;
    node.secondary_tie_break = tie_break;
    
    if (label) {
        strncpy(node.label, label, MAX_PQ_LABEL_LEN - 1);
        node.label[MAX_PQ_LABEL_LEN - 1] = '\0';
    } else {
        node.label[0] = '\0';
    }
    
    if (facility) {
        strncpy(node.facility, facility, MAX_PQ_LABEL_LEN - 1);
        node.facility[MAX_PQ_LABEL_LEN - 1] = '\0';
    } else {
        node.facility[0] = '\0';
    }
    
    if (meta) {
        strncpy(node.metadata, meta, 127);
        node.metadata[127] = '\0';
    } else {
        node.metadata[0] = '\0';
    }
    
    int idx = pq->size++;
    pq->heap[idx] = node;
    sift_up(pq, idx);
    return true;
}

bool pq_extract_top(PriorityQueue* pq, PQNode* out_node) {
    if (!pq || pq->size == 0) return false;
    
    if (out_node) {
        *out_node = pq->heap[0];
    }
    
    pq->heap[0] = pq->heap[--pq->size];
    if (pq->size > 0) {
        sift_down(pq, 0);
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

bool pq_update_priority(PriorityQueue* pq, const char* id, double new_priority, double new_tie_break) {
    if (!pq || !id) return false;
    
    for (int i = 0; i < pq->size; i++) {
        if (strcmp(pq->heap[i].id, id) == 0) {
            double old_priority = pq->heap[i].priority;
            pq->heap[i].priority = new_priority;
            pq->heap[i].secondary_tie_break = new_tie_break;
            
            if (should_swap(&(PQNode){.priority = old_priority}, &pq->heap[i], pq->type)) {
                sift_up(pq, i);
            } else {
                sift_down(pq, i);
            }
            return true;
        }
    }
    return false;
}

bool pq_is_empty(const PriorityQueue* pq) {
    if (!pq) return true;
    return pq->size == 0;
}

int pq_size(const PriorityQueue* pq) {
    if (!pq) return 0;
    return pq->size;
}
