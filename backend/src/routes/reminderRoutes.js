const router = require('express').Router();
const db = require('../database/connection');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM reminders WHERE user_id=? ORDER BY time').all(req.user.id);
  res.json({ reminders: rows.map(row => ({
    ...row, enabled: Boolean(row.enabled),
    days: JSON.parse(row.days_json), types: JSON.parse(row.types_json)
  })) });
});

router.post('/', (req, res) => {
  const { time, days, types, enabled = true } = req.body;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || '') ||
      !Array.isArray(days) || !Array.isArray(types)) {
    return res.status(400).json({ error: 'Horário, dias e tipos são obrigatórios.' });
  }
  const result = db.prepare(`
    INSERT INTO reminders (user_id, time, days_json, types_json, enabled)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, time, JSON.stringify(days), JSON.stringify(types), enabled ? 1 : 0);
  res.status(201).json({ id: Number(result.lastInsertRowid) });
});

router.patch('/:id', (req, res) => {
  const current = db.prepare('SELECT * FROM reminders WHERE id=? AND user_id=?')
    .get(req.params.id, req.user.id);
  if (!current) return res.status(404).json({ error: 'Lembrete não encontrado.' });

  const time = req.body.time ?? current.time;
  const days = req.body.days ?? JSON.parse(current.days_json);
  const types = req.body.types ?? JSON.parse(current.types_json);
  const enabled = req.body.enabled ?? Boolean(current.enabled);

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || !Array.isArray(days) || !Array.isArray(types)) {
    return res.status(400).json({ error: 'Dados do lembrete inválidos.' });
  }

  db.prepare(`UPDATE reminders SET time=?, days_json=?, types_json=?, enabled=? WHERE id=? AND user_id=?`)
    .run(time, JSON.stringify(days), JSON.stringify(types), enabled ? 1 : 0, req.params.id, req.user.id);
  res.json({ message: 'Lembrete atualizado.' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM reminders WHERE id=? AND user_id=?')
    .run(req.params.id, req.user.id);
  if (!result.changes) return res.status(404).json({ error: 'Lembrete não encontrado.' });
  res.status(204).end();
});

module.exports = router;
