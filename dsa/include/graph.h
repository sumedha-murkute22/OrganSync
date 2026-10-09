#ifndef GRAPH_H
#define GRAPH_H

#include "models.h"
#include <stdbool.h>

#define MAX_VERTICES 64
#define INF_WEIGHT 999999.0

typedef struct RouteEdge {
    int dest_vertex;
    char dest_name[MAX_HOSPITAL_LEN];
    double distance_km;
    double travel_time_mins;
    char transport_mode[32];   /* Air Ambulance, Medical Jet, Ground Unit, Autonomous Drone */
    bool is_available;
    struct RouteEdge* next;
} RouteEdge;

typedef struct {
    char name[MAX_HOSPITAL_LEN];
    char city[MAX_NAME_LEN];
    double latitude;
    double longitude;
    char facility_type[32];    /* Transplant Center, Procurement Hub, Airport Hub */
    RouteEdge* head;
} Vertex;

typedef struct {
    Vertex vertices[MAX_VERTICES];
    int num_vertices;
} TransportGraph;

/* Shortest Path Result */
typedef struct {
    double total_time_mins;
    double total_distance_km;
    int path[MAX_VERTICES];
    int path_length;
    bool is_reachable;
} ShortestPathResult;

/* Bipartite Compatibility Graph */
typedef struct BipartiteEdge {
    char organ_id[MAX_ID_LEN];
    char recipient_id[MAX_ID_LEN];
    double compatibility_score;
    bool is_eligible;
    char status[32];
    struct BipartiteEdge* next;
} BipartiteEdge;

typedef struct {
    BipartiteEdge* edges;
    int edge_count;
    int organ_count;
    int recipient_count;
} CompatibilityGraph;

/* Transport Network Functions */
TransportGraph* graph_create(void);
void graph_free(TransportGraph* g);
int graph_add_vertex(TransportGraph* g, const char* name, const char* city, double lat, double lon, const char* type);
int graph_find_vertex(const TransportGraph* g, const char* name);
bool graph_add_edge(TransportGraph* g, const char* src, const char* dest, double dist_km, double time_mins, const char* mode, bool available);
ShortestPathResult graph_dijkstra(const TransportGraph* g, const char* src, const char* dest);

/* Compatibility Graph Functions */
CompatibilityGraph* comp_graph_create(void);
void comp_graph_free(CompatibilityGraph* cg);
bool comp_graph_add_edge(CompatibilityGraph* cg, const char* organ_id, const char* recipient_id, double score, bool is_eligible, const char* status);

#endif /* GRAPH_H */
