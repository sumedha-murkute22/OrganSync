/**
 * OrganSync - Production Healthcare Operations Backend Entrypoint
 * 
 * Coordinates donor registration, organ inventory, compatibility evaluation,
 * urgency-based C matching engine execution, cold-chain transport, surgical tracking,
 * and immutable audit governance.
 */

import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';

import authRoutes from './routes/auth';
import donorsRoutes from './routes/donors';
import organsRoutes from './routes/organs';
import recipientsRoutes from './routes/recipients';
import matchingRoutes from './routes/matching';
import allocationsRoutes from './routes/allocations';
import transportsRoutes from './routes/transports';
import surgeriesRoutes from './routes/surgeries';
import outcomesRoutes from './routes/outcomes';
import notificationsRoutes from './routes/notifications';
import auditRoutes from './routes/audit';
import dsaRoutes from './routes/dsa';
import reportsRoutes from './routes/reports';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-organsync-role'],
}));

app.use(express.json());

// Global Authentication Middleware
app.use(authMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'OrganSync Clinical Backend',
    c_engine_status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

// Mount Clinical & Administrative Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorsRoutes);
app.use('/api/organs', organsRoutes);
app.use('/api/recipients', recipientsRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/allocations', allocationsRoutes);
app.use('/api/transports', transportsRoutes);
app.use('/api/surgeries', surgeriesRoutes);
app.use('/api/outcomes', outcomesRoutes);
app.use('/api/follow-ups', outcomesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/audit-events', auditRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/reports', reportsRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[OrganSync Error]', err);
  res.status(500).json({
    error: 'Internal Clinical Service Error',
    message: err.message || 'An unexpected server error occurred.',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=================================================================`);
    console.log(`  ORGANSYNC CLINICAL OPERATIONS BACKEND ONLINE                  `);
    console.log(`  Port: http://localhost:${PORT}                                 `);
    console.log(`  Engine: Native C11/C17 DSA Integration Enabled                `);
    console.log(`=================================================================`);
  });
}

export default app;
