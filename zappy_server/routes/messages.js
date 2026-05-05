const express = require('express');
const router = express.Router();

router.post('/send', async (req, res) => {
  const { fromUserId, toUserId, text, image, replyTo } = req.body;
  const db = req.app.locals.db;
  try {
    const result = await db.query(
      'INSERT INTO messages (from_user_id, to_user_id, text, image, reply_to) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [fromUserId, toUserId, text || '', image || null, replyTo ? JSON.stringify(replyTo) : null]
    );
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:userId/:otherUserId', async (req, res) => {
  const { userId, otherUserId } = req.params;
  const db = req.app.locals.db;
  try {
    const result = await db.query(
      `SELECT * FROM messages
       WHERE (from_user_id = $1 AND to_user_id = $2)
       OR (from_user_id = $2 AND to_user_id = $1)
       ORDER BY created_at ASC`,
      [userId, otherUserId]
    );
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;