import express from 'express';
import { RouterOS } from 'routeros';
import { db } from '../config/database.js';

const router = express.Router();

router.get('/config', async (req, res) => {
  try {
    const result = await db`
      SELECT * FROM mikrotik_config WHERE user_id = ${req.user.id} AND is_active = true
    `;
    res.json(result[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch config.' });
  }
});

router.post('/config', async (req, res) => {
  const { host, username, password, port } = req.body;

  try {
    const result = await db`
      INSERT INTO mikrotik_config (
        user_id, host, username, password, port, is_active
      ) VALUES (
        ${req.user.id}, ${host}, ${username}, ${password}, ${port}, true
      )
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save config.' });
  }
});

router.post('/test-connection', async (req, res) => {
  const { host, username, password, port } = req.body;

  try {
    const routeros = new RouterOS({
      host,
      username,
      password,
      port
    });

    await routeros.connect();
    await routeros.disconnect();

    res.json({ success: true, message: 'Connected successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users', async (req, res) => {
  const config = await db`
    SELECT * FROM mikrotik_config WHERE user_id = ${req.user.id} AND is_active = true
  `;

  if (!config.length) {
    return res.status(400).json({ error: 'MikroTik config not found.' });
  }

  const { host, username: adminUsername, password: adminPassword, port } = config[0];

  try {
    const routeros = new RouterOS({
      host,
      username: adminUsername,
      password: adminPassword,
      port
    });

    await routeros.connect();

    const users = await routeros.send('/ppp/secret/print');
    await routeros.disconnect();

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', async (req, res) => {
  const { username, password, rate_limit, ip_address } = req.body;
  const config = await db`
    SELECT * FROM mikrotik_config WHERE user_id = ${req.user.id} AND is_active = true
  `;

  if (!config.length) {
    return res.status(400).json({ error: 'MikroTik config not found.' });
  }

  const { host, username: adminUsername, password: adminPassword, port } = config[0];

  try {
    const routeros = new RouterOS({
      host,
      username: adminUsername,
      password: adminPassword,
      port
    });

    await routeros.connect();

    const result = await routeros.send(`/ppp/secret/add`, {
      name: username,
      password: password,
      service: 'pppoe',
      profile: 'default',
      remote_address: ip_address || '',
      rate_limit: rate_limit || ''
    });

    await routeros.disconnect();

    res.status(201).json({ success: true, message: 'User created successfully.', data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:username', async (req, res) => {
  const { username } = req.params;
  const { password, rate_limit, ip_address } = req.body;
  const config = await db`
    SELECT * FROM mikrotik_config WHERE user_id = ${req.user.id} AND is_active = true
  `;

  if (!config.length) {
    return res.status(400).json({ error: 'MikroTik config not found.' });
  }

  const { host, username: adminUsername, password: adminPassword, port } = config[0];

  try {
    const routeros = new RouterOS({
      host,
      username: adminUsername,
      password: adminPassword,
      port
    });

    await routeros.connect();

    await routeros.send(`/ppp/secret/set`, {
      where: `name=${username}`,
      password: password,
      rate_limit: rate_limit,
      remote_address: ip_address
    });

    await routeros.disconnect();

    res.json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:username', async (req, res) => {
  const { username } = req.params;
  const config = await db`
    SELECT * FROM mikrotik_config WHERE user_id = ${req.user.id} AND is_active = true
  `;

  if (!config.length) {
    return res.status(400).json({ error: 'MikroTik config not found.' });
  }

  const { host, username: adminUsername, password: adminPassword, port } = config[0];

  try {
    const routeros = new RouterOS({
      host,
      username: adminUsername,
      password: adminPassword,
      port
    });

    await routeros.connect();

    await routeros.send(`/ppp/secret/remove`, {
      where: `name=${username}`
    });

    await routeros.disconnect();

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
