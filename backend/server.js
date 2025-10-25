import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeNeonDB, db } from './config/database.js';
import { authenticateToken } from './middleware/auth.js';
import userRoutes from './routes/users.js';
import clientRoutes from './routes/clients.js';
import billingRoutes from './routes/billing.js';
import mikrotikRoutes from './routes/mikrotik.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

await initializeNeonDB();

app.use('/api/users', userRoutes);
app.use('/api/clients', authenticateToken, clientRoutes);
app.use('/api/billing', authenticateToken, billingRoutes);
app.use('/api/mikrotik', authenticateToken, mikrotikRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ISP Billing CRM Backend Running!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});