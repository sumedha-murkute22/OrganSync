/**
 * OrganSync - Transplant Processing FIFO Queue Implementation
 * 
 * DSA CONCEPT:
 * A First-In, First-Out (FIFO) Circular Queue buffers and synchronizes
 * transplant logistics operations as matches are confirmed.
 * 
 * Clinical Workflow Stages:
 * STAGE 1: Match Accepted       (Both donor hospital & recipient transplant team confirm)
 * STAGE 2: Transport Scheduled  (Flight/Ambulance dispatch, organ perfusion box prepared)
 * STAGE 3: In Transit           (Organ is en route under temperature-controlled monitoring)
 * STAGE 4: Transplant Ready     (Organ arrived at destination OR, surgical team ready)
 * STAGE 5: Completed            (Anastomosis finished, graft reperfused)
 * 
 * Time Complexities:
 * - Enqueue: O(1)
 * - Dequeue: O(1)
 * - Peek: O(1)
 * - Status Advance: O(k) where k is current active queue length
 * - Space Complexity: O(N) bounded by circular buffer capacity
 */

#include "queue.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

Queue* q_create(int capacity) {
    if (capacity <= 0) capacity = DEFAULT_QUEUE_CAPACITY;
    Queue* q = (Queue*)malloc(sizeof(Queue));
    if (!q) return NULL;
    
    q->items = (QueueItem*)malloc(sizeof(QueueItem) * capacity);
    if (!q->items) {
        free(q);
        return NULL;
    }
    
    q->capacity = capacity;
    q->front = 0;
    q->rear = -1;
    q->count = 0;
    return q;
}

void q_free(Queue* q) {
    if (!q) return;
    if (q->items) free(q->items);
    free(q);
}

bool q_is_empty(const Queue* q) {
    return (!q || q->count == 0);
}

bool q_is_full(const Queue* q) {
    return (q && q->count >= q->capacity);
}

int q_size(const Queue* q) {
    return q ? q->count : 0;
}

bool q_enqueue(Queue* q, const QueueItem* item) {
    if (!q || !item || q_is_full(q)) return false;
    
    q->rear = (q->rear + 1) % q->capacity;
    q->items[q->rear] = *item;
    
    /* Ensure stage and status string are consistent */
    if (q->items[q->rear].stage == 0) {
        q->items[q->rear].stage = STAGE_MATCH_ACCEPTED;
    }
    strncpy(q->items[q->rear].status_str, stage_to_str(q->items[q->rear].stage), MAX_STATUS_LEN - 1);
    q->items[q->rear].status_str[MAX_STATUS_LEN - 1] = '\0';
    
    q->count++;
    return true;
}

bool q_dequeue(Queue* q, QueueItem* out_item) {
    if (!q || q_is_empty(q)) return false;
    
    if (out_item) {
        *out_item = q->items[q->front];
    }
    
    q->front = (q->front + 1) % q->capacity;
    q->count--;
    return true;
}

bool q_peek(const Queue* q, QueueItem* out_item) {
    if (!q || q_is_empty(q)) return false;
    if (out_item) {
        *out_item = q->items[q->front];
    }
    return true;
}

QueueItem* q_get_at(Queue* q, int logical_index) {
    if (!q || logical_index < 0 || logical_index >= q->count) return NULL;
    int actual_idx = (q->front + logical_index) % q->capacity;
    return &q->items[actual_idx];
}

QueueItem* q_find_by_match_id(Queue* q, const char* match_id) {
    if (!q || !match_id) return NULL;
    for (int i = 0; i < q->count; i++) {
        int idx = (q->front + i) % q->capacity;
        if (strcmp(q->items[idx].match_id, match_id) == 0) {
            return &q->items[idx];
        }
    }
    return NULL;
}

/**
 * Advances a match forward through the clinical pipeline:
 * STAGE_MATCH_ACCEPTED (1) -> STAGE_TRANSPORT_SCHEDULED (2)
 * -> STAGE_IN_TRANSIT (3) -> STAGE_TRANSPLANT_READY (4) -> STAGE_COMPLETED (5)
 */
bool q_advance_status(Queue* q, const char* match_id) {
    QueueItem* item = q_find_by_match_id(q, match_id);
    if (!item) return false;
    
    if (item->stage < STAGE_COMPLETED) {
        item->stage = (ProcessingStage)(item->stage + 1);
        strncpy(item->status_str, stage_to_str(item->stage), MAX_STATUS_LEN - 1);
        item->status_str[MAX_STATUS_LEN - 1] = '\0';
        
        /* Update status notes */
        switch (item->stage) {
            case STAGE_TRANSPORT_SCHEDULED:
                snprintf(item->notes, sizeof(item->notes), "Vehicle %s assigned. Route optimized.", item->courier_vehicle);
                item->eta_minutes = 90;
                break;
            case STAGE_IN_TRANSIT:
                snprintf(item->notes, sizeof(item->notes), "In transit with continuous perfusion monitoring.");
                item->eta_minutes = 35;
                break;
            case STAGE_TRANSPLANT_READY:
                snprintf(item->notes, sizeof(item->notes), "Graft arrived at destination OR. Reperfusion pending.");
                item->eta_minutes = 0;
                break;
            case STAGE_COMPLETED:
                snprintf(item->notes, sizeof(item->notes), "Transplantation procedure successfully concluded.");
                item->eta_minutes = 0;
                break;
            default:
                break;
        }
        return true;
    }
    return false;
}

void q_print(const Queue* q) {
    if (!q) return;
    printf("=== Transplant Processing Queue [Count: %d] ===\n", q->count);
    for (int i = 0; i < q->count; i++) {
        int idx = (q->front + i) % q->capacity;
        printf(" [%d] Match: %s | Organ: %s | Patient: %-16s | Status: %-20s | ETA: %d min\n",
               i, q->items[idx].match_id, q->items[idx].organ_type,
               q->items[idx].recipient_name, q->items[idx].status_str,
               q->items[idx].eta_minutes);
    }
}
