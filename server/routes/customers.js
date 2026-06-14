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

// POST top up customer wallet (Stored Procedure Equivalent)
router.post('/:id/wallet/topup', (req, res) => {
  try {
    const { amount } = req.body;
    const customerId = req.params.id;

    if (amount === undefined || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'A valid top-up amount greater than 0 is required.' });
    }

    // Encapsulated transaction (Stored Procedure style)
    const sp_topup_wallet = db.transaction((id, amt) => {
      const customer = db.prepare('SELECT * FROM Customers WHERE CustomerID = ?').get(id);
      if (!customer) throw new Error('Customer not found');

      db.prepare('UPDATE Customers SET WalletBalance = WalletBalance + ? WHERE CustomerID = ?')
        .run(amt, id);

      return db.prepare('SELECT CustomerID, Name, WalletBalance, LoyaltyPoints FROM Customers WHERE CustomerID = ?').get(id);
    });

    const updatedCustomer = sp_topup_wallet(customerId, parseFloat(amount));
    res.json({ message: 'Wallet topped up successfully', customer: updatedCustomer });
  } catch (err) {
    if (err.message === 'Customer not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
