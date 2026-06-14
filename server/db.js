import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'canteen.db');
const backupPath = path.join(__dirname, '..', 'canteen_backup.db');

if (fs.existsSync(dbPath) && !fs.existsSync(backupPath)) {
  try {
    fs.copyFileSync(dbPath, backupPath);
    fs.unlinkSync(dbPath);
    console.log('Backed up old DB and reset for new constraints.');
  } catch (e) {
    console.error('Migration backup failed', e);
  }
}
// ============================================================
// Initialize sql.js (pure JavaScript SQLite via WebAssembly)
// ============================================================

const SQL = await initSqlJs();

// Load existing database or create new one
let sqlDb;
try {
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }
} catch {
  sqlDb = new SQL.Database();
}

// ---- Persistence helpers ----
function saveDb() {
  try {
    const data = sqlDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (e) {
    console.error('Failed to save database:', e.message);
  }
}

// Save on process exit
process.on('exit', saveDb);
process.on('SIGINT', () => { saveDb(); process.exit(); });

// ============================================================
// Compatibility wrapper — mimics better-sqlite3 API so that
// all route files work without any changes
// ============================================================

let _inTransaction = false;

class PreparedStatement {
  constructor(rawDb, sql) {
    this._db = rawDb;
    this._sql = sql;
  }

  all(...params) {
    const stmt = this._db.prepare(this._sql);
    if (params.length > 0) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  get(...params) {
    const stmt = this._db.prepare(this._sql);
    if (params.length > 0) stmt.bind(params);
    let result = undefined;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  run(...params) {
    const stmt = this._db.prepare(this._sql);
    if (params.length > 0) stmt.bind(params);
    stmt.step();
    stmt.free();

    const changes = this._db.getRowsModified();
    const res = this._db.exec('SELECT last_insert_rowid() AS id');
    const lastInsertRowid = (res.length > 0 && res[0].values.length > 0)
      ? res[0].values[0][0]
      : 0;

    if (!_inTransaction) saveDb();
    return { changes, lastInsertRowid };
  }
}

const db = {
  prepare(sql) {
    return new PreparedStatement(sqlDb, sql);
  },

  exec(sql) {
    sqlDb.exec(sql);
    saveDb();
  },

  pragma(str) {
    try { sqlDb.exec(`PRAGMA ${str}`); } catch { /* ignore unsupported */ }
  },

  transaction(fn) {
    return (...args) => {
      _inTransaction = true;
      sqlDb.exec('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        sqlDb.exec('COMMIT');
        _inTransaction = false;
        saveDb();
        return result;
      } catch (e) {
        sqlDb.exec('ROLLBACK');
        _inTransaction = false;
        throw e;
      }
    };
  }
};

// ============================================================
// DDL — Data Definition Language: CREATE TABLE statements
// Database normalized to Third Normal Form (3NF)
// ============================================================

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS Customers (
    CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Contact TEXT NOT NULL UNIQUE,
    Email TEXT UNIQUE,
    WalletBalance REAL NOT NULL DEFAULT 500.0 CHECK(WalletBalance >= 0),
    LoyaltyPoints INTEGER NOT NULL DEFAULT 0 CHECK(LoyaltyPoints >= 0),
    CreatedAt TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS FoodItems (
    ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemName TEXT NOT NULL UNIQUE,
    Category TEXT NOT NULL DEFAULT 'General',
    Price REAL NOT NULL CHECK(Price > 0),
    Availability INTEGER NOT NULL DEFAULT 1,
    ImageEmoji TEXT DEFAULT '🍽️',
    CreatedAt TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS Orders (
    OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
    CustomerID INTEGER NOT NULL,
    OrderDate TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    Status TEXT NOT NULL DEFAULT 'Pending' CHECK(Status IN ('Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled')),
    PaymentMethod TEXT NOT NULL DEFAULT 'Cash' CHECK(PaymentMethod IN ('Cash', 'Wallet')),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS OrderDetails (
    DetailID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER NOT NULL,
    ItemID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL CHECK(Quantity > 0),
    PriceAtOrder REAL NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ItemID) REFERENCES FoodItems(ItemID) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS OrderAuditLog (
    LogID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER NOT NULL,
    OldStatus TEXT,
    NewStatus TEXT,
    ChangedAt TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

// Apply migrations for existing tables safely if they don't have the new columns yet
try {
  db.exec("ALTER TABLE Customers ADD COLUMN WalletBalance REAL NOT NULL DEFAULT 500.0 CHECK(WalletBalance >= 0)");
} catch (e) {
  // Column already exists or table doesn't exist yet
}

try {
  db.exec("ALTER TABLE Customers ADD COLUMN LoyaltyPoints INTEGER NOT NULL DEFAULT 0 CHECK(LoyaltyPoints >= 0)");
} catch (e) {
  // Column already exists or table doesn't exist yet
}

try {
  db.exec("ALTER TABLE Orders ADD COLUMN PaymentMethod TEXT NOT NULL DEFAULT 'Cash' CHECK(PaymentMethod IN ('Cash', 'Wallet'))");
} catch (e) {
  // Column already exists or table doesn't exist yet
}

db.exec(`
  -- Indexing to optimize performance for JOIN lookups
  CREATE INDEX IF NOT EXISTS idx_orders_customer ON Orders(CustomerID);
  CREATE INDEX IF NOT EXISTS idx_orderdetails_order ON OrderDetails(OrderID);
  CREATE INDEX IF NOT EXISTS idx_orderdetails_item ON OrderDetails(ItemID);

  -- Trigger: Log order status changes
  CREATE TRIGGER IF NOT EXISTS log_order_status_update
  AFTER UPDATE OF Status ON Orders
  FOR EACH ROW
  WHEN OLD.Status != NEW.Status
  BEGIN
    INSERT INTO OrderAuditLog (OrderID, OldStatus, NewStatus)
    VALUES (NEW.OrderID, OLD.Status, NEW.Status);
  END;

  -- Trigger: Deduct from customer's wallet balance when adding items to a wallet-paid order
  CREATE TRIGGER IF NOT EXISTS deduct_wallet_on_order_detail
  AFTER INSERT ON OrderDetails
  WHEN (SELECT PaymentMethod FROM Orders WHERE OrderID = NEW.OrderID) = 'Wallet'
  BEGIN
    UPDATE Customers
    SET WalletBalance = WalletBalance - (NEW.Quantity * NEW.PriceAtOrder)
    WHERE CustomerID = (SELECT CustomerID FROM Orders WHERE OrderID = NEW.OrderID);
  END;

  -- Trigger: Refund customer's wallet if a wallet-paid order is cancelled
  CREATE TRIGGER IF NOT EXISTS refund_wallet_on_cancel
  AFTER UPDATE OF Status ON Orders
  FOR EACH ROW
  WHEN NEW.Status = 'Cancelled' AND OLD.Status != 'Cancelled' AND OLD.PaymentMethod = 'Wallet'
  BEGIN
    UPDATE Customers
    SET WalletBalance = WalletBalance + (
      SELECT COALESCE(SUM(Quantity * PriceAtOrder), 0)
      FROM OrderDetails
      WHERE OrderID = NEW.OrderID
    )
    WHERE CustomerID = NEW.CustomerID;
  END;

  -- Trigger: Award loyalty points (10% of order value) when status changes to 'Delivered'
  CREATE TRIGGER IF NOT EXISTS award_loyalty_points
  AFTER UPDATE OF Status ON Orders
  FOR EACH ROW
  WHEN NEW.Status = 'Delivered' AND OLD.Status != 'Delivered'
  BEGIN
    UPDATE Customers
    SET LoyaltyPoints = LoyaltyPoints + CAST((
      SELECT COALESCE(SUM(Quantity * PriceAtOrder), 0) * 0.10
      FROM OrderDetails
      WHERE OrderID = NEW.OrderID
    ) AS INTEGER)
    WHERE CustomerID = NEW.CustomerID;
  END;

  -- Re-create views incorporating the new wallet and loyalty columns
  DROP VIEW IF EXISTS CustomerOrderSummary;
  CREATE VIEW CustomerOrderSummary AS
  SELECT 
    c.CustomerID,
    c.Name,
    c.Contact,
    c.Email,
    c.WalletBalance,
    c.LoyaltyPoints,
    c.CreatedAt,
    COUNT(DISTINCT o.OrderID) AS TotalOrders,
    COALESCE(SUM(od.Quantity * od.PriceAtOrder), 0) AS TotalSpent
  FROM Customers c
  LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
  LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
  GROUP BY c.CustomerID;

  DROP VIEW IF EXISTS DailySales;
  CREATE VIEW DailySales AS
  SELECT 
    date(OrderDate) AS Date,
    COUNT(DISTINCT o.OrderID) AS TotalOrders,
    SUM(od.Quantity * od.PriceAtOrder) AS Revenue
  FROM Orders o
  JOIN OrderDetails od ON o.OrderID = od.OrderID
  WHERE o.Status != 'Cancelled'
  GROUP BY date(OrderDate);
`);

// ============================================================
// DML — Insert sample data if tables are empty
// ============================================================

const customerCount = db.prepare('SELECT COUNT(*) as count FROM Customers').get();
if (customerCount.count === 0) {
  const insertCustomer = db.prepare('INSERT INTO Customers (Name, Contact, Email) VALUES (?, ?, ?)');
  const customers = [
    ['Ahmed Khan', '0301-1234567', 'ahmed.khan@email.com'],
    ['Sara Ali', '0312-9876543', 'sara.ali@email.com'],
    ['Usman Raza', '0333-5551234', 'usman.raza@email.com'],
    ['Fatima Noor', '0345-6789012', 'fatima.noor@email.com'],
    ['Hassan Malik', '0300-1112233', 'hassan.malik@email.com'],
    ['Ayesha Tariq', '0321-4445566', 'ayesha.tariq@email.com'],
    ['Bilal Ahmed', '0311-7778899', 'bilal.ahmed@email.com'],
    ['Zainab Shah', '0334-2223344', 'zainab.shah@email.com'],
  ];
  const insertMany = db.transaction((items) => {
    for (const item of items) insertCustomer.run(...item);
  });
  insertMany(customers);
}

const foodCount = db.prepare('SELECT COUNT(*) as count FROM FoodItems').get();
if (foodCount.count === 0) {
  const insertFood = db.prepare('INSERT INTO FoodItems (ItemName, Category, Price, Availability, ImageEmoji) VALUES (?, ?, ?, ?, ?)');
  const foods = [
    ['Chicken Biryani', 'Rice', 250, 1, '🍚'],
    ['Beef Burger', 'Fast Food', 350, 1, '🍔'],
    ['Chicken Shawarma', 'Fast Food', 200, 1, '🌯'],
    ['Vegetable Salad', 'Healthy', 150, 1, '🥗'],
    ['Chicken Karahi', 'Desi', 450, 1, '🍛'],
    ['French Fries', 'Snacks', 120, 1, '🍟'],
    ['Cold Coffee', 'Beverages', 180, 1, '☕'],
    ['Mango Shake', 'Beverages', 160, 1, '🥤'],
    ['Club Sandwich', 'Fast Food', 280, 1, '🥪'],
    ['Chicken Pasta', 'Italian', 300, 1, '🍝'],
    ['Chapli Kebab', 'Desi', 200, 1, '🥩'],
    ['Mineral Water', 'Beverages', 50, 1, '💧'],
    ['Chocolate Brownie', 'Desserts', 180, 1, '🍫'],
    ['Fruit Chaat', 'Healthy', 130, 1, '🍇'],
    ['Naan', 'Bread', 30, 1, '🫓'],
  ];
  const insertMany = db.transaction((items) => {
    for (const item of items) insertFood.run(...item);
  });
  insertMany(foods);

  // Insert some sample orders for demo/reports
  const insertOrder = db.prepare('INSERT INTO Orders (CustomerID, OrderDate, Status) VALUES (?, ?, ?)');
  const insertDetail = db.prepare('INSERT INTO OrderDetails (OrderID, ItemID, Quantity, PriceAtOrder) VALUES (?, ?, ?, ?)');

  const sampleOrders = db.transaction(() => {
    const dates = [
      '2026-04-10 12:30:00', '2026-04-10 13:15:00',
      '2026-04-11 11:45:00', '2026-04-11 14:00:00',
      '2026-04-12 12:00:00', '2026-04-12 13:30:00',
      '2026-04-13 12:15:00', '2026-04-13 14:45:00',
      '2026-04-14 11:30:00', '2026-04-14 13:00:00',
      '2026-04-15 12:00:00',
    ];

    const orderData = [
      { custId: 1, date: dates[0], status: 'Delivered', items: [{ id: 1, qty: 2, price: 250 }, { id: 7, qty: 2, price: 180 }] },
      { custId: 2, date: dates[1], status: 'Delivered', items: [{ id: 2, qty: 1, price: 350 }, { id: 6, qty: 1, price: 120 }, { id: 8, qty: 1, price: 160 }] },
      { custId: 3, date: dates[2], status: 'Delivered', items: [{ id: 3, qty: 3, price: 200 }, { id: 12, qty: 3, price: 50 }] },
      { custId: 4, date: dates[3], status: 'Delivered', items: [{ id: 4, qty: 1, price: 150 }, { id: 14, qty: 1, price: 130 }] },
      { custId: 5, date: dates[4], status: 'Delivered', items: [{ id: 5, qty: 2, price: 450 }, { id: 15, qty: 4, price: 30 }, { id: 7, qty: 2, price: 180 }] },
      { custId: 1, date: dates[5], status: 'Delivered', items: [{ id: 1, qty: 1, price: 250 }, { id: 6, qty: 2, price: 120 }] },
      { custId: 6, date: dates[6], status: 'Delivered', items: [{ id: 10, qty: 2, price: 300 }, { id: 13, qty: 2, price: 180 }] },
      { custId: 7, date: dates[7], status: 'Delivered', items: [{ id: 9, qty: 1, price: 280 }, { id: 8, qty: 1, price: 160 }] },
      { custId: 2, date: dates[8], status: 'Delivered', items: [{ id: 2, qty: 2, price: 350 }, { id: 6, qty: 1, price: 120 }, { id: 7, qty: 1, price: 180 }] },
      { custId: 8, date: dates[9], status: 'Preparing', items: [{ id: 1, qty: 3, price: 250 }, { id: 11, qty: 2, price: 200 }, { id: 15, qty: 6, price: 30 }] },
      { custId: 3, date: dates[10], status: 'Pending', items: [{ id: 3, qty: 2, price: 200 }, { id: 7, qty: 1, price: 180 }] },
    ];

    for (const order of orderData) {
      const result = insertOrder.run(order.custId, order.date, order.status);
      for (const item of order.items) {
        insertDetail.run(result.lastInsertRowid, item.id, item.qty, item.price);
      }
    }
  });
  sampleOrders();
}

export default db;
