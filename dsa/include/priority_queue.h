#ifndef PRIORITY_QUEUE_H
#define PRIORITY_QUEUE_H

#include <stdbool.h>

#define MAX_PQ_ID_LEN 64
#define MAX_PQ_LABEL_LEN 128

typedef enum {
    PQ_MAX_HEAP = 1,    /* For recipient urgency & allocation ranking (highest score first) */
    PQ_MIN_HEAP = 2     /* For organ ischemic shelf-life urgency (lowest hours remaining first) */
} HeapType;

typedef struct {
    char id[MAX_PQ_ID_LEN];
    double priority;                /* Primary sorting key */
    double secondary_tie_break;     /* Seniority/waiting-time tie-break (higher is prioritized) */
    char label[MAX_PQ_LABEL_LEN];
    char facility[MAX_PQ_LABEL_LEN];
    char metadata[128];
} PQNode;

typedef struct {
    PQNode* heap;
    int capacity;
    int size;
    HeapType type;
} PriorityQueue;

PriorityQueue* pq_create(int initial_capacity, HeapType type);
void pq_free(PriorityQueue* pq);

bool pq_insert(PriorityQueue* pq, const char* id, double priority, double tie_break, const char* label, const char* facility, const char* meta);
bool pq_extract_top(PriorityQueue* pq, PQNode* out_node);
bool pq_peek(const PriorityQueue* pq, PQNode* out_node);
bool pq_update_priority(PriorityQueue* pq, const char* id, double new_priority, double new_tie_break);
bool pq_is_empty(const PriorityQueue* pq);
int pq_size(const PriorityQueue* pq);

#endif /* PRIORITY_QUEUE_H */
