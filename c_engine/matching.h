#ifndef MATCHING_H
#define MATCHING_H

#include "models.h"
#include "hash_table.h"
#include "priority_queue.h"
#include "graph.h"
#include "queue.h"
#include <stdbool.h>

#define MAX_MATCHES 128

typedef struct {
    MatchResult matches[MAX_MATCHES];
    int match_count;
    int unassigned_organs;
    int unassigned_recipients;
    double average_score;
    char execution_timestamp[32];
} AllocationPlan;

/* Scoring Computation */
double compute_compatibility_score(const Organ* organ, const Recipient* recipient,
                                  double* blood_pts, double* hla_pts,
                                  double* urgency_pts, double* wait_pts,
                                  double* dist_pts, double* dist_km,
                                  char* reason_out, int reason_len);

/* Greedy Matching Engine */
AllocationPlan run_greedy_matching(Organ* organs, int organ_count,
                                   Recipient* recipients, int recipient_count);

/* Display and Reporting */
void print_allocation_plan(const AllocationPlan* plan);

#endif /* MATCHING_H */
