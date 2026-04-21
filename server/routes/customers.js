import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET all customers
router.get('/', (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT * FROM CustomerOrderSummary ORDER BY CreatedAt DESC
    `).all();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single customer
router.get('/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM Customers WHERE CustomerID = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create customer
router.post('/', (req, res) => {
  try {
    const { Name, Contact, Email } = req.body;
    if (!Name || !Contact) return res.status(400).json({ error: 'Name and Contact are required' });
    
    const result = db.prepare('INSERT INTO Customers (Name, Contact, Email) VALUES (?, ?, ?)').run(Name, Contact, Email || null);
    const customer = db.prepare('SELECT * FROM Customers WHERE CustomerID = ?').get(result.lastInsertRowid);
    res.status(201).json(customer);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: Customers.Contact')) {
      return res.status(400).json({ error: 'A customer with this contact number already exists.' });
    }
    if (err.message.includes('UNIQUE constraint failed: Customers.Email')) {
      return res.status(400).json({ error: 'A customer with this email already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer
router.put('/:id', (req, res) => {
  try {
    const { Name, Contact, Email } = req.body;
    if (!Name || !Contact) return res.status(400).json({ error: 'Name and Contact are required' });
    
    const result = db.prepare('UPDATE Customers SET Name = ?, Contact = ?, Email = ? WHERE CustomerID = ?')
      .run(Name, Contact, Email || null, req.params.id);
    
    if (result.changes === 0) return res.status(404).json({ error: 'Customer not found' });
    
    const customer = db.prepare('SELECT * FROM Customers WHERE CustomerID = ?').get(req.params.id);
    res.json(customer);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: Customers.Contact')) {
      return res.status(400).json({ error: 'A customer with this contact number already exists.' });
    }
    if (err.message.includes('UNIQUE constraint failed: Customers.Email')) {
      return res.status(400).json({ error: 'A customer with this email already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE customer
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM Customers WHERE CustomerID = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
