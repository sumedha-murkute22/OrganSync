import { Router, Response } from 'express';
import { store, FollowUpRecord } from '../database/store';
import { AuthenticatedRequest, requireRoles } from '../middleware/auth';

const router = Router();

// GET all follow-up records
router.get('/', (req, res) => {
  res.json({ followUps: store.followUps });
});

// POST record follow-up milestone assessment
router.post('/', requireRoles('System Administrator', 'Transplant Physician', 'Transplant Surgeon'), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const newFollowUp: FollowUpRecord = {
    id: `FOL-${store.followUps.length + 103}`,
    surgicalCaseId: data.surgicalCaseId || 'SURG-301',
    recipientId: data.recipientId || 'REC-101',
    recipientName: data.recipientName || 'Recipient Patient',
    organType: data.organType || 'Heart',
    milestoneInterval: data.milestoneInterval || 'Day 7',
    assessmentDate: data.assessmentDate || new Date().toISOString().split('T')[0],
    graftFunctionStatus: data.graftFunctionStatus || 'Immediate Graft Function',
    complications: data.complications || 'None reported.',
    immunosuppressionRegimen: data.immunosuppressionRegimen || 'Standard Triple Therapy (CNI + Antimetabolite + Corticosteroid)',
    clinician: req.user?.fullName || 'Transplant Physician',
    notes: data.notes || 'Normal routine clinical follow-up visit.',
  };

  store.followUps.unshift(newFollowUp);

  store.recordAuditEvent(
    'FOLLOW_UP_OUTCOME_RECORDED',
    req.user?.fullName || 'Physician',
    req.user?.role || 'Transplant Physician',
    req.user?.hospital || 'Hospital',
    newFollowUp.id,
    `Recorded ${newFollowUp.milestoneInterval} follow-up for ${newFollowUp.recipientName} (${newFollowUp.organType}). Graft status: ${newFollowUp.graftFunctionStatus}`
  );

  res.status(201).json({ followUp: newFollowUp });
});

export default router;
