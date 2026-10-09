export type OrganType = 'Kidney' | 'Liver' | 'Heart' | 'Lungs' | 'Pancreas' | 'Intestine';

export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type UrgencyLevel = 
  | 'Status 1A (Critical)' 
  | 'Status 1B (Urgent)' 
  | 'Status 2 (Moderate)' 
  | 'Status 3 (Stable)';

export type OrganStatus = 
  | 'Available' 
  | 'Assessment In Progress'
  | 'Allocation Decision Pending'
  | 'Allocated' 
  | 'In Preservation'
  | 'Ready for Dispatch'
  | 'In Transit' 
  | 'Received'
  | 'Transplanted' 
  | 'Expired'
  | 'Not Suitable for Allocation';

export type RecipientStatus = 
  | 'Active on Waiting List' 
  | 'Candidate Under Review' 
  | 'Allocation Accepted' 
  | 'Transplant Scheduled'
  | 'Transplanted' 
  | 'Follow-up in Progress'
  | 'Temporarily Inactive'
  | 'Withdrawn';

export type UserRole =
  | 'System Administrator'
  | 'Transplant Coordinator'
  | 'Transplant Surgeon'
  | 'Transplant Physician'
  | 'Transport Coordinator'
  | 'Clinical Auditor';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  hospital: string;
  department: string;
  licenseNumber: string;
}

export interface HLAMarkers {
  hlaA: string;
  hlaB: string;
  hlaDR: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Donor {
  id: string;
  donorCategory: 'Deceased' | 'Living';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: BloodGroup;
  hospital: string;
  city: string;
  consentStatus: 'Authorized' | 'Family Consent Confirmed' | 'Living Donor Independent Assessment Approved';
  screeningStatus: 'Completed' | 'Pending Verification';
  infectiousScreening: {
    hiv: 'Negative' | 'Positive';
    hbv: 'Negative' | 'Positive';
    hcv: 'Negative' | 'Positive';
    cmv: 'Negative' | 'Positive';
    ebv: 'Negative' | 'Positive';
  };
  responsiblePhysician: string;
  registrationDate: string;
  status: 'Authorized' | 'Evaluation In Progress' | 'Procured' | 'Closed';
  organsDonated: string[];
}

export interface DonorOrgan {
  id: string;
  donorId: string;
  donorName?: string;
  donorAge: number;
  donorGender: 'Male' | 'Female' | 'Other';
  organType: OrganType;
  bloodGroup: BloodGroup;
  hlaMarkers: HLAMarkers;
  hlaScore: number;
  hospital: string;
  city: string;
  coordinates: Coordinates;
  donationTime: string;
  maxShelfLifeHours: number;
  shelfLifeRemainingHours: number;
  preservationMethod: string;
  preservationTempC: number;
  viabilityStatus: 'Optimal' | 'Borderline Viable' | 'Requires Specialized Review';
  clinicalSpecs?: Record<string, any>;
  hasMandatoryTests: boolean;
  missingTests: string;
  status: OrganStatus;
  allocationCaseId?: string;
  medicalNotes?: string;
}

export interface Recipient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  organNeeded: OrganType;
  bloodGroup: BloodGroup;
  urgency: UrgencyLevel;
  registrationDate: string;
  waitingDays: number;
  hlaMarkers: HLAMarkers;
  hlaRequirement: number;
  praScore: number;
  crossmatchStatus: 'Negative' | 'Positive' | 'Pending';
  hospital: string;
  city: string;
  coordinates: Coordinates;
  clinicalReadiness: boolean;
  status: RecipientStatus;
  lastReassessment: string;
  medicalNotes?: string;
}

export interface ScoreBreakdown {
  bloodScore: number;
  hlaScore: number;
  urgencyScore: number;
  shelfLifeScore: number;
  waitTimeScore: number;
  distanceScore: number;
  ageMatchScore: number;
}

export interface MatchResult {
  id: string;
  organId: string;
  recipientId: string;
  organ: DonorOrgan;
  recipient: Recipient;
  compatibilityScore: number;
  scoreBreakdown: ScoreBreakdown;
  distanceKm: number;
  shelfLifeRemainingHours: number;
  eligibilityStatus?: string;
  priorityCategory?: string;
  verifiedFindings?: string;
  outstandingTests?: string;
  supportingFactors?: string;
  cautionFactors?: string;
  reasons: string[];
  rank: number;
  status: 'Proposed' | 'Accepted' | 'Rejected' | 'In Transport' | 'Transplanted';
  createdAt: string;
}

export interface AllocationCase {
  id: string;
  organId: string;
  recipientId: string;
  status:
    | 'Created'
    | 'Awaiting Clinical Assessment'
    | 'Matching in Progress'
    | 'Candidate Review'
    | 'Awaiting Allocation Decision'
    | 'Allocation Approved'
    | 'Allocation Declined'
    | 'Procurement Coordination'
    | 'Ready for Dispatch'
    | 'In Transit'
    | 'Received at Destination'
    | 'Clinical Acceptance'
    | 'Surgery Scheduled'
    | 'Transplant in Progress'
    | 'Transplanted'
    | 'Follow-up in Progress'
    | 'Closed';
  totalScore: number;
  rank: number;
  decisionReason?: string;
  authorizedBy?: string;
  authorizedAt?: string;
  policyVersion: string;
  createdAt: string;
  updatedAt: string;
  transitionHistory: Array<{
    previousState: string;
    newState: string;
    actor: string;
    timestamp: string;
    reason: string;
  }>;
}

export type TransportStage = 
  | 'Transport Request Created' 
  | 'Transport Plan Confirmed'
  | 'En Route' 
  | 'Arrived at Destination' 
  | 'Handover Complete' 
  | 'Completed';

export interface TransportCheckpoint {
  milestoneNumber: number;
  milestoneTitle: string;
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'Delayed' | 'Escalated';
  plannedTime: string;
  actualTime?: string;
  recordedBy?: string;
  temperatureC?: number;
  notes?: string;
}

export interface TransportQueueItem {
  id: string;
  allocationCaseId?: string;
  matchId?: string;
  organId: string;
  recipientId: string;
  organType: OrganType;
  bloodGroup: BloodGroup;
  sourceHospital: string;
  sourceCity?: string;
  destinationHospital: string;
  destinationCity?: string;
  distanceKm: number;
  stage: TransportStage;
  estimatedArrival: string;
  courierType: 'Emergency Air Ambulance' | 'Medical Jet' | 'High-Speed Ground Unit' | 'Autonomous Drone';
  priorityLevel: 'Tier 1 Critical' | 'Tier 2 Urgent' | 'Tier 3 Standard';
  enqueuedAt: string;
  containerTempC: number;
  hasAlert: boolean;
  alertDetails?: string;
  checkpoints?: TransportCheckpoint[];
  logs?: Array<{ timestamp: string; message: string; stage: string }>;
}

export interface SurgicalCase {
  id: string;
  allocationCaseId: string;
  organId: string;
  recipientId: string;
  hospital: string;
  leadSurgeon: string;
  scheduledStart: string;
  currentMilestone: string;
  surgicalStatus: 'Scheduled' | 'Pre-Op Cleared' | 'Surgery in Progress' | 'Implantation Completed' | 'Procedure Completed';
  organReceiptConfirmed: boolean;
  recipientIdentityVerified: boolean;
  implantationCompletedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface FollowUpRecord {
  id: string;
  surgicalCaseId: string;
  recipientId: string;
  recipientName: string;
  organType: string;
  milestoneInterval: 'Day 1' | 'Day 7' | 'Day 30' | 'Month 3' | 'Year 1';
  assessmentDate: string;
  graftFunctionStatus: 'Immediate Graft Function' | 'Delayed Graft Function' | 'Stable Graft Function' | 'Primary Non-Function';
  complications: string;
  immunosuppressionRegimen: string;
  clinician: string;
  notes: string;
}

export interface NotificationItem {
  id: string;
  severity: 'Critical' | 'Urgent' | 'Standard' | 'Informational';
  title: string;
  message: string;
  linkCaseId?: string;
  timestamp: string;
  isRead: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  event_type: string;
  actor: string;
  role: string;
  facility: string;
  target_id: string;
  details: string;
  sha256_hash: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'organ' | 'recipient';
  organType: OrganType;
  bloodGroup: BloodGroup;
  urgencyOrShelfLife: string;
  hospital: string;
  data: DonorOrgan | Recipient;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  isOptimalMatch: boolean;
  scoreBreakdown: ScoreBreakdown;
}

export interface BipartiteGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
