/**
 * OrganSync - Clinical Compatibility Assessment Module
 * 
 * Implements rigorous medical compatibility checks:
 * 1. ABO/Rh blood compatibility rules
 * 2. Tissue typing and HLA locus matching
 * 3. Organ-specific cold ischemic tolerance
 * 4. Waiting time seniority and medical urgency status
 * 5. Explainable assessment breakdown with clinical caution factors
 */

#include "../include/compatibility.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <math.h>

#define PI 3.14159265358979323846

static int ci_compare(const char* s1, const char* s2) {
    if (!s1 || !s2) return s1 ? 1 : (s2 ? -1 : 0);
    while (*s1 && *s2) {
        int diff = tolower((unsigned char)*s1) - tolower((unsigned char)*s2);
        if (diff != 0) return diff;
        s1++;
        s2++;
    }
    return tolower((unsigned char)*s1) - tolower((unsigned char)*s2);
}

double calculate_haversine_distance(double lat1, double lon1, double lat2, double lon2) {
    if (lat1 == 0.0 && lon1 == 0.0 && lat2 == 0.0 && lon2 == 0.0) return 45.0; // fallback default
    double r = 6371.0; /* Earth radius in kilometers */
    double dlat = (lat2 - lat1) * (PI / 180.0);
    double dlon = (lon2 - lon1) * (PI / 180.0);
    double a = sin(dlat / 2.0) * sin(dlat / 2.0) +
               cos(lat1 * (PI / 180.0)) * cos(lat2 * (PI / 180.0)) *
               sin(dlon / 2.0) * sin(dlon / 2.0);
    double c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
    return r * c;
}

bool check_blood_compatibility(const char* donor_blood, const char* recipient_blood) {
    if (!donor_blood || !recipient_blood) return false;
    
    /* Universal Donor O- */
    if (strcmp(donor_blood, "O-") == 0) return true;
    
    /* Donor O+ can donate to all Rh+ recipients */
    if (strcmp(donor_blood, "O+") == 0) {
        return (strcmp(recipient_blood, "O+") == 0 ||
                strcmp(recipient_blood, "A+") == 0 ||
                strcmp(recipient_blood, "B+") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    
    /* Donor A- can donate to A-, A+, AB-, AB+ */
    if (strcmp(donor_blood, "A-") == 0) {
        return (strcmp(recipient_blood, "A-") == 0 ||
                strcmp(recipient_blood, "A+") == 0 ||
                strcmp(recipient_blood, "AB-") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    
    /* Donor A+ can donate to A+, AB+ */
    if (strcmp(donor_blood, "A+") == 0) {
        return (strcmp(recipient_blood, "A+") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    
    /* Donor B- can donate to B-, B+, AB-, AB+ */
    if (strcmp(donor_blood, "B-") == 0) {
        return (strcmp(recipient_blood, "B-") == 0 ||
                strcmp(recipient_blood, "B+") == 0 ||
                strcmp(recipient_blood, "AB-") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    
    /* Donor B+ can donate to B+, AB+ */
    if (strcmp(donor_blood, "B+") == 0) {
        return (strcmp(recipient_blood, "B+") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    
    /* Donor AB- can donate to AB-, AB+ */
    if (strcmp(donor_blood, "AB-") == 0) {
        return (strcmp(recipient_blood, "AB-") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    
    /* Donor AB+ can only donate to AB+ */
    if (strcmp(donor_blood, "AB+") == 0) {
        return (strcmp(recipient_blood, "AB+") == 0);
    }
    
    return false;
}

double calculate_hla_match_score(const HLAMarkers* donor_hla, const HLAMarkers* rec_hla, int base_score, int req_score) {
    int matches = 0;
    if (donor_hla && rec_hla) {
        if (donor_hla->hla_a[0] && rec_hla->hla_a[0] && strcmp(donor_hla->hla_a, rec_hla->hla_a) == 0) matches += 2;
        if (donor_hla->hla_b[0] && rec_hla->hla_b[0] && strcmp(donor_hla->hla_b, rec_hla->hla_b) == 0) matches += 2;
        if (donor_hla->hla_dr[0] && rec_hla->hla_dr[0] && strcmp(donor_hla->hla_dr, rec_hla->hla_dr) == 0) matches += 2;
    }
    
    double diff = fabs((double)(base_score - req_score));
    double score = 25.0 - (diff * 0.25) + (double)matches;
    if (score > 25.0) score = 25.0;
    if (score < 5.0) score = 5.0;
    return score;
}

double calculate_urgency_score(UrgencyLevel urgency) {
    switch (urgency) {
        case URGENCY_CRITICAL: return 30.0; /* Status 1A */
        case URGENCY_URGENT:   return 22.0; /* Status 1B */
        case URGENCY_MODERATE: return 14.0; /* Status 2 */
        case URGENCY_STABLE:   return 6.0;  /* Status 3 */
        default:               return 5.0;
    }
}

double calculate_ischemia_shelf_score(double remaining_hours, double max_hours) {
    if (max_hours <= 0.0) max_hours = 24.0;
    double ratio = remaining_hours / max_hours;
    if (ratio < 0.0) return 0.0;
    if (ratio > 1.0) ratio = 1.0;
    
    /* As cold ischemia window narrows, urgent priority increases (up to 15 pts) */
    double score = 15.0 * (1.0 - (ratio * 0.6));
    if (score > 15.0) score = 15.0;
    if (score < 2.0) score = 2.0;
    return score;
}

double calculate_waitlist_score(int waiting_days) {
    if (waiting_days <= 0) return 1.0;
    /* Logarithmic seniority reward up to 10 points */
    double score = log10((double)waiting_days + 1.0) * 3.3;
    if (score > 10.0) score = 10.0;
    if (score < 1.0) score = 1.0;
    return score;
}

double calculate_distance_score(double distance_km, double max_tolerable_km) {
    if (max_tolerable_km <= 0.0) max_tolerable_km = 1000.0;
    if (distance_km <= 0.0) return 10.0;
    double fraction = distance_km / max_tolerable_km;
    if (fraction >= 1.0) return 1.0;
    return 10.0 * (1.0 - (fraction * 0.8));
}

CompatibilityEvaluation evaluate_candidate_compatibility(const Organ* organ, const Recipient* recipient) {
    CompatibilityEvaluation eval;
    memset(&eval, 0, sizeof(CompatibilityEvaluation));
    
    if (!organ || !recipient) {
        eval.is_eligible = false;
        eval.status = ELIGIBILITY_INCOMPLETE;
        strcpy(eval.eligibility_category, "Assessment Incomplete");
        strcpy(eval.caution_factors, "Missing clinical entity pointer.");
        return eval;
    }
    
    /* Stage 1: Data validation & Organ Type Verification */
    if (ci_compare(organ->organ_type, recipient->required_organ) != 0 &&
        strstr(organ->organ_type, recipient->required_organ) == NULL &&
        strstr(recipient->required_organ, organ->organ_type) == NULL) {
        eval.is_eligible = false;
        eval.status = ELIGIBILITY_INELIGIBLE;
        strcpy(eval.eligibility_category, "Ineligible Under Current Rules");
        snprintf(eval.caution_factors, 511, "Organ mismatch: Donor offers %s but recipient requires %s.",
                 organ->organ_type, recipient->required_organ);
        return eval;
    }
    
    /* Check for stale recipient assessment */
    if (recipient->reassessment_stale) {
        eval.status = ELIGIBILITY_POTENTIALLY_ELIGIBLE;
        snprintf(eval.outstanding_tests, 511, "Recipient reassessment is overdue (>90 days). Clinical update required.");
    }
    
    /* Check for missing mandatory organ tests */
    if (!organ->has_mandatory_tests && organ->missing_tests[0] != '\0') {
        eval.status = ELIGIBILITY_INCOMPLETE;
        snprintf(eval.outstanding_tests, 511, "Mandatory donor testing incomplete: %s.", organ->missing_tests);
    }
    
    /* Stage 2: ABO Blood Compatibility */
    bool blood_compat = check_blood_compatibility(organ->blood_group, recipient->blood_group);
    if (!blood_compat) {
        eval.is_eligible = false;
        eval.status = ELIGIBILITY_INELIGIBLE;
        strcpy(eval.eligibility_category, "Ineligible Under Current Rules");
        snprintf(eval.caution_factors, 511, "ABO incompatibility: Donor blood %s cannot donate to Recipient blood %s.",
                 organ->blood_group, recipient->blood_group);
        return eval;
    }
    
    /* Stage 3: Geographic Distance & Cold Ischemia Viability */
    eval.distance_km = calculate_haversine_distance(
        organ->latitude, organ->longitude,
        recipient->latitude, recipient->longitude
    );
    
    /* Check cold ischemic tolerance limits by organ type */
    double max_dist_km = 1200.0;
    if (ci_compare(organ->organ_type, "Heart") == 0) {
        max_dist_km = 800.0;
        if (organ->shelf_life_hours < 1.5 && eval.distance_km > 300.0) {
            eval.status = ELIGIBILITY_CLINICAL_REVIEW_REQ;
            strcat(eval.caution_factors, "Critical ischemic risk: Remaining heart tolerance is under 1.5h for cross-regional transit. ");
        }
    } else if (ci_compare(organ->organ_type, "Lungs") == 0 || ci_compare(organ->organ_type, "Lung") == 0) {
        max_dist_km = 900.0;
    } else if (ci_compare(organ->organ_type, "Kidney") == 0) {
        max_dist_km = 2500.0;
    }
    
    /* Immunological assessment: Crossmatch & PRA */
    if (strcmp(recipient->crossmatch_status, "Positive") == 0) {
        eval.is_eligible = false;
        eval.status = ELIGIBILITY_INELIGIBLE;
        strcpy(eval.eligibility_category, "Ineligible Under Current Rules");
        strcat(eval.caution_factors, "Cytotoxic crossmatch is positive; acute rejection contraindication. ");
        return eval;
    } else if (strcmp(recipient->crossmatch_status, "Pending") == 0) {
        if (eval.status == ELIGIBILITY_ELIGIBLE || eval.status == 0) {
            eval.status = ELIGIBILITY_POTENTIALLY_ELIGIBLE;
        }
        strcat(eval.outstanding_tests, "Prospective crossmatch result pending. ");
    }
    
    if (recipient->pra_score > 80) {
        strcat(eval.caution_factors, "Highly sensitized candidate (PRA > 80%). Requires flow cytometric verification. ");
    }
    
    /* Calculate Score Breakdown */
    eval.breakdown.blood_score = 20.0;
    eval.breakdown.hla_score = calculate_hla_match_score(
        &organ->hla, &recipient->hla, organ->hla_score, recipient->hla_requirement
    );
    eval.breakdown.urgency_score = calculate_urgency_score(recipient->urgency);
    eval.breakdown.shelf_life_score = calculate_ischemia_shelf_score(
        organ->shelf_life_hours, organ->max_shelf_life_hours
    );
    eval.breakdown.wait_time_score = calculate_waitlist_score(recipient->waiting_time_days);
    eval.breakdown.distance_score = calculate_distance_score(eval.distance_km, max_dist_km);
    
    /* Age Bracket Suitability Bonus (0 - 5 pts) */
    int age_diff = abs(organ->donor_age - recipient->age);
    if (age_diff <= 10) eval.breakdown.age_match_score = 5.0;
    else if (age_diff <= 20) eval.breakdown.age_match_score = 3.5;
    else eval.breakdown.age_match_score = 1.5;
    
    eval.compatibility_score = eval.breakdown.blood_score +
                               eval.breakdown.hla_score +
                               eval.breakdown.urgency_score +
                               eval.breakdown.shelf_life_score +
                               eval.breakdown.wait_time_score +
                               eval.breakdown.distance_score +
                               eval.breakdown.age_match_score;
    
    if (eval.compatibility_score > 100.0) eval.compatibility_score = 100.0;
    
    /* Determine final eligibility status if not already set */
    if (eval.status == 0) {
        eval.is_eligible = true;
        eval.status = ELIGIBILITY_ELIGIBLE;
        strcpy(eval.eligibility_category, "Eligible for Further Review");
    } else if (eval.status == ELIGIBILITY_POTENTIALLY_ELIGIBLE) {
        eval.is_eligible = true;
        strcpy(eval.eligibility_category, "Potentially Eligible - Additional Assessment Required");
    } else if (eval.status == ELIGIBILITY_CLINICAL_REVIEW_REQ) {
        eval.is_eligible = true;
        strcpy(eval.eligibility_category, "Clinical Review Required");
    }
    
    /* Supporting Factors */
    snprintf(eval.verified_findings, 511,
             "ABO Compatibility Confirmed (%s -> %s). HLA Compatibility Score: %.1f/25. Urgency: %s.",
             organ->blood_group, recipient->blood_group,
             eval.breakdown.hla_score, recipient->urgency_str);
             
    snprintf(eval.supporting_factors, 511,
             "Priority Urgency Weight: %.1f pts. Waitlist Seniority (%d days): %.1f pts. Transit Distance (%.1f km): %.1f pts.",
             eval.breakdown.urgency_score, recipient->waiting_time_days, eval.breakdown.wait_time_score,
             eval.distance_km, eval.breakdown.distance_score);
             
    return eval;
}
