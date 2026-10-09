import { Router, Response } from 'express';
import { store } from '../database/store';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => {
  const { username, role } = req.body;
  
  let user = store.users.find(u => u.username === username || u.email === username);
  if (!user && role) {
    user = store.users.find(u => u.role.toLowerCase() === role.toLowerCase());
  }
  if (!user) {
    user = store.users[0]; // fallback to admin for demo convenience
  }

  store.recordAuditEvent(
    'USER_LOGIN',
    user.fullName,
    user.role,
    user.hospital,
    user.id,
    `User ${user.fullName} authenticated successfully.`
  );

  res.json({
    token: user.id,
    user,
    roles: store.users.map(u => ({ id: u.id, role: u.role, fullName: u.fullName, email: u.email })),
  });
});

router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    store.recordAuditEvent(
      'USER_LOGOUT',
      req.user.fullName,
      req.user.role,
      req.user.hospital,
      req.user.id,
      `User ${req.user.fullName} logged out.`
    );
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
    availableRoles: store.users.map(u => ({ id: u.id, role: u.role, fullName: u.fullName, email: u.email })),
  });
});

router.post('/switch-role', (req, res) => {
  const { role } = req.body;
  const user = store.users.find(u => u.role.toLowerCase() === (role || '').toLowerCase());
  if (!user) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }

  store.recordAuditEvent(
    'ROLE_SWITCH',
    user.fullName,
    user.role,
    user.hospital,
    user.id,
    `Session switched to role: ${user.role}`
  );

  res.json({ token: user.id, user });
});

export default router;
