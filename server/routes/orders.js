import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET all orders with customer info and total
router.get('/', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.OrderID, o.OrderDate, o.Status,
        c.CustomerID, c.Name as CustomerName, c.Contact,
        COUNT(od.DetailID) as ItemCount,
        SUM(od.Quantity) as TotalQuantity,
        SUM(od.Quantity * od.PriceAtOrder) as TotalAmount
      FROM Orders o
      JOIN Customers c ON o.CustomerID = c.CustomerID
      LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
      GROUP BY o.OrderID
      ORDER BY o.OrderDate DESC
    `).all();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order with full details (JOIN query)
router.get('/:id', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT o.OrderID, o.OrderDate, o.Status,
        c.CustomerID, c.Name as CustomerName, c.Contact, c.Email
      FROM Orders o
      JOIN Customers c ON o.CustomerID = c.CustomerID
      WHERE o.OrderID = ?
    `).get(req.params.id);
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const details = db.prepare(`
      SELECT od.DetailID, od.Quantity, od.PriceAtOrder,
        f.ItemID, f.ItemName, f.Category, f.ImageEmoji,
        (od.Quantity * od.PriceAtOrder) as Subtotal
      FROM OrderDetails od
      JOIN FoodItems f ON od.ItemID = f.ItemID
      WHERE od.OrderID = ?
    `).all(req.params.id);
    
    const totalAmount = details.reduce((sum, d) => sum + d.Subtotal, 0);
    
    res.json({ ...order, details, TotalAmount: totalAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new order (Transaction)
router.post('/', (req, res) => {
  try {
    const { CustomerID, items } = req.body;
    if (!CustomerID || !items || items.length === 0) {
      return res.status(400).json({ error: 'CustomerID and at least one item are required' });
    }

    // Verify customer exists
    const customer = db.prepare('SELECT * FROM Customers WHERE CustomerID = ?').get(CustomerID);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Use a transaction for data integrity
    const createOrder = db.transaction((custId, orderItems) => {
      const orderResult = db.prepare(
        'INSERT INTO Orders (CustomerID) VALUES (?)'
      ).run(custId);
      
      const orderId = orderResult.lastInsertRowid;
      const insertDetail = db.prepare(
        'INSERT INTO OrderDetails (OrderID, ItemID, Quantity, PriceAtOrder) VALUES (?, ?, ?, ?)'
      );

      for (const item of orderItems) {
        const food = db.prepare('SELECT * FROM FoodItems WHERE ItemID = ? AND Availability = 1').get(item.ItemID);
        if (!food) throw new Error(`Food item ${item.ItemID} not found or unavailable`);
        insertDetail.run(orderId, item.ItemID, item.Quantity, food.Price);
      }

      return orderId;
    });

    const orderId = createOrder(CustomerID, items);
    
    // Fetch the complete order
    const order = db.prepare(`
      SELECT o.OrderID, o.OrderDate, o.Status,
        c.Name as CustomerName,
        SUM(od.Quantity * od.PriceAtOrder) as TotalAmount
      FROM Orders o
      JOIN Customers c ON o.CustomerID = c.CustomerID
      JOIN OrderDetails od ON o.OrderID = od.OrderID
      WHERE o.OrderID = ?
      GROUP BY o.OrderID
    `).get(orderId);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update order status
router.patch('/:id/status', (req, res) => {
  try {
    const { Status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(Status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = db.prepare('UPDATE Orders SET Status = ? WHERE OrderID = ?')
      .run(Status, req.params.id);
    
    if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
    
    res.json({ message: 'Status updated', OrderID: req.params.id, Status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE order
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM Orders WHERE OrderID = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
