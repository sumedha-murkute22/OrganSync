/**
 * OrganSync - Matching Engine Implementation
 * 
 * Implements 6-Stage Candidate Evaluation:
 * Stage 1: Data validation
 * Stage 2: Preliminary eligibility
 * Stage 3: Candidate classification
 * Stage 4: Priority assessment (Max-Heap with waitlist seniority tie-break)
 * Stage 5: Explainable recommendations with transparent score breakdown
 * Stage 6: Allocation recommendation support (explicitly requires clinical authorization)
 */

#include "../include/matching_engine.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

static void get_iso_timestamp(char* buf, size_t max_len) {
    time_t now = time(NULL);
    struct tm* tm_info = gmtime(&now);
    strftime(buf, max_len, "%Y-%m-%dT%H:%M:%SZ", tm_info);
}

MatchingRunResult run_matching_engine_for_organ(
    const Organ* organ,
    const Recipient recipients[],
    int num_recipients,
    const char* policy_version
) {
    MatchingRunResult result;
    memset(&result, 0, sizeof(MatchingRunResult));
    
    if (!organ) return result;
    
    strncpy(result.organ_id, organ->id, MAX_ID_LEN - 1);
    get_iso_timestamp(result.evaluated_at, sizeof(result.evaluated_at));
    strncpy(result.policy_version, policy_version ? policy_version : "OPTN-POL-2026.4", 31);
    strcpy(result.clinical_disclaimer,
           "NOTICE: System-generated candidate recommendations require authorized clinical review. "
           "Algorithmic scores do not finalize clinical allocation decisions.");
           
    result.total_evaluated = num_recipients;
    
    /* Stage 4: Priority Queue (Max-Heap) for Urgency and Seniority Ranking */
    PriorityQueue* pq = pq_create(num_recipients + 4, PQ_MAX_HEAP);
    if (!pq) return result;
    
    /* Temporary storage for evaluations */
    CompatibilityEvaluation evals[MAX_RECOMMENDATIONS];
    int rec_indices[MAX_RECOMMENDATIONS];
    int count = 0;
    
    for (int i = 0; i < num_recipients && count < MAX_RECOMMENDATIONS; i++) {
        const Recipient* r = &recipients[i];
        
        /* Evaluate compatibility */
        CompatibilityEvaluation eval = evaluate_candidate_compatibility(organ, r);
        
        if (eval.is_eligible || eval.status == ELIGIBILITY_CLINICAL_REVIEW_REQ || eval.status == ELIGIBILITY_POTENTIALLY_ELIGIBLE) {
            evals[count] = eval;
            rec_indices[count] = i;
            
            /* Insert into Priority Queue Max-Heap with waitlist seniority tie-break */
            pq_insert(pq, r->id, eval.compatibility_score, (double)r->waiting_time_days, r->name, r->hospital, r->urgency_str);
            result.eligible_count++;
            count++;
        } else {
            result.excluded_count++;
        }
    }
    
    /* Extract candidates in strict priority order from the Binary Heap */
    int rank = 1;
    while (!pq_is_empty(pq) && result.count < MAX_RECOMMENDATIONS) {
        PQNode top;
        pq_extract_top(pq, &top);
        
        /* Find matching evaluation */
        for (int j = 0; j < count; j++) {
            int orig_idx = rec_indices[j];
            const Recipient* r = &recipients[orig_idx];
            
            if (strcmp(r->id, top.id) == 0) {
                CandidateRecommendation* rec = &result.recommendations[result.count];
                rec->rank = rank++;
                strncpy(rec->organ_id, organ->id, MAX_ID_LEN - 1);
                strncpy(rec->recipient_id, r->id, MAX_ID_LEN - 1);
                strncpy(rec->organ_type, organ->organ_type, MAX_TYPE_LEN - 1);
                strncpy(rec->donor_id, organ->donor_id, MAX_ID_LEN - 1);
                strncpy(rec->recipient_name, r->name, MAX_NAME_LEN - 1);
                strncpy(rec->donor_blood, organ->blood_group, MAX_BLOOD_LEN - 1);
                strncpy(rec->recipient_blood, r->blood_group, MAX_BLOOD_LEN - 1);
                
                rec->eligibility = evals[j].status;
                strncpy(rec->eligibility_str, evals[j].eligibility_category, MAX_STATUS_LEN - 1);
                strncpy(rec->priority_category, r->urgency_str, MAX_STATUS_LEN - 1);
                rec->total_score = evals[j].compatibility_score;
                rec->breakdown = evals[j].breakdown;
                rec->distance_km = evals[j].distance_km;
                rec->shelf_life_hours = organ->shelf_life_hours;
                
                strncpy(rec->donor_hospital, organ->hospital, MAX_HOSPITAL_LEN - 1);
                strncpy(rec->recipient_hospital, r->hospital, MAX_HOSPITAL_LEN - 1);
                strncpy(rec->verified_findings, evals[j].verified_findings, MAX_REASON_LEN - 1);
                strncpy(rec->outstanding_tests, evals[j].outstanding_tests, MAX_REASON_LEN - 1);
                strncpy(rec->supporting_factors, evals[j].supporting_factors, MAX_REASON_LEN - 1);
                strncpy(rec->caution_factors, evals[j].caution_factors, MAX_REASON_LEN - 1);
                strncpy(rec->policy_version, result.policy_version, 31);
                strncpy(rec->assessment_timestamp, result.evaluated_at, MAX_STATUS_LEN - 1);
                rec->clinical_decision_confirmed = false;
                
                result.count++;
                break;
            }
        }
    }
    
    pq_free(pq);
    return result;
}

char* matching_results_to_json(const MatchingRunResult* result) {
    if (!result) return NULL;
    
    /* Allocate buffer for JSON output */
    size_t buf_size = 65536;
    char* json = (char*)malloc(buf_size);
    if (!json) return NULL;
    
    int offset = snprintf(json, buf_size,
        "{\n"
        "  \"organ_id\": \"%s\",\n"
        "  \"evaluated_at\": \"%s\",\n"
        "  \"policy_version\": \"%s\",\n"
        "  \"clinical_disclaimer\": \"%s\",\n"
        "  \"metrics\": {\n"
        "    \"total_evaluated\": %d,\n"
        "    \"eligible_count\": %d,\n"
        "    \"excluded_count\": %d,\n"
        "    \"recommendations_count\": %d\n"
        "  },\n"
        "  \"recommendations\": [\n",
        result->organ_id,
        result->evaluated_at,
        result->policy_version,
        result->clinical_disclaimer,
        result->total_evaluated,
        result->eligible_count,
        result->excluded_count,
        result->count
    );
    
    for (int i = 0; i < result->count; i++) {
        const CandidateRecommendation* r = &result->recommendations[i];
        int written = snprintf(json + offset, buf_size - offset,
            "    {\n"
            "      \"rank\": %d,\n"
            "      \"recipient_id\": \"%s\",\n"
            "      \"recipient_name\": \"%s\",\n"
            "      \"organ_id\": \"%s\",\n"
            "      \"organ_type\": \"%s\",\n"
            "      \"donor_id\": \"%s\",\n"
            "      \"donor_blood\": \"%s\",\n"
            "      \"recipient_blood\": \"%s\",\n"
            "      \"eligibility_status\": \"%s\",\n"
            "      \"priority_category\": \"%s\",\n"
            "      \"total_score\": %.2f,\n"
            "      \"score_breakdown\": {\n"
            "        \"blood_score\": %.1f,\n"
            "        \"hla_score\": %.1f,\n"
            "        \"urgency_score\": %.1f,\n"
            "        \"shelf_life_score\": %.1f,\n"
            "        \"wait_time_score\": %.1f,\n"
            "        \"distance_score\": %.1f,\n"
            "        \"age_match_score\": %.1f\n"
            "      },\n"
            "      \"distance_km\": %.1f,\n"
            "      \"shelf_life_hours\": %.1f,\n"
            "      \"donor_hospital\": \"%s\",\n"
            "      \"recipient_hospital\": \"%s\",\n"
            "      \"verified_findings\": \"%s\",\n"
            "      \"outstanding_tests\": \"%s\",\n"
            "      \"supporting_factors\": \"%s\",\n"
            "      \"caution_factors\": \"%s\",\n"
            "      \"clinical_decision_confirmed\": false\n"
            "    }%s\n",
            r->rank,
            r->recipient_id,
            r->recipient_name,
            r->organ_id,
            r->organ_type,
            r->donor_id,
            r->donor_blood,
            r->recipient_blood,
            r->eligibility_str,
            r->priority_category,
            r->total_score,
            r->breakdown.blood_score,
            r->breakdown.hla_score,
            r->breakdown.urgency_score,
            r->breakdown.shelf_life_score,
            r->breakdown.wait_time_score,
            r->breakdown.distance_score,
            r->breakdown.age_match_score,
            r->distance_km,
            r->shelf_life_hours,
            r->donor_hospital,
            r->recipient_hospital,
            r->verified_findings,
            r->outstanding_tests,
            r->supporting_factors,
            r->caution_factors,
            (i < result->count - 1) ? "," : ""
        );
        offset += written;
    }
    
    snprintf(json + offset, buf_size - offset, "  ]\n}\n");
    return json;
}
