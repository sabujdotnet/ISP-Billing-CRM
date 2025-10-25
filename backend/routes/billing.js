import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db`
      SELECT b.*, c.name as client_name, c.package, c.monthly_fee
      FROM billing b
      JOIN clients c ON b.client_id = c.id
      ORDER BY b.created_at DESC
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing records.' });
  }
});

router.post('/', async (req, res) => {
  const { client_id, month, year, amount, payment_method, status } = req.body;

  try {
    const result = await db`
      INSERT INTO billing (
        client_id, month, year, amount, amount_paid, amount_due, payment_method, status
      ) VALUES (
        ${client_id}, ${month}, ${year}, ${amount}, 0, ${amount}, ${payment_method}, ${status}
      )
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create billing record.' });
  }
});

router.put('/pay/:id', async (req, res) => {
  const { id } = req.params;
  const { amount_paid, payment_method } = req.body;

  try {
    const result = await db`
      UPDATE billing SET
        amount_paid = ${amount_paid},
        amount_due = amount - ${amount_paid},
        payment_method = ${payment_method},
        payment_date = CURRENT_DATE,
        status = CASE WHEN amount_due = 0 THEN 'paid' ELSE 'partial' END
      WHERE id = ${id}
      RETURNING *
    `;
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment.' });
  }
});

export default router;