const router = require('express').Router();
const authService = require('../services/authService');
const authenticate = require('../middleware/auth');

router.post('/register', (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Informe seu nome.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return res.status(400).json({ error: 'E-mail inválido.' });
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'A senha deve ter ao menos 8 caracteres.' });

    const result = authService.register({ name, email, password });
    return res.status(201).json(result);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    return next(error);
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Informe e-mail e senha.' });

  const result = authService.login({ email, password });
  if (!result) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  return res.json(result);
});

router.get('/me', authenticate, (req, res) => {
  const user = authService.getProfile(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  return res.json({ user });
});

module.exports = router;
