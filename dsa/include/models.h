#ifndef MODELS_H
#define MODELS_H

#include <stdbool.h>

#define MAX_ID_LEN 64
#define MAX_NAME_LEN 128
#define MAX_TYPE_LEN 32
#define MAX_BLOOD_LEN 8
#define MAX_HOSPITAL_LEN 128
#define MAX_STATUS_LEN 48
#define MAX_REASON_LEN 512
#define MAX_NOTES_LEN 1024

/* Blood Group Enumeration for Fast Comparison */
typedef enum {
    BLOOD_O_NEG = 0,
    BLOOD_O_POS,
    BLOOD_A_NEG,
    BLOOD_A_POS,
    BLOOD_B_NEG,
    BLOOD_B_POS,
    BLOOD_AB_NEG,
    BLOOD_AB_POS,
    BLOOD_UNKNOWN
} BloodType;

/* Medical Urgency Level */
typedef enum {
    URGENCY_STABLE = 1,     /* Status 3 */
    URGENCY_MODERATE = 2,   /* Status 2 */
    URGENCY_URGENT = 3,     /* Status 1B */
    URGENCY_CRITICAL = 4    /* Status 1A */
} UrgencyLevel;

/* Preliminary Eligibility Categories */
typedef enum {
    ELIGIBILITY_ELIGIBLE = 0,               /* Eligible for Further Review */
    ELIGIBILITY_POTENTIALLY_ELIGIBLE = 1,   /* Additional Assessment Required */
    ELIGIBILITY_INELIGIBLE = 2,             /* Ineligible Under Current Rules */
    ELIGIBILITY_INCOMPLETE = 3,             /* Assessment Incomplete */
    ELIGIBILITY_CLINICAL_REVIEW_REQ = 4     /* Clinical Review Required */
} EligibilityStatus;

/* HLA Markers */
typedef struct {
    char hla_a[32];
    char hla_b[32];
    char hla_dr[32];
} HLAMarkers;

/* Organ Model */
typedef struct {
    char id[MAX_ID_LEN];
    char organ_type[MAX_TYPE_LEN];     /* Kidney, Liver, Heart, Lungs, Pancreas, Intestine */
    char donor_id[MAX_ID_LEN];
    char donor_name[MAX_NAME_LEN];
    int donor_age;
    char blood_group[MAX_BLOOD_LEN];
    HLAMarkers hla;
    int hla_score;                     /* Base tissue marker index (0-100) */
    char donation_time[MAX_STATUS_LEN];
    double max_shelf_life_hours;       /* Maximum cold ischemic time */
    double shelf_life_hours;           /* Remaining viable ischemic tolerance */
    char hospital[MAX_HOSPITAL_LEN];
    char city[MAX_NAME_LEN];
    double latitude;
    double longitude;
    char preservation_method[64];
    double preservation_temp_c;
    char viability_assessment[64];
    char status[MAX_STATUS_LEN];       /* Registered, Available, Allocated, In Transit, Transplanted, Expired */
    bool has_mandatory_tests;
    char missing_tests[256];
} Organ;

/* Recipient Model */
typedef struct {
    char id[MAX_ID_LEN];
    char name[MAX_NAME_LEN];
    int age;
    char required_organ[MAX_TYPE_LEN];
    char blood_group[MAX_BLOOD_LEN];
    HLAMarkers hla;
    int hla_requirement;               /* Target tissue marker score (0-100) */
    int pra_score;                     /* Panel Reactive Antibodies (0-100) */
    char urgency_str[MAX_STATUS_LEN];  /* Status 1A (Critical), Status 1B (Urgent), Status 2 (Moderate), Status 3 (Stable) */
    UrgencyLevel urgency;
    int waiting_time_days;             /* Days on waiting list */
    char registration_date[MAX_STATUS_LEN];
    char hospital[MAX_HOSPITAL_LEN];
    char city[MAX_NAME_LEN];
    double latitude;
    double longitude;
    char status[MAX_STATUS_LEN];       /* Active on Waiting List, Temporarily Inactive, Matched, Transplanted */
    char crossmatch_status[32];        /* Negative, Positive, Pending */
    bool clinical_readiness;           /* Ready for surgery */
    char last_reassessment[MAX_STATUS_LEN];
    bool reassessment_stale;           /* Stale if > 90 days */
} Recipient;

/* Transparent Score Breakdown */
typedef struct {
    double blood_score;         /* 0 or 20 */
    double hla_score;           /* 0 to 25 */
    double urgency_score;       /* 5 to 30 */
    double shelf_life_score;    /* 0 to 15 */
    double wait_time_score;     /* 0 to 10 */
    double distance_score;      /* 0 to 10 */
    double age_match_score;     /* 0 to 5 */
} ScoreBreakdown;

/* Candidate Recommendation Result */
typedef struct {
    int rank;
    char organ_id[MAX_ID_LEN];
    char recipient_id[MAX_ID_LEN];
    char organ_type[MAX_TYPE_LEN];
    char donor_id[MAX_ID_LEN];
    char recipient_name[MAX_NAME_LEN];
    char donor_blood[MAX_BLOOD_LEN];
    char recipient_blood[MAX_BLOOD_LEN];
    EligibilityStatus eligibility;
    char eligibility_str[MAX_STATUS_LEN];
    char priority_category[MAX_STATUS_LEN];
    double total_score;
    ScoreBreakdown breakdown;
    double distance_km;
    double shelf_life_hours;
    char donor_hospital[MAX_HOSPITAL_LEN];
    char recipient_hospital[MAX_HOSPITAL_LEN];
    char verified_findings[MAX_REASON_LEN];
    char outstanding_tests[MAX_REASON_LEN];
    char supporting_factors[MAX_REASON_LEN];
    char caution_factors[MAX_REASON_LEN];
    char policy_version[32];
    char assessment_timestamp[MAX_STATUS_LEN];
    bool clinical_decision_confirmed;
} CandidateRecommendation;

/* Helper Prototypes */
BloodType parse_blood_type(const char* blood_str);
const char* blood_type_to_str(BloodType bt);
bool is_blood_compatible(const char* donor_blood, const char* recipient_blood);
UrgencyLevel parse_urgency(const char* urgency_str);
const char* urgency_to_str(UrgencyLevel u);
const char* eligibility_to_str(EligibilityStatus s);
double calculate_haversine_distance(double lat1, double lon1, double lat2, double lon2);

#endif /* MODELS_H */
