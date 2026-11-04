require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5500';

app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '100kb' }));

// Limita tentativas em rotas sensíveis, como cadastro e login.
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false
}));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'MyJourney API' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/diary', require('./routes/diaryRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/gad7', require('./routes/gadRoutes'));

// Tratamento centralizado de erros sem expor detalhes internos em produção.
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(port, () => console.log(`MyJourney API disponível em http://localhost:${port}`));
