#include "models.h"
#include <string.h>
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

BloodType parse_blood_type(const char* blood_str) {
    if (!blood_str) return BLOOD_UNKNOWN;
    if (strcmp(blood_str, "O-") == 0) return BLOOD_O_NEG;
    if (strcmp(blood_str, "O+") == 0) return BLOOD_O_POS;
    if (strcmp(blood_str, "A-") == 0) return BLOOD_A_NEG;
    if (strcmp(blood_str, "A+") == 0) return BLOOD_A_POS;
    if (strcmp(blood_str, "B-") == 0) return BLOOD_B_NEG;
    if (strcmp(blood_str, "B+") == 0) return BLOOD_B_POS;
    if (strcmp(blood_str, "AB-") == 0) return BLOOD_AB_NEG;
    if (strcmp(blood_str, "AB+") == 0) return BLOOD_AB_POS;
    return BLOOD_UNKNOWN;
}

const char* blood_type_to_str(BloodType bt) {
    switch (bt) {
        case BLOOD_O_NEG: return "O-";
        case BLOOD_O_POS: return "O+";
        case BLOOD_A_NEG: return "A-";
        case BLOOD_A_POS: return "A+";
        case BLOOD_B_NEG: return "B-";
        case BLOOD_B_POS: return "B+";
        case BLOOD_AB_NEG: return "AB-";
        case BLOOD_AB_POS: return "AB+";
        default: return "Unknown";
    }
}

/**
 * Standard ABO and Rh Compatibility Matrix for Organ Transplantation:
 * ABO compatibility is strictly mandatory to prevent hyperacute rejection.
 * Rh factor matching is also enforced or penalized:
 * - O- can donate to: All groups (Universal Donor)
 * - O+ can donate to: O+, A+, B+, AB+
 * - A- can donate to: A-, A+, AB-, AB+
 * - A+ can donate to: A+, AB+
 * - B- can donate to: B-, B+, AB-, AB+
 * - B+ can donate to: B+, AB+
 * - AB- can donate to: AB-, AB+
 * - AB+ can donate to: AB+ (Universal Recipient)
 */
bool is_blood_compatible(const char* donor_blood, const char* recipient_blood) {
    BloodType d = parse_blood_type(donor_blood);
    BloodType r = parse_blood_type(recipient_blood);

    if (d == BLOOD_UNKNOWN || r == BLOOD_UNKNOWN) return false;

    /* Donor O- */
    if (d == BLOOD_O_NEG) return true;

    /* Donor O+ */
    if (d == BLOOD_O_POS) {
        return (r == BLOOD_O_POS || r == BLOOD_A_POS || r == BLOOD_B_POS || r == BLOOD_AB_POS);
    }

    /* Donor A- */
    if (d == BLOOD_A_NEG) {
        return (r == BLOOD_A_NEG || r == BLOOD_A_POS || r == BLOOD_AB_NEG || r == BLOOD_AB_POS);
    }

    /* Donor A+ */
    if (d == BLOOD_A_POS) {
        return (r == BLOOD_A_POS || r == BLOOD_AB_POS);
    }

    /* Donor B- */
    if (d == BLOOD_B_NEG) {
        return (r == BLOOD_B_NEG || r == BLOOD_B_POS || r == BLOOD_AB_NEG || r == BLOOD_AB_POS);
    }

    /* Donor B+ */
    if (d == BLOOD_B_POS) {
        return (r == BLOOD_B_POS || r == BLOOD_AB_POS);
    }

    /* Donor AB- */
    if (d == BLOOD_AB_NEG) {
        return (r == BLOOD_AB_NEG || r == BLOOD_AB_POS);
    }

    /* Donor AB+ */
    if (d == BLOOD_AB_POS) {
        return (r == BLOOD_AB_POS);
    }

    return false;
}

UrgencyLevel parse_urgency(const char* urgency_str) {
    if (!urgency_str) return URGENCY_LOW;
    if (strcmp(urgency_str, "Critical") == 0 || strcmp(urgency_str, "critical") == 0) return URGENCY_CRITICAL;
    if (strcmp(urgency_str, "High") == 0 || strcmp(urgency_str, "high") == 0) return URGENCY_HIGH;
    if (strcmp(urgency_str, "Medium") == 0 || strcmp(urgency_str, "medium") == 0) return URGENCY_MEDIUM;
    return URGENCY_LOW;
}

const char* urgency_to_str(UrgencyLevel u) {
    switch (u) {
        case URGENCY_CRITICAL: return "Critical";
        case URGENCY_HIGH: return "High";
        case URGENCY_MEDIUM: return "Medium";
        case URGENCY_LOW:
        default: return "Low";
    }
}

const char* stage_to_str(ProcessingStage s) {
    switch (s) {
        case STAGE_MATCH_ACCEPTED: return "Match Accepted";
        case STAGE_TRANSPORT_SCHEDULED: return "Transport Scheduled";
        case STAGE_IN_TRANSIT: return "In Transit";
        case STAGE_TRANSPLANT_READY: return "Transplant Ready";
        case STAGE_COMPLETED: return "Transplant Completed";
        default: return "Unknown";
    }
}

static double deg2rad(double deg) {
    return deg * (M_PI / 180.0);
}

/**
 * Calculates Great-Circle distance (in kilometers) between two geographic coordinates
 * using the Haversine formula.
 */
double calculate_haversine_distance(double lat1, double lon1, double lat2, double lon2) {
    if (lat1 == 0.0 && lon1 == 0.0 && lat2 == 0.0 && lon2 == 0.0) {
        return 25.0; /* default local distance if coordinates unspecified */
    }
    double r = 6371.0; /* Earth's mean radius in km */
    double dlat = deg2rad(lat2 - lat1);
    double dlon = deg2rad(lon2 - lon1);
    double a = sin(dlat / 2.0) * sin(dlat / 2.0) +
               cos(deg2rad(lat1)) * cos(deg2rad(lat2)) *
               sin(dlon / 2.0) * sin(dlon / 2.0);
    double c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
    return r * c;
}
