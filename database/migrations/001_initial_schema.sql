-- OrganSync - Production PostgreSQL Database Schema Migration
-- Migration: 001_initial_schema.sql
-- Description: Core tables, foreign keys, indexes, triggers, and constraints

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HOSPITALS & TRANSPLANT CENTRES
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    centre_code VARCHAR(32) UNIQUE NOT NULL,
    facility_type VARCHAR(64) NOT NULL DEFAULT 'Transplant Center',
    city VARCHAR(128) NOT NULL,
    state VARCHAR(64) NOT NULL,
    country VARCHAR(64) NOT NULL DEFAULT 'USA',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS, ROLES & ACCESS CONTROL
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(64) REFERENCES roles(name),
    hospital_id VARCHAR(64) REFERENCES hospitals(id),
    department VARCHAR(128),
    license_number VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 3. CLINICAL POLICY VERSIONS
CREATE TABLE IF NOT EXISTS policy_versions (
    version VARCHAR(32) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    governing_body VARCHAR(128) NOT NULL,
    effective_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    rules_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DONOR REGISTRY
CREATE TABLE IF NOT EXISTS donors (
    id VARCHAR(64) PRIMARY KEY,
    donor_category VARCHAR(32) NOT NULL CHECK (donor_category IN ('Deceased', 'Living')),
    hospital_id VARCHAR(64) REFERENCES hospitals(id),
    age INT NOT NULL CHECK (age >= 0 AND age <= 120),
    gender VARCHAR(16) NOT NULL,
    blood_group VARCHAR(8) NOT NULL,
    consent_status VARCHAR(64) NOT NULL,
    authorization_details TEXT,
    responsible_physician_id VARCHAR(64) REFERENCES users(id),
    clinical_history TEXT,
    screening_status VARCHAR(64) NOT NULL DEFAULT 'Completed',
    hiv_test VARCHAR(16) DEFAULT 'Negative',
    hbv_test VARCHAR(16) DEFAULT 'Negative',
    hcv_test VARCHAR(16) DEFAULT 'Negative',
    cmv_test VARCHAR(16) DEFAULT 'Negative',
    ebv_test VARCHAR(16) DEFAULT 'Negative',
    status VARCHAR(48) NOT NULL DEFAULT 'Authorized',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DONATED ORGANS INVENTORY
CREATE TABLE IF NOT EXISTS organs (
    id VARCHAR(64) PRIMARY KEY,
    donor_id VARCHAR(64) REFERENCES donors(id) ON DELETE CASCADE,
    organ_type VARCHAR(32) NOT NULL,
    blood_group VARCHAR(8) NOT NULL,
    hospital_id VARCHAR(64) REFERENCES hospitals(id),
    current_location VARCHAR(255),
    procurement_timestamp TIMESTAMP WITH TIME ZONE,
    max_shelf_life_hours DOUBLE PRECISION NOT NULL,
    shelf_life_remaining_hours DOUBLE PRECISION NOT NULL,
    preservation_method VARCHAR(64) NOT NULL,
    preservation_medium VARCHAR(128),
    preservation_temp_c DOUBLE PRECISION DEFAULT 4.0,
    viability_status VARCHAR(64) NOT NULL DEFAULT 'Viable',
    clinical_specs JSONB, -- Organ-specific clinical measurements
    has_mandatory_tests BOOLEAN NOT NULL DEFAULT true,
    missing_tests TEXT,
    status VARCHAR(48) NOT NULL DEFAULT 'Available',
    assigned_recipient_id VARCHAR(64),
    allocation_case_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. RECIPIENT REGISTRY
CREATE TABLE IF NOT EXISTS recipients (
    id VARCHAR(64) PRIMARY KEY,
    hospital_id VARCHAR(64) REFERENCES hospitals(id),
    name VARCHAR(128) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(16) NOT NULL,
    required_organ VARCHAR(32) NOT NULL,
    blood_group VARCHAR(8) NOT NULL,
    urgency_tier VARCHAR(48) NOT NULL,
    waiting_list_reg_date TIMESTAMP WITH TIME ZONE NOT NULL,
    waiting_days INT NOT NULL DEFAULT 0,
    hla_a VARCHAR(32),
    hla_b VARCHAR(32),
    hla_dr VARCHAR(32),
    hla_requirement_score INT DEFAULT 85,
    pra_score INT DEFAULT 15,
    crossmatch_status VARCHAR(32) DEFAULT 'Negative',
    clinical_readiness BOOLEAN NOT NULL DEFAULT true,
    contraindications TEXT,
    last_reassessment TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(48) NOT NULL DEFAULT 'Active on Waiting List',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ALLOCATION CASES
CREATE TABLE IF NOT EXISTS allocation_cases (
    id VARCHAR(64) PRIMARY KEY,
    organ_id VARCHAR(64) REFERENCES organs(id),
    selected_recipient_id VARCHAR(64) REFERENCES recipients(id),
    status VARCHAR(64) NOT NULL DEFAULT 'Created',
    priority_rank INT,
    total_score DOUBLE PRECISION,
    clinical_decision VARCHAR(32) DEFAULT 'Pending Review',
    decision_reason TEXT,
    authorized_by VARCHAR(64) REFERENCES users(id),
    authorized_at TIMESTAMP WITH TIME ZONE,
    policy_version VARCHAR(32) REFERENCES policy_versions(version),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. WORKFLOW TRANSITIONS (AUDIT HISTORY)
CREATE TABLE IF NOT EXISTS workflow_transitions (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES allocation_cases(id) ON DELETE CASCADE,
    previous_state VARCHAR(64) NOT NULL,
    new_state VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) REFERENCES users(id),
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TRANSPORT OPERATIONS & CHECKPOINTS
CREATE TABLE IF NOT EXISTS transport_cases (
    id VARCHAR(64) PRIMARY KEY,
    allocation_case_id VARCHAR(64) REFERENCES allocation_cases(id),
    organ_id VARCHAR(64) REFERENCES organs(id),
    recipient_id VARCHAR(64) REFERENCES recipients(id),
    source_hospital_id VARCHAR(64) REFERENCES hospitals(id),
    dest_hospital_id VARCHAR(64) REFERENCES hospitals(id),
    transport_mode VARCHAR(64) NOT NULL,
    courier_callsign VARCHAR(128),
    current_checkpoint INT NOT NULL DEFAULT 1,
    current_status VARCHAR(64) NOT NULL DEFAULT 'Transport Scheduled',
    distance_km DOUBLE PRECISION NOT NULL,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    container_temp_c DOUBLE PRECISION DEFAULT 4.2,
    has_alert BOOLEAN NOT NULL DEFAULT false,
    alert_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport_checkpoints (
    id VARCHAR(64) PRIMARY KEY,
    transport_case_id VARCHAR(64) REFERENCES transport_cases(id) ON DELETE CASCADE,
    milestone_number INT NOT NULL,
    milestone_title VARCHAR(128) NOT NULL,
    planned_time TIMESTAMP WITH TIME ZONE,
    actual_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending',
    recorded_by VARCHAR(64) REFERENCES users(id),
    temperature_reading_c DOUBLE PRECISION,
    notes TEXT
);

-- 10. SURGICAL COORDINATION & IMPLANTATION
CREATE TABLE IF NOT EXISTS surgical_cases (
    id VARCHAR(64) PRIMARY KEY,
    allocation_case_id VARCHAR(64) REFERENCES allocation_cases(id),
    organ_id VARCHAR(64) REFERENCES organs(id),
    recipient_id VARCHAR(64) REFERENCES recipients(id),
    hospital_id VARCHAR(64) REFERENCES hospitals(id),
    lead_surgeon_id VARCHAR(64) REFERENCES users(id),
    scheduled_start TIMESTAMP WITH TIME ZONE,
    current_milestone VARCHAR(128) NOT NULL DEFAULT 'Preoperative Review',
    surgical_status VARCHAR(64) NOT NULL DEFAULT 'Scheduled',
    organ_receipt_confirmed BOOLEAN NOT NULL DEFAULT false,
    recipient_identity_verified BOOLEAN NOT NULL DEFAULT false,
    implantation_completed_at TIMESTAMP WITH TIME ZONE,
    initial_intraoperative_assessment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. POST-TRANSPLANT FOLLOW-UP & GRAFT OUTCOMES
CREATE TABLE IF NOT EXISTS follow_up_records (
    id VARCHAR(64) PRIMARY KEY,
    surgical_case_id VARCHAR(64) REFERENCES surgical_cases(id),
    recipient_id VARCHAR(64) REFERENCES recipients(id),
    milestone_interval VARCHAR(32) NOT NULL, -- 'Day 1', 'Day 7', 'Day 30', 'Month 3', 'Year 1'
    assessment_date DATE NOT NULL,
    graft_function_status VARCHAR(64) NOT NULL, -- 'Immediate Graft Function', 'Delayed Function', etc.
    complications TEXT,
    immunosuppression_regimen TEXT,
    clinician_id VARCHAR(64) REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. IMMUTABLE AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(64) PRIMARY KEY,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) REFERENCES users(id),
    actor_name VARCHAR(128) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    facility VARCHAR(128) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL
);

-- 13. NOTIFICATIONS & OPERATIONAL ALERTS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_user_id VARCHAR(64) REFERENCES users(id),
    recipient_role VARCHAR(64),
    severity VARCHAR(32) NOT NULL CHECK (severity IN ('Critical', 'Urgent', 'Standard', 'Informational')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_case_id VARCHAR(64),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR HIGH-THROUGHPUT CLINICAL QUERIES
CREATE INDEX idx_organs_status ON organs(status);
CREATE INDEX idx_organs_type ON organs(organ_type);
CREATE INDEX idx_recipients_status ON recipients(status);
CREATE INDEX idx_recipients_urgency ON recipients(urgency_tier);
CREATE INDEX idx_allocation_cases_status ON allocation_cases(status);
CREATE INDEX idx_transport_cases_status ON transport_cases(current_status);
CREATE INDEX idx_audit_events_target ON audit_events(target_id);
CREATE INDEX idx_audit_events_timestamp ON audit_events(event_timestamp);
