import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import customersRouter from './server/routes/customers.js';
import foodItemsRouter from './server/routes/foodItems.js';
import ordersRouter from './server/routes/orders.js';
import reportsRouter from './server/routes/reports.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/customers', customersRouter);
app.use('/api/food-items', foodItemsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reports', reportsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Canteen Order Management System API is running' });
});

// Serve the built React frontend
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🍽️  Canteen app running at http://localhost:${PORT}`);
  console.log(`📊  Database initialized with sample data\n`);
});
