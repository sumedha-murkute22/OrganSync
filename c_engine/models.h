#ifndef MODELS_H
#define MODELS_H

#include <stdbool.h>

#define MAX_ID_LEN 32
#define MAX_NAME_LEN 128
#define MAX_TYPE_LEN 32
#define MAX_BLOOD_LEN 8
#define MAX_HOSPITAL_LEN 128
#define MAX_STATUS_LEN 32
#define MAX_REASON_LEN 512

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
    URGENCY_LOW = 1,
    URGENCY_MEDIUM = 2,
    URGENCY_HIGH = 3,
    URGENCY_CRITICAL = 4
} UrgencyLevel;

/* Transplant Processing Stages */
typedef enum {
    STAGE_MATCH_ACCEPTED = 1,
    STAGE_TRANSPORT_SCHEDULED = 2,
    STAGE_IN_TRANSIT = 3,
    STAGE_TRANSPLANT_READY = 4,
    STAGE_COMPLETED = 5
} ProcessingStage;

/* Organ Record Structure */
typedef struct {
    char id[MAX_ID_LEN];
    char organ_type[MAX_TYPE_LEN];     /* e.g., "Kidney", "Liver", "Heart", "Lungs", "Pancreas" */
    char donor_id[MAX_ID_LEN];
    char blood_group[MAX_BLOOD_LEN];   /* "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+" */
    int hla_score;                     /* Tissue marker score (0 - 100) */
    char donation_time[MAX_STATUS_LEN];
    double shelf_life_hours;           /* Remaining viable ischemic tolerance in hours */
    char hospital[MAX_HOSPITAL_LEN];
    char city[MAX_NAME_LEN];
    double latitude;
    double longitude;
    char transport_status[MAX_STATUS_LEN];
    char availability[MAX_STATUS_LEN]; /* "Available", "Allocated", "Transplanted", "Expired" */
} Organ;

/* Recipient Record Structure */
typedef struct {
    char id[MAX_ID_LEN];
    char name[MAX_NAME_LEN];
    char required_organ[MAX_TYPE_LEN];
    char blood_group[MAX_BLOOD_LEN];
    int hla_requirement;               /* Target tissue marker score (0 - 100) */
    char urgency_str[MAX_STATUS_LEN];  /* "Low", "Medium", "High", "Critical" */
    UrgencyLevel urgency;
    int waiting_time_days;             /* Waitlist seniority in days */
    char hospital[MAX_HOSPITAL_LEN];
    char city[MAX_NAME_LEN];
    double latitude;
    double longitude;
    char status[MAX_STATUS_LEN];       /* "Waiting", "Matched", "Transplanted" */
} Recipient;

/* Recommended Match Result */
typedef struct {
    char organ_id[MAX_ID_LEN];
    char recipient_id[MAX_ID_LEN];
    char organ_type[MAX_TYPE_LEN];
    char donor_id[MAX_ID_LEN];
    char recipient_name[MAX_NAME_LEN];
    char donor_blood[MAX_BLOOD_LEN];
    char recipient_blood[MAX_BLOOD_LEN];
    double total_score;                /* 0.0 to 100.0 */
    double blood_compatibility_score;  /* 0 - 20 pts */
    double hla_score;                  /* 0 - 25 pts */
    double urgency_score;              /* 0 - 25 pts */
    double waiting_time_score;         /* 0 - 15 pts */
    double distance_viability_score;   /* 0 - 15 pts */
    double distance_km;
    double shelf_life_hours;
    char donor_hospital[MAX_HOSPITAL_LEN];
    char recipient_hospital[MAX_HOSPITAL_LEN];
    char reason[MAX_REASON_LEN];
} MatchResult;

/* Processing Queue Item */
typedef struct {
    char match_id[MAX_ID_LEN];
    char organ_id[MAX_ID_LEN];
    char organ_type[MAX_TYPE_LEN];
    char donor_id[MAX_ID_LEN];
    char recipient_id[MAX_ID_LEN];
    char recipient_name[MAX_NAME_LEN];
    double compatibility_score;
    char donor_hospital[MAX_HOSPITAL_LEN];
    char recipient_hospital[MAX_HOSPITAL_LEN];
    ProcessingStage stage;
    char status_str[MAX_STATUS_LEN];
    char courier_vehicle[MAX_NAME_LEN];
    int eta_minutes;
    char notes[MAX_REASON_LEN];
    char last_updated[MAX_STATUS_LEN];
} QueueItem;

/* Helper Prototypes */
BloodType parse_blood_type(const char* blood_str);
const char* blood_type_to_str(BloodType bt);
bool is_blood_compatible(const char* donor_blood, const char* recipient_blood);
UrgencyLevel parse_urgency(const char* urgency_str);
const char* urgency_to_str(UrgencyLevel u);
const char* stage_to_str(ProcessingStage s);
double calculate_haversine_distance(double lat1, double lon1, double lat2, double lon2);

#endif /* MODELS_H */
