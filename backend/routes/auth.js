const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const validRoles = ['patient', 'staff', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'patient';
  const hash = bcrypt.hashSync(password, 10);

  try {
    const result = db
      .prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
      .run(name, email.toLowerCase().trim(), hash, userRole);
    res.status(201).json({ id: result.lastInsertRowid, name, email, role: userRole });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
