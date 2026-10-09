/**
 * OrganSync - FIFO Queue Implementation
 * 
 * Manages transport coordination tasks, collection requests, and handover operations.
 * Preserves strict FIFO processing order for queue scheduling.
 */

#include "../include/queue.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

Queue* queue_create(void) {
    Queue* q = (Queue*)malloc(sizeof(Queue));
    if (!q) return NULL;
    q->front = NULL;
    q->rear = NULL;
    q->size = 0;
    return q;
}

void queue_free(Queue* q) {
    if (!q) return;
    QueueNode* curr = q->front;
    while (curr) {
        QueueNode* temp = curr;
        curr = curr->next;
        free(temp);
    }
    free(q);
}

bool queue_enqueue(Queue* q, const TransportTask* task) {
    if (!q || !task) return false;
    
    QueueNode* node = (QueueNode*)malloc(sizeof(QueueNode));
    if (!node) return false;
    
    node->task = *task;
    node->next = NULL;
    
    if (q->rear) {
        q->rear->next = node;
    } else {
        q->front = node;
    }
    q->rear = node;
    q->size++;
    return true;
}

bool queue_dequeue(Queue* q, TransportTask* out_task) {
    if (!q || !q->front) return false;
    
    QueueNode* temp = q->front;
    if (out_task) {
        *out_task = temp->task;
    }
    
    q->front = q->front->next;
    if (!q->front) {
        q->rear = NULL;
    }
    
    free(temp);
    q->size--;
    return true;
}

bool queue_peek(const Queue* q, TransportTask* out_task) {
    if (!q || !q->front) return false;
    if (out_task) {
        *out_task = q->front->task;
    }
    return true;
}

bool queue_is_empty(const Queue* q) {
    if (!q) return true;
    return q->size == 0;
}

int queue_size(const Queue* q) {
    if (!q) return 0;
    return q->size;
}
