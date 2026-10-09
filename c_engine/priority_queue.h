#ifndef PRIORITY_QUEUE_H
#define PRIORITY_QUEUE_H

#include "models.h"
#include <stdbool.h>

typedef enum {
    PQ_MAX_HEAP = 1, /* Highest priority value at root (Recipients) */
    PQ_MIN_HEAP = 2  /* Lowest value at root (Expiring Organs with min shelf life) */
} PQType;

typedef struct {
    char id[MAX_ID_LEN];
    double priority;           /* Numerical key used for heap comparison */
    char label[MAX_NAME_LEN];  /* e.g. Patient Name or Organ Type */
    char detail[MAX_HOSPITAL_LEN]; /* Hospital or blood info */
    char subtext[MAX_STATUS_LEN];  /* e.g. "Critical - 412d wait" or "3.5 hrs left" */
} PQNode;

typedef struct {
    PQNode* heap;
    int capacity;
    int size;
    PQType type;
} PriorityQueue;

/* Lifecycle */
PriorityQueue* pq_create(int capacity, PQType type);
void pq_free(PriorityQueue* pq);

/* Core Heap Operations */
bool pq_insert(PriorityQueue* pq, const char* id, double priority, const char* label, const char* detail, const char* subtext);
bool pq_extract_top(PriorityQueue* pq, PQNode* out_node);
bool pq_peek(const PriorityQueue* pq, PQNode* out_node);
bool pq_update_priority(PriorityQueue* pq, const char* id, double new_priority);
bool pq_is_empty(const PriorityQueue* pq);
int pq_size(const PriorityQueue* pq);

/* Internal Heapify Operations */
void pq_heapify_up(PriorityQueue* pq, int index);
void pq_heapify_down(PriorityQueue* pq, int index);

/* Diagnostic Display */
void pq_print(const PriorityQueue* pq);

#endif /* PRIORITY_QUEUE_H */
