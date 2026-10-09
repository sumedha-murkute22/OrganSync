/**
 * OrganSync - Graph & Network Logistics Implementation
 * 
 * Implements:
 * 1. Adjacency list representation of transplant hospital network
 * 2. Dijkstra's shortest path algorithm for minimum transport time
 * 3. Bipartite compatibility graph for organ-recipient evaluation
 */

#include "../include/graph.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

TransportGraph* graph_create(void) {
    TransportGraph* g = (TransportGraph*)malloc(sizeof(TransportGraph));
    if (!g) return NULL;
    g->num_vertices = 0;
    for (int i = 0; i < MAX_VERTICES; i++) {
        g->vertices[i].name[0] = '\0';
        g->vertices[i].head = NULL;
    }
    return g;
}

void graph_free(TransportGraph* g) {
    if (!g) return;
    for (int i = 0; i < g->num_vertices; i++) {
        RouteEdge* curr = g->vertices[i].head;
        while (curr) {
            RouteEdge* temp = curr;
            curr = curr->next;
            free(temp);
        }
    }
    free(g);
}

int graph_find_vertex(const TransportGraph* g, const char* name) {
    if (!g || !name) return -1;
    for (int i = 0; i < g->num_vertices; i++) {
        if (strcmp(g->vertices[i].name, name) == 0) {
            return i;
        }
    }
    return -1;
}

int graph_add_vertex(TransportGraph* g, const char* name, const char* city, double lat, double lon, const char* type) {
    if (!g || !name || g->num_vertices >= MAX_VERTICES) return -1;
    
    int existing = graph_find_vertex(g, name);
    if (existing != -1) return existing;
    
    int idx = g->num_vertices++;
    strncpy(g->vertices[idx].name, name, MAX_HOSPITAL_LEN - 1);
    g->vertices[idx].name[MAX_HOSPITAL_LEN - 1] = '\0';
    
    if (city) {
        strncpy(g->vertices[idx].city, city, MAX_NAME_LEN - 1);
        g->vertices[idx].city[MAX_NAME_LEN - 1] = '\0';
    }
    g->vertices[idx].latitude = lat;
    g->vertices[idx].longitude = lon;
    
    if (type) {
        strncpy(g->vertices[idx].facility_type, type, 31);
        g->vertices[idx].facility_type[31] = '\0';
    }
    g->vertices[idx].head = NULL;
    return idx;
}

bool graph_add_edge(TransportGraph* g, const char* src, const char* dest, double dist_km, double time_mins, const char* mode, bool available) {
    if (!g || !src || !dest) return false;
    
    int u = graph_find_vertex(g, src);
    if (u == -1) u = graph_add_vertex(g, src, "Unknown", 0.0, 0.0, "Transplant Center");
    
    int v = graph_find_vertex(g, dest);
    if (v == -1) v = graph_add_vertex(g, dest, "Unknown", 0.0, 0.0, "Transplant Center");
    
    RouteEdge* edge = (RouteEdge*)malloc(sizeof(RouteEdge));
    if (!edge) return false;
    
    edge->dest_vertex = v;
    strncpy(edge->dest_name, dest, MAX_HOSPITAL_LEN - 1);
    edge->dest_name[MAX_HOSPITAL_LEN - 1] = '\0';
    edge->distance_km = dist_km;
    edge->travel_time_mins = time_mins;
    
    if (mode) {
        strncpy(edge->transport_mode, mode, 31);
        edge->transport_mode[31] = '\0';
    } else {
        strcpy(edge->transport_mode, "Ground Unit");
    }
    edge->is_available = available;
    
    edge->next = g->vertices[u].head;
    g->vertices[u].head = edge;
    return true;
}

ShortestPathResult graph_dijkstra(const TransportGraph* g, const char* src, const char* dest) {
    ShortestPathResult result = {
        .total_time_mins = INF_WEIGHT,
        .total_distance_km = 0.0,
        .path_length = 0,
        .is_reachable = false
    };
    
    if (!g || !src || !dest) return result;
    int src_idx = graph_find_vertex(g, src);
    int dest_idx = graph_find_vertex(g, dest);
    
    if (src_idx == -1 || dest_idx == -1) return result;
    if (src_idx == dest_idx) {
        result.total_time_mins = 0.0;
        result.path[0] = src_idx;
        result.path_length = 1;
        result.is_reachable = true;
        return result;
    }
    
    int n = g->num_vertices;
    double dist[MAX_VERTICES];
    double dist_km[MAX_VERTICES];
    int parent[MAX_VERTICES];
    bool visited[MAX_VERTICES];
    
    for (int i = 0; i < n; i++) {
        dist[i] = INF_WEIGHT;
        dist_km[i] = 0.0;
        parent[i] = -1;
        visited[i] = false;
    }
    
    dist[src_idx] = 0.0;
    
    for (int count = 0; count < n; count++) {
        double min_dist = INF_WEIGHT;
        int u = -1;
        
        for (int i = 0; i < n; i++) {
            if (!visited[i] && dist[i] < min_dist) {
                min_dist = dist[i];
                u = i;
            }
        }
        
        if (u == -1 || u == dest_idx) break;
        visited[u] = true;
        
        RouteEdge* edge = g->vertices[u].head;
        while (edge) {
            int v = edge->dest_vertex;
            if (!visited[v] && edge->is_available) {
                double weight = edge->travel_time_mins;
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    dist_km[v] = dist_km[u] + edge->distance_km;
                    parent[v] = u;
                }
            }
            edge = edge->next;
        }
    }
    
    if (dist[dest_idx] < INF_WEIGHT) {
        result.is_reachable = true;
        result.total_time_mins = dist[dest_idx];
        result.total_distance_km = dist_km[dest_idx];
        
        int curr = dest_idx;
        int temp_path[MAX_VERTICES];
        int count = 0;
        while (curr != -1 && count < MAX_VERTICES) {
            temp_path[count++] = curr;
            curr = parent[curr];
        }
        
        for (int i = 0; i < count; i++) {
            result.path[i] = temp_path[count - 1 - i];
        }
        result.path_length = count;
    }
    
    return result;
}

CompatibilityGraph* comp_graph_create(void) {
    CompatibilityGraph* cg = (CompatibilityGraph*)malloc(sizeof(CompatibilityGraph));
    if (!cg) return NULL;
    cg->edges = NULL;
    cg->edge_count = 0;
    cg->organ_count = 0;
    cg->recipient_count = 0;
    return cg;
}

void comp_graph_free(CompatibilityGraph* cg) {
    if (!cg) return;
    BipartiteEdge* curr = cg->edges;
    while (curr) {
        BipartiteEdge* temp = curr;
        curr = curr->next;
        free(temp);
    }
    free(cg);
}

bool comp_graph_add_edge(CompatibilityGraph* cg, const char* organ_id, const char* recipient_id, double score, bool is_eligible, const char* status) {
    if (!cg || !organ_id || !recipient_id) return false;
    
    BipartiteEdge* edge = (BipartiteEdge*)malloc(sizeof(BipartiteEdge));
    if (!edge) return false;
    
    strncpy(edge->organ_id, organ_id, MAX_ID_LEN - 1);
    edge->organ_id[MAX_ID_LEN - 1] = '\0';
    strncpy(edge->recipient_id, recipient_id, MAX_ID_LEN - 1);
    edge->recipient_id[MAX_ID_LEN - 1] = '\0';
    edge->compatibility_score = score;
    edge->is_eligible = is_eligible;
    
    if (status) {
        strncpy(edge->status, status, 31);
        edge->status[31] = '\0';
    } else {
        strcpy(edge->status, "Evaluated");
    }
    
    edge->next = cg->edges;
    cg->edges = edge;
    cg->edge_count++;
    return true;
}
