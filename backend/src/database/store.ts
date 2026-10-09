/**
 * OrganSync - Authoritative In-Memory Persistent Store
 * 
 * Provides validated records, synthetic clinical demonstration datasets,
 * status lifecycle transitions, and SHA-256 audited event logging.
 */

import crypto from 'crypto';

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

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'System Administrator' | 'Transplant Coordinator' | 'Transplant Surgeon' | 'Transplant Physician' | 'Transport Coordinator' | 'Clinical Auditor';
  hospital: string;
  department: string;
  licenseNumber: string;
}

export interface Donor {
  id: string;
  donorCategory: 'Deceased' | 'Living';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
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

export interface Organ {
  id: string;
  donorId: string;
  donorName?: string;
  donorAge: number;
  donorGender: 'Male' | 'Female' | 'Other';
  organType: 'Kidney' | 'Liver' | 'Heart' | 'Lungs' | 'Pancreas' | 'Intestine';
  bloodGroup: string;
  hlaMarkers: { hlaA: string; hlaB: string; hlaDR: string };
  hlaScore: number;
  hospital: string;
  city: string;
  coordinates: { lat: number; lng: number };
  donationTime: string;
  maxShelfLifeHours: number;
  shelfLifeRemainingHours: number;
  preservationMethod: string;
  preservationTempC: number;
  viabilityStatus: 'Optimal' | 'Borderline Viable' | 'Requires Specialized Review';
  clinicalSpecs: Record<string, any>;
  hasMandatoryTests: boolean;
  missingTests: string;
  status: 'Available' | 'Assessment In Progress' | 'Allocation Decision Pending' | 'Allocated' | 'In Transit' | 'Received' | 'Transplanted' | 'Expired';
  allocationCaseId?: string;
}

export interface Recipient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  organNeeded: 'Kidney' | 'Liver' | 'Heart' | 'Lungs' | 'Pancreas' | 'Intestine';
  bloodGroup: string;
  urgency: 'Status 1A (Critical)' | 'Status 1B (Urgent)' | 'Status 2 (Moderate)' | 'Status 3 (Stable)';
  registrationDate: string;
  waitingDays: number;
  hlaMarkers: { hlaA: string; hlaB: string; hlaDR: string };
  hlaRequirement: number;
  praScore: number;
  crossmatchStatus: 'Negative' | 'Positive' | 'Pending';
  hospital: string;
  city: string;
  coordinates: { lat: number; lng: number };
  clinicalReadiness: boolean;
  status: 'Active on Waiting List' | 'Candidate Under Review' | 'Allocation Accepted' | 'Transplant Scheduled' | 'Transplanted' | 'Temporarily Inactive';
  lastReassessment: string;
  medicalNotes: string;
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

export interface TransportCase {
  id: string;
  allocationCaseId: string;
  organId: string;
  recipientId: string;
  sourceHospital: string;
  destinationHospital: string;
  transportMode: 'Emergency Air Ambulance' | 'Medical Jet' | 'High-Speed Ground Unit' | 'Autonomous Drone';
  courierCallsign: string;
  distanceKm: number;
  estimatedArrival: string;
  actualArrival?: string;
  currentStatus: 'Scheduled' | 'Departed' | 'En Route' | 'Arrived' | 'Handover Complete' | 'Closed';
  containerTempC: number;
  hasAlert: boolean;
  alertDetails?: string;
  checkpoints: TransportCheckpoint[];
  createdAt: string;
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

class InMemoryDataStore {
  public users: User[] = [
    {
      id: 'USR-ADM',
      username: 'admin',
      email: 'admin@organsync.health',
      fullName: 'Dr. Katherine Bell, MD (Administrator)',
      role: 'System Administrator',
      hospital: 'St. Jude National Transplant Institute',
      department: 'Clinical Governance',
      licenseNumber: 'MD-89210-WA',
    },
    {
      id: 'USR-COORD',
      username: 'coordinator',
      email: 'coordinator@organsync.health',
      fullName: 'Sarah Jenkins, RN, CCTC',
      role: 'Transplant Coordinator',
      hospital: 'St. Jude National Transplant Institute',
      department: 'Organ Procurement & Matching',
      licenseNumber: 'RN-44120-WA',
    },
    {
      id: 'USR-SURG',
      username: 'surgeon',
      email: 'surgeon@organsync.health',
      fullName: 'Dr. James Sterling, MD, FACS',
      role: 'Transplant Surgeon',
      hospital: 'St. Jude National Transplant Institute',
      department: 'Division of Abdominal & Cardiothoracic Surgery',
      licenseNumber: 'MD-11904-WA',
    },
    {
      id: 'USR-PHYS',
      username: 'physician',
      email: 'physician@organsync.health',
      fullName: 'Dr. Robert Martinez, MD, FASN',
      role: 'Transplant Physician',
      hospital: 'St. Jude National Transplant Institute',
      department: 'Department of Nephrology & Critical Care',
      licenseNumber: 'MD-33012-WA',
    },
    {
      id: 'USR-TRN',
      username: 'transport',
      email: 'transport@organsync.health',
      fullName: 'Marcus Cole',
      role: 'Transport Coordinator',
      hospital: 'Pacific Northwest Emergency Medical Courier Hub',
      department: 'Aviation & Cold-Chain Logistics',
      licenseNumber: 'LOG-77319',
    },
    {
      id: 'USR-AUDIT',
      username: 'auditor',
      email: 'auditor@organsync.health',
      fullName: 'Patricia Alvarez, JD, CPHQ',
      role: 'Clinical Auditor',
      hospital: 'National Transplant Accreditation Board',
      department: 'Regulatory Compliance & Quality Audit',
      licenseNumber: 'CPHQ-99021',
    },
  ];

  public donors: Donor[] = [
    {
      id: 'DNR-801',
      donorCategory: 'Deceased',
      age: 32,
      gender: 'Male',
      bloodGroup: 'O+',
      hospital: 'St. Jude National Transplant Institute',
      city: 'Seattle, WA',
      consentStatus: 'Authorized',
      screeningStatus: 'Completed',
      infectiousScreening: { hiv: 'Negative', hbv: 'Negative', hcv: 'Negative', cmv: 'Negative', ebv: 'Negative' },
      responsiblePhysician: 'Dr. Robert Martinez, MD',
      registrationDate: '2026-10-08T18:00:00Z',
      status: 'Authorized',
      organsDonated: ['ORG-H001', 'ORG-K001', 'ORG-L001'],
    },
    {
      id: 'DNR-802',
      donorCategory: 'Deceased',
      age: 26,
      gender: 'Female',
      bloodGroup: 'A+',
      hospital: 'Memorial General Hospital',
      city: 'Portland, OR',
      consentStatus: 'Family Consent Confirmed',
      screeningStatus: 'Completed',
      infectiousScreening: { hiv: 'Negative', hbv: 'Negative', hcv: 'Negative', cmv: 'Negative', ebv: 'Negative' },
      responsiblePhysician: 'Dr. Katherine Bell, MD',
      registrationDate: '2026-10-09T02:30:00Z',
      status: 'Authorized',
      organsDonated: ['ORG-K002', 'ORG-LNG01'],
    },
    {
      id: 'DNR-803',
      donorCategory: 'Living',
      age: 38,
      gender: 'Female',
      bloodGroup: 'O-',
      hospital: 'St. Jude National Transplant Institute',
      city: 'Seattle, WA',
      consentStatus: 'Living Donor Independent Assessment Approved',
      screeningStatus: 'Completed',
      infectiousScreening: { hiv: 'Negative', hbv: 'Negative', hcv: 'Negative', cmv: 'Negative', ebv: 'Negative' },
      responsiblePhysician: 'Dr. James Sterling, MD',
      registrationDate: '2026-10-07T10:00:00Z',
      status: 'Authorized',
      organsDonated: ['ORG-K003'],
    },
  ];

  public organs: Organ[] = [
    {
      id: 'ORG-H001',
      donorId: 'DNR-801',
      donorName: 'Anonymous Deceased Donor #801',
      donorAge: 32,
      donorGender: 'Male',
      organType: 'Heart',
      bloodGroup: 'O+',
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*15' },
      hlaScore: 92,
      hospital: 'St. Jude National Transplant Institute',
      city: 'Seattle, WA',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      donationTime: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
      maxShelfLifeHours: 6.0,
      shelfLifeRemainingHours: 3.5,
      preservationMethod: 'Hypothermic Machine Perfusion (HMP)',
      preservationTempC: 3.8,
      viabilityStatus: 'Optimal',
      clinicalSpecs: {
        leftVentricularEjectionFraction: '62%',
        cardiacIndex: '3.1 L/min/m2',
        inotropicSupport: 'Minimal (Dobutamine 2 mcg/kg/min)',
        coronaryAnatomy: 'Normal, zero calcification on angiography',
      },
      hasMandatoryTests: true,
      missingTests: '',
      status: 'Allocation Decision Pending',
      allocationCaseId: 'CASE-ALC-701',
    },
    {
      id: 'ORG-K001',
      donorId: 'DNR-801',
      donorName: 'Anonymous Deceased Donor #801',
      donorAge: 32,
      donorGender: 'Male',
      organType: 'Kidney',
      bloodGroup: 'O+',
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*15' },
      hlaScore: 88,
      hospital: 'St. Jude National Transplant Institute',
      city: 'Seattle, WA',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      donationTime: new Date(Date.now() - 4.0 * 3600 * 1000).toISOString(),
      maxShelfLifeHours: 30.0,
      shelfLifeRemainingHours: 26.0,
      preservationMethod: 'Static Cold Storage (Belzer UW)',
      preservationTempC: 4.1,
      viabilityStatus: 'Optimal',
      clinicalSpecs: {
        laterality: 'Left Kidney',
        terminalCreatinine: '0.85 mg/dL',
        estimatedGFR: '105 mL/min/1.73m2',
        vascularAnatomy: 'Single renal artery, single renal vein, normal ureter',
        biopsyKarpinskiScore: '0/12',
      },
      hasMandatoryTests: true,
      missingTests: '',
      status: 'Available',
    },
    {
      id: 'ORG-L001',
      donorId: 'DNR-801',
      donorName: 'Anonymous Deceased Donor #801',
      donorAge: 32,
      donorGender: 'Male',
      organType: 'Liver',
      bloodGroup: 'O+',
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*15' },
      hlaScore: 85,
      hospital: 'St. Jude National Transplant Institute',
      city: 'Seattle, WA',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      donationTime: new Date(Date.now() - 3.2 * 3600 * 1000).toISOString(),
      maxShelfLifeHours: 12.0,
      shelfLifeRemainingHours: 8.8,
      preservationMethod: 'Normothermic Machine Perfusion (OrganOx Metra)',
      preservationTempC: 37.0,
      viabilityStatus: 'Optimal',
      clinicalSpecs: {
        graftType: 'Whole Liver Graft',
        macroscopicSteatosis: '< 5%',
        lactateClearanceRate: 'Rapid (down to 1.1 mmol/L)',
        bileProduction: '18 mL/hr, clear golden bile',
      },
      hasMandatoryTests: true,
      missingTests: '',
      status: 'Available',
    },
    {
      id: 'ORG-LNG01',
      donorId: 'DNR-802',
      donorName: 'Anonymous Deceased Donor #802',
      donorAge: 26,
      donorGender: 'Female',
      organType: 'Lungs',
      bloodGroup: 'A+',
      hlaMarkers: { hlaA: 'A*24', hlaB: 'B*35', hlaDR: 'DRB1*04' },
      hlaScore: 90,
      hospital: 'Memorial General Hospital',
      city: 'Portland, OR',
      coordinates: { lat: 45.5152, lng: -122.6784 },
      donationTime: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
      maxShelfLifeHours: 8.0,
      shelfLifeRemainingHours: 6.2,
      preservationMethod: 'Ex-Vivo Lung Perfusion (EVLP)',
      preservationTempC: 37.0,
      viabilityStatus: 'Optimal',
      clinicalSpecs: {
        offerType: 'Bilateral Lung Offer',
        pao2Fio2Ratio: '460 mmHg (100% O2, PEEP 5)',
        chestRadiograph: 'Clear bilateral lung fields, no consolidation',
        bronchoscopy: 'Clear airways, no purulent secretions',
      },
      hasMandatoryTests: true,
      missingTests: '',
      status: 'Available',
    },
  ];

  public recipients: Recipient[] = [
    {
      id: 'REC-101',
      name: 'Arthur Pendelton',
      age: 35,
      gender: 'Male',
      organNeeded: 'Heart',
      bloodGroup: 'A+',
      urgency: 'Status 1A (Critical)',
      registrationDate: '2025-08-14T09:00:00Z',
      waitingDays: 421,
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*15' },
      hlaRequirement: 90,
      praScore: 12,
      crossmatchStatus: 'Negative',
      hospital: 'Memorial General Hospital',
      city: 'Portland, OR',
      coordinates: { lat: 45.5152, lng: -122.6784 },
      clinicalReadiness: true,
      status: 'Active on Waiting List',
      lastReassessment: '2026-10-06T14:00:00Z',
      medicalNotes: 'NYHA Class IV end-stage non-ischemic cardiomyopathy. Dependent on intra-aortic balloon pump.',
    },
    {
      id: 'REC-102',
      name: 'Eleanor Vance',
      age: 42,
      gender: 'Female',
      organNeeded: 'Heart',
      bloodGroup: 'O+',
      urgency: 'Status 1B (Urgent)',
      registrationDate: '2025-11-20T11:00:00Z',
      waitingDays: 323,
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*08', hlaDR: 'DRB1*03' },
      hlaRequirement: 85,
      praScore: 18,
      crossmatchStatus: 'Negative',
      hospital: 'St. Jude National Transplant Institute',
      city: 'Seattle, WA',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      clinicalReadiness: true,
      status: 'Active on Waiting List',
      lastReassessment: '2026-10-08T09:30:00Z',
      medicalNotes: 'End-stage dilated cardiomyopathy with biventricular failure. Milrinone continuous infusion.',
    },
    {
      id: 'REC-103',
      name: 'Marcus Chen',
      age: 52,
      gender: 'Male',
      organNeeded: 'Kidney',
      bloodGroup: 'O+',
      urgency: 'Status 2 (Moderate)',
      registrationDate: '2024-04-10T08:30:00Z',
      waitingDays: 912,
      hlaMarkers: { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*15' },
      hlaRequirement: 88,
      praScore: 8,
      crossmatchStatus: 'Negative',
      hospital: 'St. Jude National Transplant Institute',
      city: 'Seattle, WA',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      clinicalReadiness: true,
      status: 'Active on Waiting List',
      lastReassessment: '2026-09-25T11:00:00Z',
      medicalNotes: 'Stage 5 CKD secondary to hypertensive nephrosclerosis on hemodialysis 3x weekly.',
    },
    {
      id: 'REC-104',
      name: 'Sarah Montgomery',
      age: 48,
      gender: 'Female',
      organNeeded: 'Liver',
      bloodGroup: 'O+',
      urgency: 'Status 1B (Urgent)',
      registrationDate: '2025-09-02T16:00:00Z',
      waitingDays: 402,
      hlaMarkers: { hlaA: 'A*01', hlaB: 'B*08', hlaDR: 'DRB1*04' },
      hlaRequirement: 82,
      praScore: 14,
      crossmatchStatus: 'Negative',
      hospital: 'Mercy Medical Center',
      city: 'Boise, ID',
      coordinates: { lat: 43.6150, lng: -116.2023 },
      clinicalReadiness: true,
      status: 'Active on Waiting List',
      lastReassessment: '2026-10-05T13:00:00Z',
      medicalNotes: 'Decompensated cirrhosis with refractory ascites and recurrent encephalopathy. MELD-Na score 31.',
    },
    {
      id: 'REC-105',
      name: 'David Wilson',
      age: 38,
      gender: 'Male',
      organNeeded: 'Lungs',
      bloodGroup: 'A+',
      urgency: 'Status 1A (Critical)',
      registrationDate: '2025-10-15T12:00:00Z',
      waitingDays: 359,
      hlaMarkers: { hlaA: 'A*24', hlaB: 'B*35', hlaDR: 'DRB1*04' },
      hlaRequirement: 90,
      praScore: 5,
      crossmatchStatus: 'Negative',
      hospital: 'Memorial General Hospital',
      city: 'Portland, OR',
      coordinates: { lat: 45.5152, lng: -122.6784 },
      clinicalReadiness: true,
      status: 'Active on Waiting List',
      lastReassessment: '2026-10-07T10:00:00Z',
      medicalNotes: 'Idiopathic pulmonary fibrosis with severe hypoxemia. High-flow oxygen requirement.',
    },
  ];

  public allocationCases: AllocationCase[] = [
    {
      id: 'CASE-ALC-701',
      organId: 'ORG-H001',
      recipientId: 'REC-101',
      status: 'Awaiting Allocation Decision',
      totalScore: 92.8,
      rank: 1,
      policyVersion: 'OPTN-POL-2026.4',
      createdAt: '2026-10-09T03:00:00Z',
      updatedAt: '2026-10-09T04:15:00Z',
      transitionHistory: [
        {
          previousState: 'Created',
          newState: 'Awaiting Clinical Assessment',
          actor: 'Sarah Jenkins, RN (Coordinator)',
          timestamp: '2026-10-09T03:00:00Z',
          reason: 'Organ offered from Donor DNR-801',
        },
        {
          previousState: 'Awaiting Clinical Assessment',
          newState: 'Matching in Progress',
          actor: 'System (C Engine Invoked)',
          timestamp: '2026-10-09T03:15:00Z',
          reason: 'C Engine evaluated 5 active heart waitlist candidates',
        },
        {
          previousState: 'Matching in Progress',
          newState: 'Candidate Review',
          actor: 'Sarah Jenkins, RN (Coordinator)',
          timestamp: '2026-10-09T03:30:00Z',
          reason: 'Arthur Pendelton ranked #1 (92.8 pts, Status 1A)',
        },
        {
          previousState: 'Candidate Review',
          newState: 'Awaiting Allocation Decision',
          actor: 'Sarah Jenkins, RN (Coordinator)',
          timestamp: '2026-10-09T04:15:00Z',
          reason: 'Forwarded to Surgical Lead for formal clinical authorization',
        },
      ],
    },
  ];

  public transportCases: TransportCase[] = [
    {
      id: 'TRN-501',
      allocationCaseId: 'CASE-ALC-701',
      organId: 'ORG-H001',
      recipientId: 'REC-101',
      sourceHospital: 'St. Jude National Transplant Institute (Seattle, WA)',
      destinationHospital: 'Memorial General Hospital (Portland, OR)',
      transportMode: 'Medical Jet',
      courierCallsign: 'MEDEVAC-ANGEL-44',
      distanceKm: 280.0,
      estimatedArrival: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(),
      currentStatus: 'Scheduled',
      containerTempC: 3.8,
      hasAlert: false,
      checkpoints: [
        { milestoneNumber: 1, milestoneTitle: 'Transport Request Created', status: 'Completed', plannedTime: '2026-10-09T04:00:00Z', actualTime: '2026-10-09T04:02:00Z', recordedBy: 'Sarah Jenkins, RN' },
        { milestoneNumber: 2, milestoneTitle: 'Transport Plan Confirmed', status: 'Completed', plannedTime: '2026-10-09T04:15:00Z', actualTime: '2026-10-09T04:14:00Z', recordedBy: 'Marcus Cole (Logistics)' },
        { milestoneNumber: 3, milestoneTitle: 'Receiving Centre Notified', status: 'In Progress', plannedTime: '2026-10-09T04:30:00Z', notes: 'ETA transmission in progress' },
        { milestoneNumber: 4, milestoneTitle: 'Procurement Readiness Confirmed', status: 'Upcoming', plannedTime: '2026-10-09T05:00:00Z' },
        { milestoneNumber: 5, milestoneTitle: 'Organ Procurement Completed', status: 'Upcoming', plannedTime: '2026-10-09T05:30:00Z' },
        { milestoneNumber: 6, milestoneTitle: 'Preservation Confirmed', status: 'Upcoming', plannedTime: '2026-10-09T05:45:00Z' },
        { milestoneNumber: 7, milestoneTitle: 'Packaging and Labelling Verified', status: 'Upcoming', plannedTime: '2026-10-09T06:00:00Z' },
        { milestoneNumber: 8, milestoneTitle: 'Dispatch Authorization Recorded', status: 'Upcoming', plannedTime: '2026-10-09T06:15:00Z' },
        { milestoneNumber: 9, milestoneTitle: 'Departed Procurement Centre', status: 'Upcoming', plannedTime: '2026-10-09T06:30:00Z' },
        { milestoneNumber: 10, milestoneTitle: 'En Route', status: 'Upcoming', plannedTime: '2026-10-09T06:45:00Z' },
        { milestoneNumber: 11, milestoneTitle: 'Intermediate Transit Checkpoint Reached', status: 'Upcoming', plannedTime: '2026-10-09T07:15:00Z' },
        { milestoneNumber: 12, milestoneTitle: 'Receiving Centre Notified of Revised ETA', status: 'Upcoming', plannedTime: '2026-10-09T07:30:00Z' },
        { milestoneNumber: 13, milestoneTitle: 'Arrived at Receiving Centre', status: 'Upcoming', plannedTime: '2026-10-09T07:45:00Z' },
        { milestoneNumber: 14, milestoneTitle: 'Package and Documentation Handover', status: 'Upcoming', plannedTime: '2026-10-09T07:55:00Z' },
        { milestoneNumber: 15, milestoneTitle: 'Preservation Condition Review', status: 'Upcoming', plannedTime: '2026-10-09T08:05:00Z' },
        { milestoneNumber: 16, milestoneTitle: 'Receiving Clinical Team Assessment', status: 'Upcoming', plannedTime: '2026-10-09T08:15:00Z' },
        { milestoneNumber: 17, milestoneTitle: 'Organ Accepted by Receiving Team', status: 'Upcoming', plannedTime: '2026-10-09T08:25:00Z' },
        { milestoneNumber: 18, milestoneTitle: 'Transferred to Surgical Team', status: 'Upcoming', plannedTime: '2026-10-09T08:35:00Z' },
        { milestoneNumber: 19, milestoneTitle: 'Transport Case Closed', status: 'Upcoming', plannedTime: '2026-10-09T08:45:00Z' },
      ],
      createdAt: '2026-10-09T04:00:00Z',
    },
  ];

  public surgicalCases: SurgicalCase[] = [
    {
      id: 'SURG-301',
      allocationCaseId: 'CASE-ALC-701',
      organId: 'ORG-H001',
      recipientId: 'REC-101',
      hospital: 'Memorial General Hospital',
      leadSurgeon: 'Dr. James Sterling, MD, FACS',
      scheduledStart: new Date(Date.now() + 3.0 * 3600 * 1000).toISOString(),
      currentMilestone: 'Preoperative Review',
      surgicalStatus: 'Scheduled',
      organReceiptConfirmed: false,
      recipientIdentityVerified: true,
      notes: 'Cardiothoracic OR 4 booked. Perfusionist and cardiac anesthesia teams on standby.',
      createdAt: '2026-10-09T04:15:00Z',
    },
  ];

  public followUps: FollowUpRecord[] = [
    {
      id: 'FOL-101',
      surgicalCaseId: 'SURG-299',
      recipientId: 'REC-098',
      recipientName: 'Claire Redfield',
      organType: 'Kidney',
      milestoneInterval: 'Day 30',
      assessmentDate: '2026-10-07',
      graftFunctionStatus: 'Immediate Graft Function',
      complications: 'No acute rejection episodes. Mild transient hypomagnesemia resolved.',
      immunosuppressionRegimen: 'Tacrolimus 3mg BID (trough 7.8 ng/mL) + Mycophenolate Mofetil 1000mg BID + Prednisone 5mg QD',
      clinician: 'Dr. Robert Martinez, MD',
      notes: 'Serum creatinine stable at 1.1 mg/dL. Normal renal allograft doppler resistive indices (0.62).',
    },
    {
      id: 'FOL-102',
      surgicalCaseId: 'SURG-285',
      recipientId: 'REC-077',
      recipientName: 'Gregory House',
      organType: 'Liver',
      milestoneInterval: 'Month 3',
      assessmentDate: '2026-10-05',
      graftFunctionStatus: 'Stable Graft Function',
      complications: 'None. Liver enzymes normalized.',
      immunosuppressionRegimen: 'Tacrolimus monotherapy (trough 6.2 ng/mL)',
      clinician: 'Dr. Katherine Bell, MD',
      notes: 'Total bilirubin 0.7 mg/dL, ALT 24 U/L, AST 22 U/L. Excellent synthetic function.',
    },
  ];

  public notifications: NotificationItem[] = [
    {
      id: 'NOTIF-01',
      severity: 'Critical',
      title: 'Allocation Awaiting Authorized Clinical Approval',
      message: 'Case CASE-ALC-701: Heart donor ORG-H001 matched to Arthur Pendelton. Surgical lead sign-off required.',
      linkCaseId: 'CASE-ALC-701',
      timestamp: '2026-10-09T04:15:00Z',
      isRead: false,
    },
    {
      id: 'NOTIF-02',
      severity: 'Urgent',
      title: 'Transport Dispatch Coordination Scheduled',
      message: 'Flight MEDEVAC-ANGEL-44 scheduled for organ transfer Seattle -> Portland.',
      linkCaseId: 'TRN-501',
      timestamp: '2026-10-09T04:10:00Z',
      isRead: false,
    },
    {
      id: 'NOTIF-03',
      severity: 'Standard',
      title: 'Living Donor Evaluation Approved',
      message: 'Living donor DNR-803 completed independent donor advocate assessment.',
      timestamp: '2026-10-09T02:00:00Z',
      isRead: true,
    },
  ];

  public auditLogs: AuditEvent[] = [
    {
      id: 'AUD-901',
      timestamp: '2026-10-09T03:00:00Z',
      event_type: 'ORGAN_REGISTERED',
      actor: 'Sarah Jenkins, RN',
      role: 'Transplant Coordinator',
      facility: 'St. Jude National Transplant Institute',
      target_id: 'ORG-H001',
      details: 'Registered donor heart ORG-H001 from deceased donor DNR-801 with 6.0h shelf life.',
      sha256_hash: 'd6a2f790cb93e62f02b37651c6c8c48a73516599db221c97a228491ef2364c12',
    },
    {
      id: 'AUD-902',
      timestamp: '2026-10-09T03:15:00Z',
      event_type: 'MATCHING_ENGINE_EXECUTED',
      actor: 'System (C Engine Invoked)',
      role: 'Automated Clinical Core',
      facility: 'St. Jude National Transplant Institute',
      target_id: 'ORG-H001',
      details: 'Executed C DSA matching engine. Evaluated 5 candidates using policy OPTN-POL-2026.4.',
      sha256_hash: '9e41b213b29c9586fc2d93e155bcab6f8e7b99c756209bbca1149e29a32c5251',
    },
    {
      id: 'AUD-903',
      timestamp: '2026-10-09T04:15:00Z',
      event_type: 'ALLOCATION_CASE_PREPARED',
      actor: 'Sarah Jenkins, RN',
      role: 'Transplant Coordinator',
      facility: 'St. Jude National Transplant Institute',
      target_id: 'CASE-ALC-701',
      details: 'Prepared case for surgical authorization: Arthur Pendelton (Score 92.8, Rank #1).',
      sha256_hash: '1b2a4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
    },
  ];

  public recordAuditEvent(
    eventType: string,
    actor: string,
    role: string,
    facility: string,
    targetId: string,
    details: string
  ): AuditEvent {
    const timestamp = new Date().toISOString();
    const raw = `${timestamp}:${eventType}:${actor}:${targetId}:${details}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');

    const entry: AuditEvent = {
      id: `AUD-${this.auditLogs.length + 904}`,
      timestamp,
      event_type: eventType,
      actor,
      role,
      facility,
      target_id: targetId,
      details,
      sha256_hash: hash,
    };

    this.auditLogs.unshift(entry);
    return entry;
  }
}

export const store = new InMemoryDataStore();
