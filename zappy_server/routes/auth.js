const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  const { username, displayName, password } = req.body;
  if (!username || !displayName || !password)
    return res.status(400).json({ error: 'all fields required' });

  const db = req.app.locals.db;
  try {
    const exists = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (exists.rows.length > 0)
      return res.status(400).json({ error: 'username already taken' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, display_name, password) VALUES ($1, $2, $3) RETURNING id, username, display_name',
      [username.trim(), displayName.trim(), hashed]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, username: user.username, displayName: user.display_name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = req.app.locals.db;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: 'user not found' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: 'wrong password' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, username: user.username, displayName: user.display_name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/users', async (req, res) => {
  const db = req.app.locals.db;
  try {
    const result = await db.query('SELECT id, username, display_name, avatar_color FROM users');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;