import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET all food items
router.get('/', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT f.*,
        COALESCE(SUM(od.Quantity), 0) as TotalOrdered
      FROM FoodItems f
      LEFT JOIN OrderDetails od ON f.ItemID = od.ItemID
      GROUP BY f.ItemID
      ORDER BY f.Category, f.ItemName
    `).all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single food item
router.get('/:id', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM FoodItems WHERE ItemID = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create food item
router.post('/', (req, res) => {
  try {
    const { ItemName, Category, Price, Availability, ImageEmoji } = req.body;
    if (!ItemName || !Price) return res.status(400).json({ error: 'ItemName and Price are required' });
    
    const result = db.prepare(
      'INSERT INTO FoodItems (ItemName, Category, Price, Availability, ImageEmoji) VALUES (?, ?, ?, ?, ?)'
    ).run(ItemName, Category || 'General', Price, Availability ?? 1, ImageEmoji || '🍽️');
    
    const item = db.prepare('SELECT * FROM FoodItems WHERE ItemID = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update food item
router.put('/:id', (req, res) => {
  try {
    const { ItemName, Category, Price, Availability, ImageEmoji } = req.body;
    if (!ItemName || !Price) return res.status(400).json({ error: 'ItemName and Price are required' });
    
    const result = db.prepare(
      'UPDATE FoodItems SET ItemName = ?, Category = ?, Price = ?, Availability = ?, ImageEmoji = ? WHERE ItemID = ?'
    ).run(ItemName, Category || 'General', Price, Availability ?? 1, ImageEmoji || '🍽️', req.params.id);
    
    if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
    
    const item = db.prepare('SELECT * FROM FoodItems WHERE ItemID = ?').get(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE food item
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM FoodItems WHERE ItemID = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle availability
router.patch('/:id/toggle', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM FoodItems WHERE ItemID = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    db.prepare('UPDATE FoodItems SET Availability = ? WHERE ItemID = ?')
      .run(item.Availability ? 0 : 1, req.params.id);
    
    const updated = db.prepare('SELECT * FROM FoodItems WHERE ItemID = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
