const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

const appointmentWithPatient = `
  SELECT a.*, u.name AS patient_name, u.email AS patient_email
  FROM appointments a
  JOIN users u ON a.patient_id = u.id
`;

// GET /api/appointments
router.get('/', auth, (req, res) => {
  let rows;
  if (req.user.role === 'patient') {
    rows = db
      .prepare(`${appointmentWithPatient} WHERE a.patient_id = ? ORDER BY a.date DESC, a.queue_number ASC`)
      .all(req.user.id);
  } else {
    rows = db
      .prepare(`${appointmentWithPatient} ORDER BY a.date DESC, a.queue_number ASC`)
      .all();
  }
  res.json(rows);
});

// POST /api/appointments
router.post('/', auth, (req, res) => {
  const { doctor, date, reason, patient_id } = req.body;

  if (!doctor || !date || !reason) {
    return res.status(400).json({ error: 'Doctor, date, and reason are required' });
  }

  const patientId = req.user.role === 'patient' ? req.user.id : (patient_id || req.user.id);

  const { maxQ } = db.prepare('SELECT MAX(queue_number) AS maxQ FROM appointments WHERE date = ?').get(date);
  const queueNumber = (maxQ || 0) + 1;

  const result = db
    .prepare('INSERT INTO appointments (patient_id, doctor, date, reason, queue_number, status) VALUES (?, ?, ?, ?, ?, ?)')
    .run(patientId, doctor, date, reason, queueNumber, 'pending');

  const appointment = db
    .prepare(`${appointmentWithPatient} WHERE a.id = ?`)
    .get(result.lastInsertRowid);

  res.status(201).json(appointment);
});

// GET /api/appointments/:id
router.get('/:id', auth, (req, res) => {
  const appointment = db.prepare(`${appointmentWithPatient} WHERE a.id = ?`).get(req.params.id);

  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

  if (req.user.role === 'patient' && appointment.patient_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(appointment);
});

// PUT /api/appointments/:id
router.put('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ error: 'Appointment not found' });

  if (req.user.role === 'patient' && existing.patient_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const doctor = req.body.doctor ?? existing.doctor;
  const date = req.body.date ?? existing.date;
  const reason = req.body.reason ?? existing.reason;

  let queueNumber = existing.queue_number;
  if (req.body.date && req.body.date !== existing.date) {
    const { maxQ } = db.prepare('SELECT MAX(queue_number) AS maxQ FROM appointments WHERE date = ?').get(date);
    queueNumber = (maxQ || 0) + 1;
  }

  db.prepare('UPDATE appointments SET doctor = ?, date = ?, reason = ?, queue_number = ? WHERE id = ?')
    .run(doctor, date, reason, queueNumber, req.params.id);

  const updated = db.prepare(`${appointmentWithPatient} WHERE a.id = ?`).get(req.params.id);
  res.json(updated);
});

// DELETE /api/appointments/:id
router.delete('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ error: 'Appointment not found' });

  if (req.user.role === 'patient' && existing.patient_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  res.json({ message: 'Appointment cancelled successfully' });
});

module.exports = router;
