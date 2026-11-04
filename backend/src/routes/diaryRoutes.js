const router = require('express').Router();
const db = require('../database/connection');
const auth = require('../middleware/auth');

router.use(auth);

// Lista somente os registros pertencentes ao usuário autenticado.
router.get('/', (req, res) => {
  const entries = db.prepare(`
    SELECT id, mood, intensity, trigger_text, thoughts, sensations, notes,
           entry_date, created_at, updated_at
    FROM diary_entries WHERE user_id = ? ORDER BY entry_date DESC
  `).all(req.user.id);
  res.json({ entries });
});

router.post('/', (req, res) => {
  const { mood, intensity, trigger_text = '', thoughts = '', sensations = '', notes = '', entry_date } = req.body;
  if (!mood || !Number.isInteger(intensity) || intensity < 1 || intensity > 10) {
    return res.status(400).json({ error: 'Informe humor e intensidade entre 1 e 10.' });
  }

  const result = db.prepare(`
    INSERT INTO diary_entries
      (user_id, mood, intensity, trigger_text, thoughts, sensations, notes, entry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
  `).run(req.user.id, mood, intensity, trigger_text, thoughts, sensations, notes, entry_date || null);

  res.status(201).json({ id: Number(result.lastInsertRowid) });
});

router.put('/:id', (req, res) => {
  const { mood, intensity, trigger_text = '', thoughts = '', sensations = '', notes = '', entry_date } = req.body;
  if (!mood || !Number.isInteger(intensity) || intensity < 1 || intensity > 10) {
    return res.status(400).json({ error: 'Informe humor e intensidade entre 1 e 10.' });
  }

  const result = db.prepare(`
    UPDATE diary_entries
    SET mood=?, intensity=?, trigger_text=?, thoughts=?, sensations=?, notes=?,
        entry_date=COALESCE(?, entry_date), updated_at=CURRENT_TIMESTAMP
    WHERE id=? AND user_id=?
  `).run(mood, intensity, trigger_text, thoughts, sensations, notes, entry_date || null, req.params.id, req.user.id);

  if (!result.changes) return res.status(404).json({ error: 'Registro não encontrado.' });
  res.json({ message: 'Registro atualizado.' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM diary_entries WHERE id=? AND user_id=?')
    .run(req.params.id, req.user.id);
  if (!result.changes) return res.status(404).json({ error: 'Registro não encontrado.' });
  res.status(204).end();
});

module.exports = router;
