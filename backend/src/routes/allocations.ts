import { Router, Response } from 'express';
import { store, AllocationCase } from '../database/store';
import { AuthenticatedRequest, requireRoles } from '../middleware/auth';

const router = Router();

// GET all allocation cases
router.get('/', (req, res) => {
  res.json({ cases: store.allocationCases });
});

// GET single allocation case
router.get('/:id', (req, res) => {
  const c = store.allocationCases.find(item => item.id === req.params.id);
  if (!c) {
    res.status(404).json({ error: 'Allocation case not found' });
    return;
  }
  const organ = store.organs.find(o => o.id === c.organId);
  const recipient = store.recipients.find(r => r.id === c.recipientId);
  const transport = store.transportCases.find(t => t.allocationCaseId === c.id);
  const surgery = store.surgicalCases.find(s => s.allocationCaseId === c.id);

  res.json({ case: c, organ, recipient, transport, surgery });
});

// POST create new allocation case
router.post('/', requireRoles('System Administrator', 'Transplant Coordinator'), (req: AuthenticatedRequest, res: Response) => {
  const { organId, recipientId, totalScore, rank } = req.body;

  const organ = store.organs.find(o => o.id === organId);
  const recipient = store.recipients.find(r => r.id === recipientId);

  if (!organ || !recipient) {
    res.status(400).json({ error: 'Invalid organ or recipient ID' });
    return;
  }

  const newCase: AllocationCase = {
    id: `CASE-ALC-${store.allocationCases.length + 702}`,
    organId,
    recipientId,
    status: 'Awaiting Allocation Decision',
    totalScore: Number(totalScore) || 90.0,
    rank: Number(rank) || 1,
    policyVersion: 'OPTN-POL-2026.4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transitionHistory: [
      {
        previousState: 'Created',
        newState: 'Awaiting Allocation Decision',
        actor: req.user?.fullName || 'Coordinator',
        timestamp: new Date().toISOString(),
        reason: `Prepared candidate ${recipient.name} for organ ${organ.organType} (Score: ${totalScore})`,
      },
    ],
  };

  store.allocationCases.unshift(newCase);
  organ.allocationCaseId = newCase.id;
  organ.status = 'Allocation Decision Pending';
  recipient.status = 'Candidate Under Review';

  store.recordAuditEvent(
    'ALLOCATION_CASE_CREATED',
    req.user?.fullName || 'Coordinator',
    req.user?.role || 'Transplant Coordinator',
    organ.hospital,
    newCase.id,
    `Created allocation case ${newCase.id} for organ ${organ.id} -> recipient ${recipient.id}`
  );

  res.status(201).json({ case: newCase });
});

// POST approve allocation decision (Requires clinical authorization by Surgeon or Coordinator)
router.post('/:id/approve', requireRoles('System Administrator', 'Transplant Coordinator', 'Transplant Surgeon'), (req: AuthenticatedRequest, res: Response) => {
  const c = store.allocationCases.find(item => item.id === req.params.id);
  if (!c) {
    res.status(404).json({ error: 'Allocation case not found' });
    return;
  }

  const { reason } = req.body;
  const previousState = c.status;
  c.status = 'Allocation Approved';
  c.authorizedBy = req.user?.fullName || 'Clinical Lead';
  c.authorizedAt = new Date().toISOString();
  c.decisionReason = reason || 'Clinical compatibility and operative readiness confirmed by transplant team.';
  c.updatedAt = new Date().toISOString();

  c.transitionHistory.push({
    previousState,
    newState: 'Allocation Approved',
    actor: req.user?.fullName || 'Transplant Lead',
    timestamp: new Date().toISOString(),
    reason: c.decisionReason,
  });

  const organ = store.organs.find(o => o.id === c.organId);
  if (organ) organ.status = 'Allocated';

  const recipient = store.recipients.find(r => r.id === c.recipientId);
  if (recipient) recipient.status = 'Allocation Accepted';

  // Automatically instantiate or advance transport case
  let transport = store.transportCases.find(t => t.allocationCaseId === c.id);
  if (!transport && organ && recipient) {
    transport = {
      id: `TRN-${store.transportCases.length + 502}`,
      allocationCaseId: c.id,
      organId: organ.id,
      recipientId: recipient.id,
      sourceHospital: organ.hospital,
      destinationHospital: recipient.hospital,
      transportMode: 'Medical Jet',
      courierCallsign: `MEDEVAC-ALPHA-${Math.floor(Math.random() * 90 + 10)}`,
      distanceKm: 280.0,
      estimatedArrival: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      currentStatus: 'Scheduled',
      containerTempC: 3.9,
      hasAlert: false,
      checkpoints: [
        { milestoneNumber: 1, milestoneTitle: 'Transport Request Created', status: 'Completed', plannedTime: new Date().toISOString(), actualTime: new Date().toISOString(), recordedBy: req.user?.fullName },
        { milestoneNumber: 2, milestoneTitle: 'Transport Plan Confirmed', status: 'In Progress', plannedTime: new Date(Date.now() + 15 * 60 * 1000).toISOString() },
        { milestoneNumber: 3, milestoneTitle: 'Receiving Centre Notified', status: 'Upcoming', plannedTime: new Date(Date.now() + 30 * 60 * 1000).toISOString() },
        { milestoneNumber: 4, milestoneTitle: 'Organ Procurement Completed', status: 'Upcoming', plannedTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
        { milestoneNumber: 5, milestoneTitle: 'Package and Documentation Handover', status: 'Upcoming', plannedTime: new Date(Date.now() + 120 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date().toISOString(),
    };
    store.transportCases.unshift(transport);
  }

  store.recordAuditEvent(
    'ALLOCATION_APPROVED',
    req.user?.fullName || 'Surgeon',
    req.user?.role || 'Transplant Surgeon',
    organ?.hospital || 'Hospital',
    c.id,
    `Allocation Approved for Case ${c.id}: ${c.decisionReason}. Authorized by: ${c.authorizedBy}`
  );

  res.json({ case: c, transport });
});

// POST decline candidate (with mandatory clinical justification)
router.post('/:id/decline', requireRoles('System Administrator', 'Transplant Coordinator', 'Transplant Surgeon'), (req: AuthenticatedRequest, res: Response) => {
  const c = store.allocationCases.find(item => item.id === req.params.id);
  if (!c) {
    res.status(404).json({ error: 'Allocation case not found' });
    return;
  }

  const { reason } = req.body;
  if (!reason) {
    res.status(400).json({ error: 'A clinically documented reason is required to decline a recommended candidate.' });
    return;
  }

  const previousState = c.status;
  c.status = 'Allocation Declined';
  c.decisionReason = reason;
  c.updatedAt = new Date().toISOString();

  c.transitionHistory.push({
    previousState,
    newState: 'Allocation Declined',
    actor: req.user?.fullName || 'Clinician',
    timestamp: new Date().toISOString(),
    reason,
  });

  const organ = store.organs.find(o => o.id === c.organId);
  if (organ) organ.status = 'Available'; // return organ to available pool for next candidate

  store.recordAuditEvent(
    'ALLOCATION_DECLINED',
    req.user?.fullName || 'Clinician',
    req.user?.role || 'Transplant Coordinator',
    organ?.hospital || 'Hospital',
    c.id,
    `Candidate declined for Case ${c.id}. Justification: ${reason}`
  );

  res.json({ case: c });
});

// PATCH transition case state along controlled clinical lifecycle
router.patch('/:id/transition', requireRoles('System Administrator', 'Transplant Coordinator', 'Transplant Surgeon'), (req: AuthenticatedRequest, res: Response) => {
  const c = store.allocationCases.find(item => item.id === req.params.id);
  if (!c) {
    res.status(404).json({ error: 'Allocation case not found' });
    return;
  }

  const { targetState, reason } = req.body;
  const previousState = c.status;
  c.status = targetState;
  c.updatedAt = new Date().toISOString();

  c.transitionHistory.push({
    previousState,
    newState: targetState,
    actor: req.user?.fullName || 'Clinician',
    timestamp: new Date().toISOString(),
    reason: reason || 'Workflow transition advanced.',
  });

  store.recordAuditEvent(
    'WORKFLOW_STATE_TRANSITION',
    req.user?.fullName || 'Clinician',
    req.user?.role || 'Transplant Coordinator',
    'Facility',
    c.id,
    `Case ${c.id} transitioned: [${previousState} -> ${targetState}]. Reason: ${reason || 'N/A'}`
  );

  res.json({ case: c });
});

export default router;
