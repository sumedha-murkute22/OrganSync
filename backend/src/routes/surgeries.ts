import { Router, Response } from 'express';
import { store, SurgicalCase } from '../database/store';
import { AuthenticatedRequest, requireRoles } from '../middleware/auth';

const router = Router();

// GET all surgical cases
router.get('/', (req, res) => {
  res.json({ surgeries: store.surgicalCases });
});

// GET single surgical case
router.get('/:id', (req, res) => {
  const s = store.surgicalCases.find(item => item.id === req.params.id);
  if (!s) {
    res.status(404).json({ error: 'Surgical case not found' });
    return;
  }
  const organ = store.organs.find(o => o.id === s.organId);
  const recipient = store.recipients.find(r => r.id === s.recipientId);
  res.json({ surgery: s, organ, recipient });
});

// POST advance surgical milestone / record implantation (Surgeon only)
router.post('/:id/milestones', requireRoles('System Administrator', 'Transplant Surgeon'), (req: AuthenticatedRequest, res: Response) => {
  const s = store.surgicalCases.find(item => item.id === req.params.id);
  if (!s) {
    res.status(404).json({ error: 'Surgical case not found' });
    return;
  }

  const { milestone, surgicalStatus, notes } = req.body;
  if (milestone) s.currentMilestone = milestone;
  if (surgicalStatus) s.surgicalStatus = surgicalStatus;
  if (notes) s.notes = notes;

  if (milestone.toLowerCase().includes('implantation completed') || surgicalStatus === 'Implantation Completed') {
    s.implantationCompletedAt = new Date().toISOString();
    const organ = store.organs.find(o => o.id === s.organId);
    if (organ) organ.status = 'Transplanted';
    const recipient = store.recipients.find(r => r.id === s.recipientId);
    if (recipient) recipient.status = 'Transplanted';
  }

  store.recordAuditEvent(
    'SURGICAL_MILESTONE_RECORDED',
    req.user?.fullName || 'Surgeon',
    req.user?.role || 'Transplant Surgeon',
    s.hospital,
    s.id,
    `Operative Milestone updated: ${s.currentMilestone} (Status: ${s.surgicalStatus}). Surgeon: ${s.leadSurgeon}`
  );

  res.json({ surgery: s });
});

// POST verify organ receipt and recipient identification
router.post('/:id/verify', requireRoles('System Administrator', 'Transplant Surgeon'), (req: AuthenticatedRequest, res: Response) => {
  const s = store.surgicalCases.find(item => item.id === req.params.id);
  if (!s) {
    res.status(404).json({ error: 'Surgical case not found' });
    return;
  }

  const { organReceiptConfirmed, recipientIdentityVerified } = req.body;
  if (organReceiptConfirmed !== undefined) s.organReceiptConfirmed = Boolean(organReceiptConfirmed);
  if (recipientIdentityVerified !== undefined) s.recipientIdentityVerified = Boolean(recipientIdentityVerified);

  store.recordAuditEvent(
    'SURGICAL_VERIFICATION_CHECK',
    req.user?.fullName || 'Surgeon',
    req.user?.role || 'Transplant Surgeon',
    s.hospital,
    s.id,
    `Verified Case ${s.id}: Organ Receipt [${s.organReceiptConfirmed}], Recipient Identity Verification [${s.recipientIdentityVerified}]`
  );

  res.json({ surgery: s });
});

export default router;
