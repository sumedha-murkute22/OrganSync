#ifndef GRAPH_H
#define GRAPH_H

#include "models.h"
#include <stdbool.h>

typedef struct GraphEdge {
    int recipient_index;
    char recipient_id[MAX_ID_LEN];
    double weight;                   /* Compatibility Score: 0.0 to 100.0 */
    char reason[MAX_REASON_LEN];     /* Scoring justification */
    struct GraphEdge* next;
} GraphEdge;

typedef struct {
    Organ* organs;                   /* Set U (Available Organs) */
    int organ_count;
    Recipient* recipients;           /* Set V (Waiting Patients) */
    int recipient_count;
    GraphEdge** adj_lists;           /* Adjacency list: adj_lists[u] points to compatible recipients */
    int total_edges;
} BipartiteGraph;

/* Lifecycle */
BipartiteGraph* graph_create(int organ_count, int recipient_count);
void graph_free(BipartiteGraph* g);

/* Population */
void graph_set_organ(BipartiteGraph* g, int index, const Organ* organ);
void graph_set_recipient(BipartiteGraph* g, int index, const Recipient* recipient);

/* Edge Construction */
bool graph_add_edge(BipartiteGraph* g, int organ_idx, int recipient_idx, double weight, const char* reason);
int graph_build_compatibility_edges(BipartiteGraph* g);

/* Diagnostics */
void graph_print_summary(const BipartiteGraph* g);

#endif /* GRAPH_H */
