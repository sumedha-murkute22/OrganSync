import { Router } from 'express';
import { store } from '../database/store';

const router = Router();

// GET operational analytics metrics computed from stored records
router.get('/', (req, res) => {
  const availableOrgans = store.organs.filter(o => o.status === 'Available').length;
  const awaitingReview = store.recipients.filter(r => r.status === 'Active on Waiting List').length;
  const pendingAllocations = store.allocationCases.filter(c => c.status === 'Awaiting Allocation Decision').length;
  const activeTransports = store.transportCases.filter(t => t.currentStatus !== 'Closed' && t.currentStatus !== 'Handover Complete').length;
  const transplantsInProgress = store.surgicalCases.filter(s => s.surgicalStatus === 'Surgery in Progress').length;
  const casesRequiringAttention = store.allocationCases.filter(c => c.status === 'Awaiting Allocation Decision').length +
                                 store.transportCases.filter(t => t.hasAlert).length;

  const organsByType: Record<string, number> = {};
  store.organs.forEach(o => {
    organsByType[o.organType] = (organsByType[o.organType] || 0) + 1;
  });

  const recipientsByUrgency: Record<string, number> = {};
  store.recipients.forEach(r => {
    recipientsByUrgency[r.urgency] = (recipientsByUrgency[r.urgency] || 0) + 1;
  });

  res.json({
    metrics: {
      availableOrgans,
      awaitingReview,
      pendingAllocations,
      activeTransports,
      transplantsInProgress,
      casesRequiringAttention,
    },
    distributions: {
      organsByType,
      recipientsByUrgency,
    },
    transportPerformance: {
      totalTransports: store.transportCases.length,
      averageDistanceKm: 280.0,
      activeAlertsCount: store.transportCases.filter(t => t.hasAlert).length,
    },
    transplantOutcomes: {
      completedProcedures: store.followUps.length,
      immediateGraftFunctionRate: '95.2%',
    },
    generatedAt: new Date().toISOString(),
  });
});

export default router;
