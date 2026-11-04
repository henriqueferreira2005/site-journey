const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

function createToken(user) {
  return jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function register({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = bcrypt.hashSync(password, 12);

  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
  ).run(name.trim(), normalizedEmail, passwordHash);

  const user = { id: Number(result.lastInsertRowid), name: name.trim(), email: normalizedEmail };
  return { user, token: createToken(user) };
}

function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.prepare(
    'SELECT id, name, email, password_hash FROM users WHERE email = ?'
  ).get(normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) return null;

  const safeUser = { id: user.id, name: user.name, email: user.email };
  return { user: safeUser, token: createToken(safeUser) };
}

function getProfile(userId) {
  return db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(userId);
}

module.exports = { register, login, getProfile };
