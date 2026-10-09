#ifndef COMPATIBILITY_H
#define COMPATIBILITY_H

#include "models.h"
#include <stdbool.h>

#define MAX_REASONS 8
#define MAX_FACTOR_LEN 256

typedef struct {
    bool is_eligible;
    EligibilityStatus status;
    double compatibility_score;
    ScoreBreakdown breakdown;
    char eligibility_category[64];
    char verified_findings[512];
    char outstanding_tests[512];
    char supporting_factors[512];
    char caution_factors[512];
    double distance_km;
} CompatibilityEvaluation;

/* Compatibility Evaluation API */
CompatibilityEvaluation evaluate_candidate_compatibility(const Organ* organ, const Recipient* recipient);
bool check_blood_compatibility(const char* donor_blood, const char* recipient_blood);
double calculate_hla_match_score(const HLAMarkers* donor_hla, const HLAMarkers* rec_hla, int base_score, int req_score);
double calculate_urgency_score(UrgencyLevel urgency);
double calculate_ischemia_shelf_score(double remaining_hours, double max_hours);
double calculate_waitlist_score(int waiting_days);
double calculate_distance_score(double distance_km, double max_tolerable_km);

#endif /* COMPATIBILITY_H */
