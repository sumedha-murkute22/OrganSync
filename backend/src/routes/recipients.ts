import { Router, Response } from 'express';
import { store, Recipient } from '../database/store';
import { AuthenticatedRequest, requireRoles } from '../middleware/auth';

const router = Router();

// GET all recipients with optional filtering
router.get('/', (req, res) => {
  const { organ, urgency, status } = req.query;
  let result = [...store.recipients];

  if (organ) {
    result = result.filter(r => r.organNeeded.toLowerCase() === (organ as string).toLowerCase());
  }
  if (urgency) {
    result = result.filter(r => r.urgency.toLowerCase().includes((urgency as string).toLowerCase()));
  }
  if (status) {
    result = result.filter(r => r.status.toLowerCase() === (status as string).toLowerCase());
  }

  res.json({ recipients: result });
});

// GET single recipient by ID
router.get('/:id', (req, res) => {
  const recipient = store.recipients.find(r => r.id === req.params.id);
  if (!recipient) {
    res.status(404).json({ error: 'Recipient not found' });
    return;
  }
  res.json({ recipient });
});

// POST register new recipient
router.post('/', requireRoles('System Administrator', 'Transplant Coordinator', 'Transplant Physician'), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const newRecipient: Recipient = {
    id: `REC-${store.recipients.length + 106}`,
    name: data.name || 'Candidate Name',
    age: Number(data.age) || 40,
    gender: data.gender || 'Male',
    organNeeded: data.organNeeded || 'Kidney',
    bloodGroup: data.bloodGroup || 'O+',
    urgency: data.urgency || 'Status 2 (Moderate)',
    registrationDate: new Date().toISOString(),
    waitingDays: Number(data.waitingDays) || 1,
    hlaMarkers: data.hlaMarkers || { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*15' },
    hlaRequirement: Number(data.hlaRequirement) || 85,
    praScore: Number(data.praScore) || 10,
    crossmatchStatus: data.crossmatchStatus || 'Negative',
    hospital: data.hospital || req.user?.hospital || 'St. Jude National Transplant Institute',
    city: data.city || 'Seattle, WA',
    coordinates: data.coordinates || { lat: 47.6062, lng: -122.3321 },
    clinicalReadiness: data.clinicalReadiness ?? true,
    status: 'Active on Waiting List',
    lastReassessment: new Date().toISOString(),
    medicalNotes: data.medicalNotes || 'Newly registered waitlist candidate.',
  };

  store.recipients.unshift(newRecipient);

  store.recordAuditEvent(
    'RECIPIENT_REGISTERED',
    req.user?.fullName || 'Clinician',
    req.user?.role || 'Transplant Coordinator',
    newRecipient.hospital,
    newRecipient.id,
    `Registered recipient ${newRecipient.name} (${newRecipient.id}): Organ needed: ${newRecipient.organNeeded}, Urgency: ${newRecipient.urgency}, Blood: ${newRecipient.bloodGroup}`
  );

  res.status(201).json({ recipient: newRecipient });
});

// PATCH update recipient urgency or clinical status
router.patch('/:id', requireRoles('System Administrator', 'Transplant Coordinator', 'Transplant Physician'), (req: AuthenticatedRequest, res: Response) => {
  const recipient = store.recipients.find(r => r.id === req.params.id);
  if (!recipient) {
    res.status(404).json({ error: 'Recipient not found' });
    return;
  }

  const { urgency, status, clinicalReadiness, crossmatchStatus, medicalNotes } = req.body;
  const oldUrgency = recipient.urgency;

  if (urgency) recipient.urgency = urgency;
  if (status) recipient.status = status;
  if (clinicalReadiness !== undefined) recipient.clinicalReadiness = Boolean(clinicalReadiness);
  if (crossmatchStatus) recipient.crossmatchStatus = crossmatchStatus;
  if (medicalNotes) recipient.medicalNotes = medicalNotes;
  recipient.lastReassessment = new Date().toISOString();

  store.recordAuditEvent(
    'RECIPIENT_CLINICAL_UPDATE',
    req.user?.fullName || 'Clinician',
    req.user?.role || 'Transplant Physician',
    recipient.hospital,
    recipient.id,
    `Clinical reassessment for ${recipient.id}: Urgency [${oldUrgency} -> ${recipient.urgency}], Readiness: ${recipient.clinicalReadiness}`
  );

  res.json({ recipient });
});

export default router;
