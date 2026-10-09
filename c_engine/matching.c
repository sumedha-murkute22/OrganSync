/**
 * OrganSync - Greedy Matching Algorithm Implementation
 * 
 * ALGORITHM SPECIFICATION:
 * Problem Formulation:
 * Given a set of available organs U = {u_1, ..., u_m} and waiting recipients V = {v_1, ..., v_n},
 * find a matching M subset of U x V such that:
 * 1. Each organ u is assigned to at most one recipient v.
 * 2. Each recipient v is assigned to at most one organ u.
 * 3. Only medically compatible pairs are matched:
 *    organ_type(u) == required_organ(v) AND is_blood_compatible(u.blood, v.blood) == true.
 * 4. Priority Rule: Organs with shorter remaining ischemic shelf life are allocated first
 *    to prevent organ discard and ischemic damage.
 * 5. Optimal Recipient Selection: For each organ, we select the unassigned compatible recipient
 *    maximizing the multi-factor Compatibility Score (0 to 100).
 * 
 * SCORING FORMULA (0 - 100 points):
 * 1. Blood Group Compatibility (20 pts max):
 *    - Identical blood group: 20 pts
 *    - Medically compatible: 15 pts
 *    - Incompatible: 0 pts (Immediate Rejection)
 * 2. HLA / Tissue Antigen Match (25 pts max):
 *    - HLA Score = 25 * (1.0 - |organ.hla - recipient.hla| / 100.0)
 * 3. Clinical Urgency (25 pts max):
 *    - Critical: 25 pts | High: 18 pts | Medium: 12 pts | Low: 5 pts
 * 4. Waiting List Seniority (15 pts max):
 *    - Seniority = 15 * min(1.0, wait_days / 730.0)
 * 5. Geographic Proximity & Viability (15 pts max):
 *    - Distance calculated via Great-Circle Haversine Formula:
 *      < 50 km: 15 pts | 50-200 km: 12 pts | 200-500 km: 8 pts | > 500 km: 4 pts
 * 
 * TIME COMPLEXITY ANALYSIS:
 * 1. Building Organ Min-Heap: O(M) or O(M log M)
 * 2. Extracting M organs in shelf-life order: M * O(log M) = O(M log M)
 * 3. Evaluating compatible recipients per organ: O(N) comparisons
 * 4. Total Worst-Case Time Complexity: O(M log M + M * N)
 *    When M <= 100, N <= 1000, this completes in sub-millisecond execution (< 2 ms).
 * 5. Space Complexity: O(M + N) for tracking allocations and maintaining queues.
 */

#include "matching.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <math.h>
#include <time.h>

static bool case_insensitive_cmp(const char* a, const char* b) {
    if (!a || !b) return false;
    while (*a && *b) {
        if (tolower((unsigned char)*a) != tolower((unsigned char)*b)) return false;
        a++;
        b++;
    }
    return *a == *b;
}

double compute_compatibility_score(const Organ* organ, const Recipient* recipient,
                                  double* blood_pts, double* hla_pts,
                                  double* urgency_pts, double* wait_pts,
                                  double* dist_pts, double* dist_km,
                                  char* reason_out, int reason_len) {
    if (!organ || !recipient) return 0.0;
    
    /* Strict Prerequisite 1: Exact Organ Type Match */
    if (!case_insensitive_cmp(organ->organ_type, recipient->required_organ)) {
        if (reason_out) snprintf(reason_out, reason_len, "Incompatible organ type (%s != %s)",
                                 organ->organ_type, recipient->required_organ);
        return 0.0;
    }
    
    /* Strict Prerequisite 2: Blood Group ABO & Rh Compatibility */
    if (!is_blood_compatible(organ->blood_group, recipient->blood_group)) {
        if (reason_out) snprintf(reason_out, reason_len, "Blood group incompatible (%s donor cannot give to %s)",
                                 organ->blood_group, recipient->blood_group);
        return 0.0;
    }
    
    /* 1. Blood Group Compatibility (20 pts max) */
    double b_pts = (strcmp(organ->blood_group, recipient->blood_group) == 0) ? 20.0 : 15.0;
    if (blood_pts) *blood_pts = b_pts;
    
    /* 2. HLA / Tissue Antigen Match (25 pts max) */
    int hla_diff = abs(organ->hla_score - recipient->hla_requirement);
    double h_pts = 25.0 * (1.0 - ((double)hla_diff / 100.0));
    if (h_pts < 0.0) h_pts = 0.0;
    if (hla_pts) *hla_pts = h_pts;
    
    /* 3. Medical Urgency (25 pts max) */
    double u_pts = 5.0;
    if (recipient->urgency == URGENCY_CRITICAL) u_pts = 25.0;
    else if (recipient->urgency == URGENCY_HIGH) u_pts = 18.0;
    else if (recipient->urgency == URGENCY_MEDIUM) u_pts = 12.0;
    if (urgency_pts) *urgency_pts = u_pts;
    
    /* 4. Waiting List Seniority (15 pts max) */
    double wait_ratio = (double)recipient->waiting_time_days / 730.0;
    if (wait_ratio > 1.0) wait_ratio = 1.0;
    double w_pts = 15.0 * wait_ratio;
    if (wait_pts) *wait_pts = w_pts;
    
    /* 5. Geographic Proximity & Distance Viability (15 pts max) */
    double d_km = calculate_haversine_distance(organ->latitude, organ->longitude,
                                               recipient->latitude, recipient->longitude);
    if (dist_km) *dist_km = d_km;
    
    double d_pts = 15.0;
    if (d_km > 500.0) d_pts = 4.0;
    else if (d_km > 200.0) d_pts = 8.0;
    else if (d_km > 50.0) d_pts = 12.0;
    if (dist_pts) *dist_pts = d_pts;
    
    double total = b_pts + h_pts + u_pts + w_pts + d_pts;
    if (total > 100.0) total = 100.0;
    
    if (reason_out) {
        snprintf(reason_out, reason_len,
                 "Blood %s->%s (+%.0f) | HLA diff %d (+%.1f) | %s Urgency (+%.0f) | Wait %dd (+%.1f) | Distance %.0fkm (+%.1f)",
                 organ->blood_group, recipient->blood_group, b_pts,
                 hla_diff, h_pts,
                 urgency_to_str(recipient->urgency), u_pts,
                 recipient->waiting_time_days, w_pts,
                 d_km, d_pts);
    }
    
    return total;
}

AllocationPlan run_greedy_matching(Organ* organs, int organ_count,
                                   Recipient* recipients, int recipient_count) {
    AllocationPlan plan;
    memset(&plan, 0, sizeof(AllocationPlan));
    
    time_t now = time(NULL);
    struct tm* tm_info = gmtime(&now);
    strftime(plan.execution_timestamp, sizeof(plan.execution_timestamp), "%Y-%m-%dT%H:%M:%SZ", tm_info);
    
    if (!organs || organ_count <= 0 || !recipients || recipient_count <= 0) {
        return plan;
    }
    
    /* Tracking array to ensure each recipient receives at most ONE organ */
    bool* recipient_matched = (bool*)calloc(recipient_count, sizeof(bool));
    if (!recipient_matched) return plan;
    
    /* Step 1: Initialize Min-Heap for Organs ordered by remaining shelf life */
    PriorityQueue* organ_heap = pq_create(organ_count, PQ_MIN_HEAP);
    if (!organ_heap) {
        free(recipient_matched);
        return plan;
    }
    
    for (int i = 0; i < organ_count; i++) {
        if (strcmp(organs[i].availability, "Available") == 0) {
            char detail[MAX_HOSPITAL_LEN];
            snprintf(detail, sizeof(detail), "%s (%s)", organs[i].organ_type, organs[i].blood_group);
            char subtext[MAX_STATUS_LEN];
            snprintf(subtext, sizeof(subtext), "%.1f hrs left", organs[i].shelf_life_hours);
            
            pq_insert(organ_heap, organs[i].id, organs[i].shelf_life_hours, organs[i].organ_type, detail, subtext);
        }
    }
    
    double total_score_sum = 0.0;
    
    /* Step 2: Greedy Allocation: Process organs closest to expiration first */
    while (!pq_is_empty(organ_heap) && plan.match_count < MAX_MATCHES) {
        PQNode organ_node;
        pq_extract_top(organ_heap, &organ_node);
        
        /* Locate actual organ record */
        Organ* current_organ = NULL;
        for (int i = 0; i < organ_count; i++) {
            if (strcmp(organs[i].id, organ_node.id) == 0) {
                current_organ = &organs[i];
                break;
            }
        }
        if (!current_organ) continue;
        
        /* Find best compatible unassigned recipient */
        int best_rec_idx = -1;
        double best_score = -1.0;
        double best_blood = 0, best_hla = 0, best_urgency = 0, best_wait = 0, best_dist = 0, best_km = 0;
        char best_reason[MAX_REASON_LEN] = {0};
        
        for (int j = 0; j < recipient_count; j++) {
            /* Skip already matched recipient (1:1 constraint) */
            if (recipient_matched[j]) continue;
            
            /* Skip recipients who are not in 'Waiting' status */
            if (strcmp(recipients[j].status, "Waiting") != 0) continue;
            
            double b_pts, h_pts, u_pts, w_pts, d_pts, d_km;
            char reason_buf[MAX_REASON_LEN];
            
            double score = compute_compatibility_score(current_organ, &recipients[j],
                                                       &b_pts, &h_pts, &u_pts, &w_pts, &d_pts, &d_km,
                                                       reason_buf, sizeof(reason_buf));
            
            if (score > 0.0 && score > best_score) {
                best_score = score;
                best_rec_idx = j;
                best_blood = b_pts;
                best_hla = h_pts;
                best_urgency = u_pts;
                best_wait = w_pts;
                best_dist = d_pts;
                best_km = d_km;
                strncpy(best_reason, reason_buf, sizeof(best_reason) - 1);
            }
        }
        
        /* If compatible match found, commit assignment */
        if (best_rec_idx != -1 && best_score > 0.0) {
            recipient_matched[best_rec_idx] = true;
            
            MatchResult* m = &plan.matches[plan.match_count];
            strncpy(m->organ_id, current_organ->id, MAX_ID_LEN - 1);
            strncpy(m->recipient_id, recipients[best_rec_idx].id, MAX_ID_LEN - 1);
            strncpy(m->organ_type, current_organ->organ_type, MAX_TYPE_LEN - 1);
            strncpy(m->donor_id, current_organ->donor_id, MAX_ID_LEN - 1);
            strncpy(m->recipient_name, recipients[best_rec_idx].name, MAX_NAME_LEN - 1);
            strncpy(m->donor_blood, current_organ->blood_group, MAX_BLOOD_LEN - 1);
            strncpy(m->recipient_blood, recipients[best_rec_idx].blood_group, MAX_BLOOD_LEN - 1);
            
            m->total_score = best_score;
            m->blood_compatibility_score = best_blood;
            m->hla_score = best_hla;
            m->urgency_score = best_urgency;
            m->waiting_time_score = best_wait;
            m->distance_viability_score = best_dist;
            m->distance_km = best_km;
            m->shelf_life_hours = current_organ->shelf_life_hours;
            
            strncpy(m->donor_hospital, current_organ->hospital, MAX_HOSPITAL_LEN - 1);
            strncpy(m->recipient_hospital, recipients[best_rec_idx].hospital, MAX_HOSPITAL_LEN - 1);
            strncpy(m->reason, best_reason, MAX_REASON_LEN - 1);
            
            total_score_sum += best_score;
            plan.match_count++;
        }
    }
    
    plan.unassigned_organs = organ_count - plan.match_count;
    plan.unassigned_recipients = recipient_count - plan.match_count;
    if (plan.match_count > 0) {
        plan.average_score = total_score_sum / plan.match_count;
    }
    
    pq_free(organ_heap);
    free(recipient_matched);
    
    return plan;
}

void print_allocation_plan(const AllocationPlan* plan) {
    if (!plan) return;
    printf("\n=======================================================\n");
    printf("         ORGANSYNC GREEDY ALLOCATION PLAN             \n");
    printf("=======================================================\n");
    printf("Total Matches Formed : %d\n", plan->match_count);
    printf("Average Score        : %.2f / 100\n", plan->average_score);
    printf("Timestamp            : %s\n", plan->execution_timestamp);
    printf("-------------------------------------------------------\n");
    
    for (int i = 0; i < plan->match_count; i++) {
        const MatchResult* m = &plan->matches[i];
        printf("Match #%d: [%s] %s -> [%s] %s\n",
               i + 1, m->organ_id, m->organ_type, m->recipient_id, m->recipient_name);
        printf("  Score: %.1f/100 (Blood: +%.0f, HLA: +%.1f, Urgency: +%.0f, Wait: +%.1f, Dist: +%.1f)\n",
               m->total_score, m->blood_compatibility_score, m->hla_score,
               m->urgency_score, m->waiting_time_score, m->distance_viability_score);
        printf("  Shelf Life: %.1f hrs | Distance: %.1f km\n", m->shelf_life_hours, m->distance_km);
        printf("  Route: %s -> %s\n", m->donor_hospital, m->recipient_hospital);
        printf("  Clinical Justification: %s\n\n", m->reason);
    }
    printf("=======================================================\n\n");
}
