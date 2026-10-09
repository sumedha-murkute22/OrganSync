/**
 * OrganSync - JSON Input / Output Utilities
 * 
 * Provides robust lightweight JSON deserialization for Organ and Recipient datasets,
 * and structured JSON serialization for matches, graphs, and priority queues.
 */

#include "json_io.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

static char* read_entire_file(const char* filepath) {
    FILE* f = fopen(filepath, "rb");
    if (!f) {
        fprintf(stderr, "Error: Could not open file: %s\n", filepath);
        return NULL;
    }
    fseek(f, 0, SEEK_END);
    long length = ftell(f);
    fseek(f, 0, SEEK_SET);
    
    char* buffer = (char*)malloc(length + 1);
    if (!buffer) {
        fclose(f);
        return NULL;
    }
    
    size_t read_bytes = fread(buffer, 1, length, f);
    buffer[read_bytes] = '\0';
    fclose(f);
    return buffer;
}

static const char* extract_json_string(const char* obj_start, const char* key, char* dest, int dest_len) {
    dest[0] = '\0';
    char search_key[128];
    snprintf(search_key, sizeof(search_key), "\"%s\"", key);
    
    const char* pos = strstr(obj_start, search_key);
    if (!pos) return NULL;
    
    pos = strchr(pos, ':');
    if (!pos) return NULL;
    
    /* Find opening quote */
    pos = strchr(pos, '\"');
    if (!pos) return NULL;
    pos++; /* skip opening quote */
    
    int idx = 0;
    while (*pos && *pos != '\"' && idx < dest_len - 1) {
        dest[idx++] = *pos++;
    }
    dest[idx] = '\0';
    return pos;
}

static double extract_json_number(const char* obj_start, const char* key, double default_val) {
    char search_key[128];
    snprintf(search_key, sizeof(search_key), "\"%s\"", key);
    
    const char* pos = strstr(obj_start, search_key);
    if (!pos) return default_val;
    
    pos = strchr(pos, ':');
    if (!pos) return default_val;
    pos++;
    
    while (*pos && (*pos == ' ' || *pos == '\t' || *pos == '\r' || *pos == '\n')) pos++;
    
    char num_buf[64];
    int idx = 0;
    while (*pos && (isdigit((unsigned char)*pos) || *pos == '.' || *pos == '-')) {
        if (idx < 63) num_buf[idx++] = *pos;
        pos++;
    }
    num_buf[idx] = '\0';
    
    if (idx > 0) return atof(num_buf);
    return default_val;
}

int load_organs_from_json_file(const char* filepath, Organ* organs_out, int max_capacity) {
    char* content = read_entire_file(filepath);
    if (!content) return 0;
    
    int count = 0;
    const char* ptr = content;
    
    while ((ptr = strchr(ptr, '{')) != NULL && count < max_capacity) {
        const char* obj_end = strchr(ptr, '}');
        if (!obj_end) break;
        
        Organ* org = &organs_out[count];
        memset(org, 0, sizeof(Organ));
        
        extract_json_string(ptr, "id", org->id, sizeof(org->id));
        extract_json_string(ptr, "organ_type", org->organ_type, sizeof(org->organ_type));
        extract_json_string(ptr, "donor_id", org->donor_id, sizeof(org->donor_id));
        extract_json_string(ptr, "blood_group", org->blood_group, sizeof(org->blood_group));
        org->hla_score = (int)extract_json_number(ptr, "hla_score", 80);
        extract_json_string(ptr, "donation_time", org->donation_time, sizeof(org->donation_time));
        org->shelf_life_hours = extract_json_number(ptr, "shelf_life_hours", 12.0);
        extract_json_string(ptr, "hospital", org->hospital, sizeof(org->hospital));
        extract_json_string(ptr, "city", org->city, sizeof(org->city));
        org->latitude = extract_json_number(ptr, "latitude", 42.36);
        org->longitude = extract_json_number(ptr, "longitude", -71.06);
        extract_json_string(ptr, "transport_status", org->transport_status, sizeof(org->transport_status));
        extract_json_string(ptr, "availability", org->availability, sizeof(org->availability));
        
        if (strlen(org->availability) == 0) {
            strncpy(org->availability, "Available", sizeof(org->availability) - 1);
        }
        
        if (strlen(org->id) > 0) {
            count++;
        }
        
        ptr = obj_end + 1;
    }
    
    free(content);
    return count;
}

int load_recipients_from_json_file(const char* filepath, Recipient* recipients_out, int max_capacity) {
    char* content = read_entire_file(filepath);
    if (!content) return 0;
    
    int count = 0;
    const char* ptr = content;
    
    while ((ptr = strchr(ptr, '{')) != NULL && count < max_capacity) {
        const char* obj_end = strchr(ptr, '}');
        if (!obj_end) break;
        
        Recipient* rec = &recipients_out[count];
        memset(rec, 0, sizeof(Recipient));
        
        extract_json_string(ptr, "id", rec->id, sizeof(rec->id));
        extract_json_string(ptr, "name", rec->name, sizeof(rec->name));
        extract_json_string(ptr, "required_organ", rec->required_organ, sizeof(rec->required_organ));
        extract_json_string(ptr, "blood_group", rec->blood_group, sizeof(rec->blood_group));
        rec->hla_requirement = (int)extract_json_number(ptr, "hla_requirement", 80);
        extract_json_string(ptr, "urgency", rec->urgency_str, sizeof(rec->urgency_str));
        rec->urgency = parse_urgency(rec->urgency_str);
        rec->waiting_time_days = (int)extract_json_number(ptr, "waiting_time_days", 180);
        extract_json_string(ptr, "hospital", rec->hospital, sizeof(rec->hospital));
        extract_json_string(ptr, "city", rec->city, sizeof(rec->city));
        rec->latitude = extract_json_number(ptr, "latitude", 42.36);
        rec->longitude = extract_json_number(ptr, "longitude", -71.06);
        extract_json_string(ptr, "status", rec->status, sizeof(rec->status));
        
        if (strlen(rec->status) == 0) {
            strncpy(rec->status, "Waiting", sizeof(rec->status) - 1);
        }
        
        if (strlen(rec->id) > 0) {
            count++;
        }
        
        ptr = obj_end + 1;
    }
    
    free(content);
    return count;
}

void write_allocation_plan_json(FILE* out, const AllocationPlan* plan) {
    if (!out || !plan) return;
    
    fprintf(out, "{\n");
    fprintf(out, "  \"match_count\": %d,\n", plan->match_count);
    fprintf(out, "  \"unassigned_organs\": %d,\n", plan->unassigned_organs);
    fprintf(out, "  \"unassigned_recipients\": %d,\n", plan->unassigned_recipients);
    fprintf(out, "  \"average_score\": %.2f,\n", plan->average_score);
    fprintf(out, "  \"execution_timestamp\": \"%s\",\n", plan->execution_timestamp);
    fprintf(out, "  \"algorithm\": \"Greedy Shelf-Life Urgency Priority Matching in C\",\n");
    fprintf(out, "  \"matches\": [\n");
    
    for (int i = 0; i < plan->match_count; i++) {
        const MatchResult* m = &plan->matches[i];
        fprintf(out, "    {\n");
        fprintf(out, "      \"match_id\": \"MTR-%03d\",\n", i + 1);
        fprintf(out, "      \"organ_id\": \"%s\",\n", m->organ_id);
        fprintf(out, "      \"recipient_id\": \"%s\",\n", m->recipient_id);
        fprintf(out, "      \"organ_type\": \"%s\",\n", m->organ_type);
        fprintf(out, "      \"donor_id\": \"%s\",\n", m->donor_id);
        fprintf(out, "      \"recipient_name\": \"%s\",\n", m->recipient_name);
        fprintf(out, "      \"donor_blood\": \"%s\",\n", m->donor_blood);
        fprintf(out, "      \"recipient_blood\": \"%s\",\n", m->recipient_blood);
        fprintf(out, "      \"total_score\": %.2f,\n", m->total_score);
        fprintf(out, "      \"score_breakdown\": {\n");
        fprintf(out, "        \"blood_score\": %.1f,\n", m->blood_compatibility_score);
        fprintf(out, "        \"hla_score\": %.1f,\n", m->hla_score);
        fprintf(out, "        \"urgency_score\": %.1f,\n", m->urgency_score);
        fprintf(out, "        \"wait_time_score\": %.1f,\n", m->waiting_time_score);
        fprintf(out, "        \"distance_score\": %.1f\n", m->distance_viability_score);
        fprintf(out, "      },\n");
        fprintf(out, "      \"shelf_life_hours\": %.1f,\n", m->shelf_life_hours);
        fprintf(out, "      \"distance_km\": %.1f,\n", m->distance_km);
        fprintf(out, "      \"donor_hospital\": \"%s\",\n", m->donor_hospital);
        fprintf(out, "      \"recipient_hospital\": \"%s\",\n", m->recipient_hospital);
        fprintf(out, "      \"reason\": \"%s\"\n", m->reason);
        fprintf(out, "    }%s\n", (i == plan->match_count - 1) ? "" : ",");
    }
    
    fprintf(out, "  ]\n");
    fprintf(out, "}\n");
}

void write_graph_json(FILE* out, const BipartiteGraph* g) {
    if (!out || !g) return;
    
    fprintf(out, "{\n");
    fprintf(out, "  \"organ_count\": %d,\n", g->organ_count);
    fprintf(out, "  \"recipient_count\": %d,\n", g->recipient_count);
    fprintf(out, "  \"total_edges\": %d,\n", g->total_edges);
    
    /* Organs Partition */
    fprintf(out, "  \"organs\": [\n");
    for (int i = 0; i < g->organ_count; i++) {
        fprintf(out, "    {\"id\": \"%s\", \"type\": \"%s\", \"blood\": \"%s\", \"shelf_life\": %.1f, \"hospital\": \"%s\"}%s\n",
                g->organs[i].id, g->organs[i].organ_type, g->organs[i].blood_group,
                g->organs[i].shelf_life_hours, g->organs[i].hospital,
                (i == g->organ_count - 1) ? "" : ",");
    }
    fprintf(out, "  ],\n");
    
    /* Recipients Partition */
    fprintf(out, "  \"recipients\": [\n");
    for (int j = 0; j < g->recipient_count; j++) {
        fprintf(out, "    {\"id\": \"%s\", \"name\": \"%s\", \"type\": \"%s\", \"blood\": \"%s\", \"urgency\": \"%s\", \"wait_days\": %d}%s\n",
                g->recipients[j].id, g->recipients[j].name, g->recipients[j].required_organ,
                g->recipients[j].blood_group, g->recipients[j].urgency_str,
                g->recipients[j].waiting_time_days,
                (j == g->recipient_count - 1) ? "" : ",");
    }
    fprintf(out, "  ],\n");
    
    /* Edges */
    fprintf(out, "  \"edges\": [\n");
    int edge_idx = 0;
    for (int i = 0; i < g->organ_count; i++) {
        GraphEdge* edge = g->adj_lists[i];
        while (edge) {
            fprintf(out, "    {\"from_organ\": \"%s\", \"to_recipient\": \"%s\", \"weight\": %.1f, \"reason\": \"%s\"}%s\n",
                    g->organs[i].id, edge->recipient_id, edge->weight, edge->reason,
                    (edge_idx == g->total_edges - 1) ? "" : ",");
            edge_idx++;
            edge = edge->next;
        }
    }
    fprintf(out, "  ]\n");
    fprintf(out, "}\n");
}

void write_priority_queues_json(FILE* out, const PriorityQueue* rec_pq, const PriorityQueue* organ_pq) {
    if (!out) return;
    
    fprintf(out, "{\n");
    
    /* Recipient Max-Heap */
    fprintf(out, "  \"recipient_max_heap\": {\n");
    fprintf(out, "    \"type\": \"MAX-HEAP\",\n");
    fprintf(out, "    \"size\": %d,\n", rec_pq ? rec_pq->size : 0);
    fprintf(out, "    \"elements\": [\n");
    if (rec_pq) {
        for (int i = 0; i < rec_pq->size; i++) {
            fprintf(out, "      {\"index\": %d, \"id\": \"%s\", \"priority\": %.2f, \"label\": \"%s\", \"detail\": \"%s\", \"subtext\": \"%s\"}%s\n",
                    i, rec_pq->heap[i].id, rec_pq->heap[i].priority, rec_pq->heap[i].label,
                    rec_pq->heap[i].detail, rec_pq->heap[i].subtext,
                    (i == rec_pq->size - 1) ? "" : ",");
        }
    }
    fprintf(out, "    ]\n");
    fprintf(out, "  },\n");
    
    /* Organ Min-Heap */
    fprintf(out, "  \"organ_min_heap\": {\n");
    fprintf(out, "    \"type\": \"MIN-HEAP\",\n");
    fprintf(out, "    \"size\": %d,\n", organ_pq ? organ_pq->size : 0);
    fprintf(out, "    \"elements\": [\n");
    if (organ_pq) {
        for (int i = 0; i < organ_pq->size; i++) {
            fprintf(out, "      {\"index\": %d, \"id\": \"%s\", \"priority\": %.2f, \"label\": \"%s\", \"detail\": \"%s\", \"subtext\": \"%s\"}%s\n",
                    i, organ_pq->heap[i].id, organ_pq->heap[i].priority, organ_pq->heap[i].label,
                    organ_pq->heap[i].detail, organ_pq->heap[i].subtext,
                    (i == organ_pq->size - 1) ? "" : ",");
        }
    }
    fprintf(out, "    ]\n");
    fprintf(out, "  }\n");
    
    fprintf(out, "}\n");
}
