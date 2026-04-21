import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Dashboard stats
router.get('/dashboard', (req, res) => {
  try {
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM Customers').get().count;
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM FoodItems').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM Orders').get().count;
    
    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(od.Quantity * od.PriceAtOrder), 0) as total
      FROM OrderDetails od
      JOIN Orders o ON od.OrderID = o.OrderID
      WHERE o.Status != 'Cancelled'
    `).get().total;

    const todayOrders = db.prepare(`
      SELECT COUNT(*) as count FROM Orders 
      WHERE date(OrderDate) = date('now', 'localtime')
    `).get().count;

    const todayRevenueResult = db.prepare(`
      SELECT Revenue as total
      FROM DailySales
      WHERE Date = date('now', 'localtime')
    `).get();
    const todayRevenue = todayRevenueResult ? todayRevenueResult.total : 0;

    const pendingOrders = db.prepare(`
      SELECT COUNT(*) as count FROM Orders WHERE Status IN ('Pending', 'Preparing')
    `).get().count;

    const avgOrderValue = db.prepare(`
      SELECT COALESCE(AVG(order_total), 0) as avg FROM (
        SELECT SUM(od.Quantity * od.PriceAtOrder) as order_total
        FROM OrderDetails od
        JOIN Orders o ON od.OrderID = o.OrderID
        WHERE o.Status != 'Cancelled'
        GROUP BY od.OrderID
      )
    `).get().avg;

    res.json({
      totalCustomers, totalItems, totalOrders, totalRevenue,
      todayOrders, todayRevenue, pendingOrders, avgOrderValue: Math.round(avgOrderValue)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily sales report (last 7 days)
router.get('/daily-sales', (req, res) => {
  try {
    const sales = db.prepare(`
      SELECT Date,
        TotalOrders as OrderCount,
        Revenue
      FROM DailySales
      WHERE Date >= date('now', 'localtime', '-6 days')
      ORDER BY Date ASC
    `).all();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Most popular items (aggregation with GROUP BY)
router.get('/popular-items', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT f.ItemName, f.Category, f.ImageEmoji, f.Price,
        SUM(od.Quantity) as TotalQuantity,
        SUM(od.Quantity * od.PriceAtOrder) as TotalRevenue,
        COUNT(DISTINCT od.OrderID) as OrderCount
      FROM FoodItems f
      JOIN OrderDetails od ON f.ItemID = od.ItemID
      JOIN Orders o ON od.OrderID = o.OrderID
      WHERE o.Status != 'Cancelled'
      GROUP BY f.ItemID
      ORDER BY TotalQuantity DESC
      LIMIT 10
    `).all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revenue by category
router.get('/category-revenue', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT f.Category,
        SUM(od.Quantity * od.PriceAtOrder) as Revenue,
        SUM(od.Quantity) as TotalItems
      FROM FoodItems f
      JOIN OrderDetails od ON f.ItemID = od.ItemID
      JOIN Orders o ON od.OrderID = o.OrderID
      WHERE o.Status != 'Cancelled'
      GROUP BY f.Category
      ORDER BY Revenue DESC
    `).all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top customers
router.get('/top-customers', (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT c.Name, c.Contact,
        COUNT(DISTINCT o.OrderID) as OrderCount,
        SUM(od.Quantity * od.PriceAtOrder) as TotalSpent
      FROM Customers c
      JOIN Orders o ON c.CustomerID = o.CustomerID
      JOIN OrderDetails od ON o.OrderID = od.OrderID
      WHERE o.Status != 'Cancelled'
      GROUP BY c.CustomerID
      ORDER BY TotalSpent DESC
      LIMIT 5
    `).all();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent orders
router.get('/recent-orders', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.OrderID, o.OrderDate, o.Status,
        c.Name as CustomerName,
        SUM(od.Quantity * od.PriceAtOrder) as TotalAmount
      FROM Orders o
      JOIN Customers c ON o.CustomerID = c.CustomerID
      JOIN OrderDetails od ON o.OrderID = od.OrderID
      GROUP BY o.OrderID
      ORDER BY o.OrderDate DESC
      LIMIT 5
    `).all();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Order status distribution
router.get('/order-status', (req, res) => {
  try {
    const statuses = db.prepare(`
      SELECT Status, COUNT(*) as Count
      FROM Orders
      GROUP BY Status
    `).all();
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
