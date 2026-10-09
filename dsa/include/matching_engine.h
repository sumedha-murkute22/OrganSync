#ifndef MATCHING_ENGINE_H
#define MATCHING_ENGINE_H

#include "models.h"
#include "compatibility.h"
#include "priority_queue.h"
#include "hash_table.h"
#include "graph.h"
#include <stdbool.h>

#define MAX_RECOMMENDATIONS 64

typedef struct {
    CandidateRecommendation recommendations[MAX_RECOMMENDATIONS];
    int count;
    char organ_id[MAX_ID_LEN];
    char evaluated_at[64];
    char policy_version[32];
    int total_evaluated;
    int eligible_count;
    int excluded_count;
    char clinical_disclaimer[256];
} MatchingRunResult;

/* Matching Engine API */
MatchingRunResult run_matching_engine_for_organ(
    const Organ* organ,
    const Recipient recipients[],
    int num_recipients,
    const char* policy_version
);

/* JSON Serialization of Results */
char* matching_results_to_json(const MatchingRunResult* result);

#endif /* MATCHING_ENGINE_H */
