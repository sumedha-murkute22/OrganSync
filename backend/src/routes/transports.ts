import { Router, Response } from 'express';
import { store, TransportCase } from '../database/store';
import { AuthenticatedRequest, requireRoles } from '../middleware/auth';

const router = Router();

// GET all transport cases
router.get('/', (req, res) => {
  res.json({ transports: store.transportCases });
});

// GET single transport case
router.get('/:id', (req, res) => {
  const t = store.transportCases.find(item => item.id === req.params.id);
  if (!t) {
    res.status(404).json({ error: 'Transport case not found' });
    return;
  }
  const organ = store.organs.find(o => o.id === t.organId);
  const recipient = store.recipients.find(r => r.id === t.recipientId);
  res.json({ transport: t, organ, recipient });
});

// POST record / advance checkpoint
router.post('/:id/checkpoints', requireRoles('System Administrator', 'Transplant Coordinator', 'Transport Coordinator'), (req: AuthenticatedRequest, res: Response) => {
  const t = store.transportCases.find(item => item.id === req.params.id);
  if (!t) {
    res.status(404).json({ error: 'Transport case not found' });
    return;
  }

  const { milestoneNumber, status, temperatureC, notes } = req.body;
  const num = Number(milestoneNumber);
  const cp = t.checkpoints.find(c => c.milestoneNumber === num);

  if (cp) {
    cp.status = status || 'Completed';
    cp.actualTime = new Date().toISOString();
    cp.recordedBy = req.user?.fullName || 'Transport Officer';
    if (temperatureC !== undefined) {
      cp.temperatureC = Number(temperatureC);
      t.containerTempC = Number(temperatureC);
    }
    if (notes) cp.notes = notes;
  }

  // Update current transport status based on milestone
  if (num >= 9 && num < 13) {
    t.currentStatus = 'En Route';
  } else if (num >= 13 && num < 18) {
    t.currentStatus = 'Arrived';
  } else if (num >= 18) {
    t.currentStatus = 'Handover Complete';
  }

  store.recordAuditEvent(
    'TRANSPORT_CHECKPOINT_RECORDED',
    req.user?.fullName || 'Transport Lead',
    req.user?.role || 'Transport Coordinator',
    t.sourceHospital,
    t.id,
    `Checkpoint #${num} (${cp?.milestoneTitle || 'Milestone'}) updated to ${status}. Container Temp: ${t.containerTempC}°C`
  );

  res.json({ transport: t });
});

// POST toggle or record operational alert
router.post('/:id/alert', requireRoles('System Administrator', 'Transport Coordinator', 'Transplant Coordinator'), (req: AuthenticatedRequest, res: Response) => {
  const t = store.transportCases.find(item => item.id === req.params.id);
  if (!t) {
    res.status(404).json({ error: 'Transport case not found' });
    return;
  }

  const { hasAlert, alertDetails } = req.body;
  t.hasAlert = Boolean(hasAlert);
  t.alertDetails = alertDetails || '';

  store.recordAuditEvent(
    'TRANSPORT_ALERT_UPDATED',
    req.user?.fullName || 'Coordinator',
    req.user?.role || 'Transport Coordinator',
    t.sourceHospital,
    t.id,
    `Transport Alert [${t.hasAlert ? 'RAISED' : 'RESOLVED'}]: ${t.alertDetails}`
  );

  res.json({ transport: t });
});

export default router;
