import { Router } from 'express';
import { store } from '../database/store';

const router = Router();

// GET all notifications
router.get('/', (req, res) => {
  res.json({ notifications: store.notifications });
});

// POST mark notification as read
router.post('/:id/read', (req, res) => {
  const notif = store.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
  }
  res.json({ success: true, notification: notif });
});

export default router;
