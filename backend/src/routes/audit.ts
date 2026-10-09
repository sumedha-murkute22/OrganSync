import { Router } from 'express';
import { store } from '../database/store';
import { requireRoles } from '../middleware/auth';

const router = Router();

// GET all immutable audit logs (Auditors, Admins)
router.get('/', requireRoles('System Administrator', 'Clinical Auditor', 'Transplant Coordinator'), (req, res) => {
  res.json({
    totalEvents: store.auditLogs.length,
    auditLogs: store.auditLogs,
  });
});

export default router;
