const router = require('express').Router();
const db = require('../database/connection');
const auth = require('../middleware/auth');

router.use(auth);

// Armazena o resultado e as respostas; não substitui avaliação profissional.
router.get('/', (req, res) => {
  const results = db.prepare(
    'SELECT id, score, answers_json, created_at FROM gad7_results WHERE user_id=? ORDER BY created_at DESC'
  ).all(req.user.id).map(item => ({ ...item, answers: JSON.parse(item.answers_json) }));
  res.json({ results });
});

router.post('/', (req, res) => {
  const { score, answers } = req.body;
  if (!Number.isInteger(score) || score < 0 || score > 21 || !Array.isArray(answers) || answers.length !== 7) {
    return res.status(400).json({ error: 'Resultado GAD-7 inválido.' });
  }
  const result = db.prepare(
    'INSERT INTO gad7_results (user_id, score, answers_json) VALUES (?, ?, ?)'
  ).run(req.user.id, score, JSON.stringify(answers));
  res.status(201).json({ id: Number(result.lastInsertRowid), score });
});

module.exports = router;
