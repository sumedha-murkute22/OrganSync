#ifndef QUEUE_H
#define QUEUE_H

#include "models.h"
#include <stdbool.h>

#define DEFAULT_QUEUE_CAPACITY 64

/**
 * Circular FIFO Queue structure for tracking active transplant pipelines.
 */
typedef struct {
    QueueItem* items;
    int capacity;
    int front;
    int rear;
    int count;
} Queue;

/* Lifecycle */
Queue* q_create(int capacity);
void q_free(Queue* q);

/* Core FIFO Operations */
bool q_enqueue(Queue* q, const QueueItem* item);
bool q_dequeue(Queue* q, QueueItem* out_item);
bool q_peek(const Queue* q, QueueItem* out_item);
bool q_is_empty(const Queue* q);
bool q_is_full(const Queue* q);
int q_size(const Queue* q);

/* Workflow Pipeline Status Transitions */
bool q_advance_status(Queue* q, const char* match_id);
QueueItem* q_find_by_match_id(Queue* q, const char* match_id);
QueueItem* q_get_at(Queue* q, int logical_index);

/* Diagnostic Display */
void q_print(const Queue* q);

#endif /* QUEUE_H */
