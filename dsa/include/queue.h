#ifndef QUEUE_H
#define QUEUE_H

#include <stdbool.h>

#define MAX_QUEUE_STR 128

typedef struct {
    char task_id[64];
    char transport_id[64];
    char organ_id[64];
    char recipient_id[64];
    char source_hospital[128];
    char dest_hospital[128];
    char priority[32];          /* Tier 1 Critical, Tier 2 Urgent, Tier 3 Standard */
    char status[48];            /* Pending Dispatch, En Route, Handover Scheduled */
    char enqueued_at[64];
    int estimated_minutes;
} TransportTask;

typedef struct QueueNode {
    TransportTask task;
    struct QueueNode* next;
} QueueNode;

typedef struct {
    QueueNode* front;
    QueueNode* rear;
    int size;
} Queue;

Queue* queue_create(void);
void queue_free(Queue* q);
bool queue_enqueue(Queue* q, const TransportTask* task);
bool queue_dequeue(Queue* q, TransportTask* out_task);
bool queue_peek(const Queue* q, TransportTask* out_task);
bool queue_is_empty(const Queue* q);
int queue_size(const Queue* q);

#endif /* QUEUE_H */
