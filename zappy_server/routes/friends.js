const express = require('express');
const router = express.Router();

router.get('/search', async (req, res) => {
  const { username, userId } = req.query;
  const db = req.app.locals.db;
  try {
    const result = await db.query(
      `SELECT id, username, display_name, avatar_color
       FROM users
       WHERE username ILIKE $1 AND id != $2
       LIMIT 10`,
      [`%${username}%`, userId]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/request', async (req, res) => {
  const { requesterId, receiverId } = req.body;
  const db = req.app.locals.db;
  try {
    const exists = await db.query(
      `SELECT id FROM friendships
       WHERE (requester_id = $1 AND receiver_id = $2)
       OR (requester_id = $2 AND receiver_id = $1)`,
      [requesterId, receiverId]
    );
    if (exists.rows.length > 0)
      return res.status(400).json({ error: 'request already exists' });

    await db.query(
      'INSERT INTO friendships (requester_id, receiver_id) VALUES ($1, $2)',
      [requesterId, receiverId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/respond', async (req, res) => {
  const { friendshipId, status } = req.body;
  const db = req.app.locals.db;
  try {
    await db.query(
      'UPDATE friendships SET status = $1 WHERE id = $2',
      [status, friendshipId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/list/:userId', async (req, res) => {
  const { userId } = req.params;
  const db = req.app.locals.db;
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_color, f.id as friendship_id
       FROM friendships f
       JOIN users u ON (
         CASE WHEN f.requester_id = $1 THEN f.receiver_id ELSE f.requester_id END = u.id
       )
       WHERE (f.requester_id = $1 OR f.receiver_id = $1)
       AND f.status = 'accepted'`,
      [userId]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/pending/:userId', async (req, res) => {
  const { userId } = req.params;
  const db = req.app.locals.db;
  try {
    const result = await db.query(
      `SELECT f.id as friendship_id, u.id, u.username, u.display_name
       FROM friendships f
       JOIN users u ON f.requester_id = u.id
       WHERE f.receiver_id = $1 AND f.status = 'pending'`,
      [userId]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;