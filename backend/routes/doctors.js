const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// GET /api/doctors — all authenticated users (needed for appointment form dropdown)
router.get('/', auth, (req, res) => {
  const doctors = db.prepare('SELECT * FROM doctors ORDER BY name ASC').all();
  res.json(doctors);
});

// POST /api/doctors — admin only
router.post('/', auth, roles('admin'), (req, res) => {
  const { name, specialty = '' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Doctor name is required' });
  }
  const result = db
    .prepare('INSERT INTO doctors (name, specialty) VALUES (?, ?)')
    .run(name.trim(), specialty.trim());
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(doctor);
});

// DELETE /api/doctors/:id — admin only
router.delete('/:id', auth, roles('admin'), (req, res) => {
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  db.prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id);
  res.json({ message: 'Doctor removed successfully' });
});

module.exports = router;
