import { Router, Response } from 'express';
import { store } from '../database/store';
import { CEngineService } from '../services/cEngineService';
import { AuthenticatedRequest, requireRoles } from '../middleware/auth';

const router = Router();

// POST run matching assessment for an organ offer
router.post('/assess', requireRoles('System Administrator', 'Transplant Coordinator', 'Transplant Surgeon'), async (req: AuthenticatedRequest, res: Response) => {
  const { organId } = req.body;

  let organ = store.organs.find(o => o.id === organId);
  if (!organ) {
    organ = store.organs[0]; // fallback to default first available organ
  }

  // Filter recipients who are actively waiting
  const candidates = store.recipients.filter(r => r.status === 'Active on Waiting List' || r.status === 'Candidate Under Review');

  try {
    const matchingResult = await CEngineService.runMatchingEngine(organ, candidates);

    store.recordAuditEvent(
      'MATCHING_ASSESSMENT_RUN',
      req.user?.fullName || 'Coordinator',
      req.user?.role || 'Transplant Coordinator',
      organ.hospital,
      organ.id,
      `Executed C matching engine for organ ${organ.id} (${organ.organType}, ${organ.bloodGroup}). Evaluated ${matchingResult.metrics?.total_evaluated || candidates.length} candidates. Top candidate: ${matchingResult.recommendations?.[0]?.recipient_name || 'None'}`
    );

    res.json({
      organ,
      matchingResult,
      policyVersion: 'OPTN-POL-2026.4',
      disclaimer: 'System-generated candidate recommendations require authorized clinical review. Algorithmic scores do not finalize clinical allocation decisions.',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Matching engine execution failure',
      details: error.message,
    });
  }
});

export default router;
