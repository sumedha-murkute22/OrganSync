/**
 * OrganSync - Weighted Bipartite Compatibility Graph Implementation
 * 
 * DSA CONCEPT & DESIGN DECISION:
 * A Bipartite Graph G = (U, V, E) divides vertices into two disjoint sets:
 * - Partition U: Available Donated Organs (u_1, u_2, ..., u_m)
 * - Partition V: Waiting Recipients (v_1, v_2, ..., v_n)
 * 
 * Edge Constraint:
 * An undirected/directed weighted edge (u, v) exists IF AND ONLY IF:
 * 1. Organ type matches identically: organ.type == recipient.required_organ
 * 2. ABO & Rh blood groups are compatible: is_blood_compatible(donor, recipient) == true
 * The edge weight stores the multi-factor Compatibility Score (0.0 to 100.0).
 * 
 * WHY ADJACENCY LIST OVER ADJACENCY MATRIX?
 * 1. Extreme Graph Sparsity: In clinical reality, cross-organ compatibility is 0
 *    (e.g., Kidney cannot match with Heart, eliminating ~80% of pairs immediately).
 *    Furthermore, ABO blood incompatibility filters out ~50-70% of the remainder.
 *    Hence, the number of edges |E| << |U| * |V|.
 * 2. Memory Efficiency:
 *    - Adjacency Matrix: O(|U| * |V|) space regardless of sparsity.
 *    - Adjacency List: O(|U| + |E|) space, only storing medically viable pairs.
 * 3. Algorithmic Traversal Speed:
 *    When matching organ u, iterating over its compatible recipients takes O(deg(u))
 *    rather than scanning all |V| elements in a sparse matrix row.
 */

#include "graph.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <math.h>

/* Case-insensitive string comparison helper */
static bool equals_ignore_case(const char* a, const char* b) {
    if (!a || !b) return false;
    while (*a && *b) {
        if (tolower((unsigned char)*a) != tolower((unsigned char)*b)) return false;
        a++;
        b++;
    }
    return *a == *b;
}

BipartiteGraph* graph_create(int organ_count, int recipient_count) {
    if (organ_count <= 0 || recipient_count <= 0) return NULL;
    
    BipartiteGraph* g = (BipartiteGraph*)malloc(sizeof(BipartiteGraph));
    if (!g) return NULL;
    
    g->organ_count = organ_count;
    g->recipient_count = recipient_count;
    g->total_edges = 0;
    
    g->organs = (Organ*)calloc(organ_count, sizeof(Organ));
    g->recipients = (Recipient*)calloc(recipient_count, sizeof(Recipient));
    g->adj_lists = (GraphEdge**)calloc(organ_count, sizeof(GraphEdge*));
    
    if (!g->organs || !g->recipients || !g->adj_lists) {
        graph_free(g);
        return NULL;
    }
    
    return g;
}

void graph_free(BipartiteGraph* g) {
    if (!g) return;
    
    if (g->adj_lists) {
        for (int i = 0; i < g->organ_count; i++) {
            GraphEdge* current = g->adj_lists[i];
            while (current) {
                GraphEdge* temp = current;
                current = current->next;
                free(temp);
            }
        }
        free(g->adj_lists);
    }
    
    if (g->organs) free(g->organs);
    if (g->recipients) free(g->recipients);
    free(g);
}

void graph_set_organ(BipartiteGraph* g, int index, const Organ* organ) {
    if (!g || index < 0 || index >= g->organ_count || !organ) return;
    g->organs[index] = *organ;
}

void graph_set_recipient(BipartiteGraph* g, int index, const Recipient* recipient) {
    if (!g || index < 0 || index >= g->recipient_count || !recipient) return;
    g->recipients[index] = *recipient;
}

bool graph_add_edge(BipartiteGraph* g, int organ_idx, int recipient_idx, double weight, const char* reason) {
    if (!g || organ_idx < 0 || organ_idx >= g->organ_count || recipient_idx < 0 || recipient_idx >= g->recipient_count) {
        return false;
    }
    
    GraphEdge* new_edge = (GraphEdge*)malloc(sizeof(GraphEdge));
    if (!new_edge) return false;
    
    new_edge->recipient_index = recipient_idx;
    strncpy(new_edge->recipient_id, g->recipients[recipient_idx].id, MAX_ID_LEN - 1);
    new_edge->recipient_id[MAX_ID_LEN - 1] = '\0';
    new_edge->weight = weight;
    
    if (reason) {
        strncpy(new_edge->reason, reason, MAX_REASON_LEN - 1);
        new_edge->reason[MAX_REASON_LEN - 1] = '\0';
    } else {
        new_edge->reason[0] = '\0';
    }
    
    /* Prepend to adjacency list of organ (O(1)) */
    new_edge->next = g->adj_lists[organ_idx];
    g->adj_lists[organ_idx] = new_edge;
    g->total_edges++;
    
    return true;
}

/**
 * Builds all valid compatibility edges between partition U (Organs) and partition V (Recipients).
 * An edge is strictly formed only if organ types match and blood groups are compatible.
 */
int graph_build_compatibility_edges(BipartiteGraph* g) {
    if (!g) return 0;
    
    int edges_added = 0;
    
    for (int i = 0; i < g->organ_count; i++) {
        const Organ* organ = &g->organs[i];
        
        /* Skip if organ is already expired or allocated */
        if (strcmp(organ->availability, "Available") != 0) {
            continue;
        }
        
        for (int j = 0; j < g->recipient_count; j++) {
            const Recipient* rec = &g->recipients[j];
            
            /* Rule 1: Organ Type Match */
            if (!equals_ignore_case(organ->organ_type, rec->required_organ)) {
                continue;
            }
            
            /* Rule 2: Blood Compatibility */
            if (!is_blood_compatible(organ->blood_group, rec->blood_group)) {
                continue;
            }
            
            /* Compute preliminary compatibility edge weight (0 - 100) */
            /* 1. Blood match quality: 20 pts (identical gets 20, compatible gets 15) */
            double blood_pts = (strcmp(organ->blood_group, rec->blood_group) == 0) ? 20.0 : 15.0;
            
            /* 2. Tissue / HLA match: 25 pts */
            int hla_diff = abs(organ->hla_score - rec->hla_requirement);
            double hla_pts = 25.0 * (1.0 - ((double)hla_diff / 100.0));
            if (hla_pts < 0.0) hla_pts = 0.0;
            
            /* 3. Patient Urgency: 25 pts */
            double urgency_pts = 0.0;
            if (rec->urgency == URGENCY_CRITICAL) urgency_pts = 25.0;
            else if (rec->urgency == URGENCY_HIGH) urgency_pts = 18.0;
            else if (rec->urgency == URGENCY_MEDIUM) urgency_pts = 12.0;
            else urgency_pts = 5.0;
            
            /* 4. Wait time seniority: 15 pts (maxed at 2 years / 730 days) */
            double wait_ratio = (double)rec->waiting_time_days / 730.0;
            if (wait_ratio > 1.0) wait_ratio = 1.0;
            double wait_pts = 15.0 * wait_ratio;
            
            /* 5. Distance viability: 15 pts */
            double dist_km = calculate_haversine_distance(organ->latitude, organ->longitude, rec->latitude, rec->longitude);
            double dist_pts = 15.0;
            if (dist_km > 500.0) dist_pts = 5.0;
            else if (dist_km > 200.0) dist_pts = 9.0;
            else if (dist_km > 50.0) dist_pts = 12.0;
            
            double total_weight = blood_pts + hla_pts + urgency_pts + wait_pts + dist_pts;
            if (total_weight > 100.0) total_weight = 100.0;
            
            char reason_buf[MAX_REASON_LEN];
            snprintf(reason_buf, sizeof(reason_buf),
                     "ABO %s->%s (+%.0f) | HLA diff %d (+%.1f) | %s Urgency (+%.0f) | %dd Wait (+%.1f) | %.0fkm (+%.1f)",
                     organ->blood_group, rec->blood_group, blood_pts,
                     hla_diff, hla_pts,
                     urgency_to_str(rec->urgency), urgency_pts,
                     rec->waiting_time_days, wait_pts,
                     dist_km, dist_pts);
            
            if (graph_add_edge(g, i, j, total_weight, reason_buf)) {
                edges_added++;
            }
        }
    }
    
    return edges_added;
}

void graph_print_summary(const BipartiteGraph* g) {
    if (!g) return;
    printf("=== Bipartite Compatibility Graph Summary ===\n");
    printf("Partition U (Organs)     : %d vertices\n", g->organ_count);
    printf("Partition V (Recipients) : %d vertices\n", g->recipient_count);
    printf("Total Compatible Edges   : %d edges\n", g->total_edges);
    
    for (int i = 0; i < g->organ_count; i++) {
        printf("Organ [%s - %s (%s)]: ", g->organs[i].id, g->organs[i].organ_type, g->organs[i].blood_group);
        GraphEdge* edge = g->adj_lists[i];
        if (!edge) {
            printf("No compatible recipients found.\n");
            continue;
        }
        while (edge) {
            printf("-> %s (Score: %.1f) ", edge->recipient_id, edge->weight);
            edge = edge->next;
        }
        printf("\n");
    }
}
