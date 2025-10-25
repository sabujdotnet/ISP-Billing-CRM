import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await db`
      SELECT id, name, role FROM users WHERE username = ${decoded.username}
    `;
    
    if (result.length === 0) {
      return res.status(403).json({ error: 'User not found or invalid token.' });
    }

    req.user = result[0];
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};