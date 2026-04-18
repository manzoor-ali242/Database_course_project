import express from 'express';
import cors from 'cors';
import customersRouter from './routes/customers.js';
import foodItemsRouter from './routes/foodItems.js';
import ordersRouter from './routes/orders.js';
import reportsRouter from './routes/reports.js';

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

app.listen(PORT, () => {
  console.log(`\n🍽️  Canteen API Server running at http://localhost:${PORT}`);
  console.log(`📊  Database initialized with sample data\n`);
});
