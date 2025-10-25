import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

const router = express.Router();

router.post('/register-admin', async (req, res) => {
  const { username, password, name, email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db`
      INSERT INTO users (username, password, name, email, role)
      VALUES (${username}, ${hashedPassword}, ${name}, ${email}, 'admin')
      RETURNING id, username, name, role
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db`
      SELECT id, username, name, role FROM users WHERE username = ${username}
    `;

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

export default router;