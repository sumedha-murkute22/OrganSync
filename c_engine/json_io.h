#ifndef JSON_IO_H
#define JSON_IO_H

#include "models.h"
#include "matching.h"
#include "graph.h"
#include "priority_queue.h"
#include <stdio.h>

/* File Loading */
int load_organs_from_json_file(const char* filepath, Organ* organs_out, int max_capacity);
int load_recipients_from_json_file(const char* filepath, Recipient* recipients_out, int max_capacity);

/* JSON Output Serializers */
void write_allocation_plan_json(FILE* out, const AllocationPlan* plan);
void write_graph_json(FILE* out, const BipartiteGraph* g);
void write_priority_queues_json(FILE* out, const PriorityQueue* rec_pq, const PriorityQueue* organ_pq);

#endif /* JSON_IO_H */
