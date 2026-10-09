/**
 * OrganSync - Models and Clinical Helper Functions
 */

#include "../include/models.h"
#include <string.h>

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

bool is_blood_compatible(const char* donor_blood, const char* recipient_blood) {
    if (!donor_blood || !recipient_blood) return false;
    if (strcmp(donor_blood, "O-") == 0) return true;
    if (strcmp(donor_blood, "O+") == 0) {
        return (strcmp(recipient_blood, "O+") == 0 ||
                strcmp(recipient_blood, "A+") == 0 ||
                strcmp(recipient_blood, "B+") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    if (strcmp(donor_blood, "A-") == 0) {
        return (strcmp(recipient_blood, "A-") == 0 ||
                strcmp(recipient_blood, "A+") == 0 ||
                strcmp(recipient_blood, "AB-") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    if (strcmp(donor_blood, "A+") == 0) {
        return (strcmp(recipient_blood, "A+") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    if (strcmp(donor_blood, "B-") == 0) {
        return (strcmp(recipient_blood, "B-") == 0 ||
                strcmp(recipient_blood, "B+") == 0 ||
                strcmp(recipient_blood, "AB-") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    if (strcmp(donor_blood, "B+") == 0) {
        return (strcmp(recipient_blood, "B+") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    if (strcmp(donor_blood, "AB-") == 0) {
        return (strcmp(recipient_blood, "AB-") == 0 ||
                strcmp(recipient_blood, "AB+") == 0);
    }
    if (strcmp(donor_blood, "AB+") == 0) {
        return (strcmp(recipient_blood, "AB+") == 0);
    }
    return false;
}

UrgencyLevel parse_urgency(const char* urgency_str) {
    if (!urgency_str) return URGENCY_STABLE;
    if (strstr(urgency_str, "Critical") || strstr(urgency_str, "1A")) return URGENCY_CRITICAL;
    if (strstr(urgency_str, "Urgent") || strstr(urgency_str, "1B")) return URGENCY_URGENT;
    if (strstr(urgency_str, "Moderate") || strstr(urgency_str, "Status 2")) return URGENCY_MODERATE;
    return URGENCY_STABLE;
}

const char* urgency_to_str(UrgencyLevel u) {
    switch (u) {
        case URGENCY_CRITICAL: return "Status 1A (Critical)";
        case URGENCY_URGENT:   return "Status 1B (Urgent)";
        case URGENCY_MODERATE: return "Status 2 (Moderate)";
        case URGENCY_STABLE:   return "Status 3 (Stable)";
        default:               return "Status 3 (Stable)";
    }
}

const char* eligibility_to_str(EligibilityStatus s) {
    switch (s) {
        case ELIGIBILITY_ELIGIBLE: return "Eligible for Further Review";
        case ELIGIBILITY_POTENTIALLY_ELIGIBLE: return "Potentially Eligible - Additional Assessment Required";
        case ELIGIBILITY_INELIGIBLE: return "Ineligible Under Current Rules";
        case ELIGIBILITY_INCOMPLETE: return "Assessment Incomplete";
        case ELIGIBILITY_CLINICAL_REVIEW_REQ: return "Clinical Review Required";
        default: return "Unknown";
    }
}
