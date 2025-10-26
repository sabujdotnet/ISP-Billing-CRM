import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db`
      SELECT c.*, u.name as user_name 
      FROM clients c 
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients.' });
  }
});

router.post('/', async (req, res) => {
  const { name, phone, email, address, packageType, monthly_fee, status, mikrotik_username } = req.body;
  const userId = req.user.id;

  try {
    const result = await db`
      INSERT INTO clients (
        user_id, name, phone, email, address, packageType, monthly_fee, status, mikrotik_username
      ) VALUES (
        ${userId}, ${name}, ${phone}, ${email}, ${address}, ${packageType}, ${monthly_fee}, ${status}, ${mikrotik_username}
      )
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client.' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, packageType, monthly_fee, status, mikrotik_username } = req.body;

  try {
    const result = await db`
      UPDATE clients SET
        name = ${name},
        phone = ${phone},
        email = ${email},
        address = ${address},
        packageType = ${packageType},
        monthly_fee = ${monthly_fee},
        status = ${status},
        mikrotik_username = ${mikrotik_username}
      WHERE id = ${id}
      RETURNING *
    `;
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db`
      DELETE FROM clients WHERE id = ${id}
    `;
    res.json({ message: 'Client deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client.' });
  }
});

export default router;
