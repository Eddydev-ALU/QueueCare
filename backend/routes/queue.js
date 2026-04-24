const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// GET /api/queue/today  — all roles can view today's queue
router.get('/today', auth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const queue = db
    .prepare(`
      SELECT a.*, u.name AS patient_name, u.email AS patient_email
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      WHERE a.date = ? AND a.status != 'cancelled'
      ORDER BY a.queue_number ASC
    `)
    .all(today);
  res.json(queue);
});

// PATCH /api/queue/:id/serve  — staff and admin only
router.patch('/:id/serve', auth, roles('staff', 'admin'), (req, res) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);

  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

  if (appointment.status === 'served') {
    return res.status(400).json({ error: 'Patient already marked as served' });
  }

  db.prepare("UPDATE appointments SET status = 'served' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Patient marked as served' });
});

module.exports = router;
