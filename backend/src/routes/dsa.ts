import { Router, Request, Response } from 'express';
import { CEngineService } from '../services/cEngineService';

const router = Router();

// Test execution endpoint invoking C unit test suite
router.get('/test', async (req: Request, res: Response) => {
  try {
    const result = await CEngineService.runTests();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Routing endpoint querying Dijkstra shortest route
router.post('/route', async (req: Request, res: Response) => {
  const { source, destination } = req.body;
  if (!source || !destination) {
    res.status(400).json({ error: 'Source and destination facilities are required' });
    return;
  }

  try {
    const route = await CEngineService.calculateRoute(source, destination);
    res.json({ route });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Engine information endpoint
router.get('/status', (req: Request, res: Response) => {
  res.json({
    engine: 'OrganSync C Core DSA Engine',
    version: '2.4.0',
    standard: 'C11 / C17 Native Implementation',
    modules: [
      { name: 'Stack', purpose: 'LIFO Case Review History & Reversible Workflow State' },
      { name: 'Queue', purpose: 'FIFO Transport Dispatch & Coordination Tasks' },
      { name: 'Hash Table', purpose: 'DJB2 O(1) Record Lookups with Separate Chaining' },
      { name: 'Priority Queue', purpose: 'Binary Max-Heap Candidate Urgency & Min-Heap Shelf Life' },
      { name: 'Graph', purpose: 'Adjacency List & Dijkstra Logistics Routing' },
      { name: 'Compatibility', purpose: 'ABO/Rh Blood Matrix & HLA Locus Matching' },
      { name: 'Matching Engine', purpose: '6-Stage Clinical Evaluation Pipeline' },
    ],
    status: 'Operational',
  });
});

export default router;
