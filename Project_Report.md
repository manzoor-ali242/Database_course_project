# Canteen Order Management System
## DBMS Lab Project Report

---

**Subject:** Database Management Systems (DBMS) Lab  
**Project Title:** Canteen Order Management System  
**Technology Used:** SQL (SQLite), Node.js (Express), React.js  
**Date:** April 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Background of the Study](#2-background-of-the-study)
3. [Problem Statement](#3-problem-statement)
4. [Objectives](#4-objectives)
5. [Scope of the Project](#5-scope-of-the-project)
6. [Significance of the Project](#6-significance-of-the-project)
7. [Methodology](#7-methodology)
8. [Database Design](#8-database-design)
9. [SQL Implementation](#9-sql-implementation)
10. [Functional Requirements](#10-functional-requirements)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Features of the System](#12-features-of-the-system)
13. [Tools and Technologies](#13-tools-and-technologies)
14. [System Architecture](#14-system-architecture)
15. [Screenshots / UI Overview](#15-screenshots--ui-overview)
16. [Expected Outcomes](#16-expected-outcomes)
17. [Limitations](#17-limitations)
18. [Future Enhancements](#18-future-enhancements)
19. [Conclusion](#19-conclusion)
20. [References](#20-references)

---

## 1. Introduction

In today's fast-paced environment, efficient management of daily operations is essential for small businesses such as canteens and cafeterias. Traditional manual systems for managing orders, customers, and food items often lead to errors, inefficiency, and difficulty in maintaining records.

The **Canteen Order Management System** is a database-driven solution designed to automate and streamline canteen operations. This system is developed using **Structured Query Language (SQL)** as the core database technology, with **SQLite** as the relational database engine, **Express.js** as the backend API server, and **React.js** for the user interface.

The project focuses on storing, managing, and retrieving data related to customers, food items, and orders in an organized and efficient manner. By using a relational database model, the system ensures data consistency, reduces redundancy, and improves overall performance.

---

## 2. Background of the Study

Many small-scale canteens still rely on manual methods such as paper records or basic spreadsheets to manage their operations. These methods are not only time-consuming but also prone to human error.

With the advancement of database technologies, it is possible to replace manual systems with automated solutions that provide better accuracy, faster processing, and improved data handling. This project is an attempt to implement such a solution using fundamental DBMS concepts including:

- Relational database modeling
- Normalization (up to 3NF)
- SQL operations (DDL, DML, DQL)
- Foreign key constraints and referential integrity
- Transactions for data consistency
- Aggregate functions and JOIN operations for reporting

---

## 3. Problem Statement

The current manual system of canteen management suffers from several issues:

| # | Problem | Impact |
|---|---------|--------|
| 1 | Lack of proper record management | Customer and order data is lost or misplaced |
| 2 | Errors in billing and calculations | Incorrect charges lead to customer dissatisfaction |
| 3 | Difficulty in tracking customer orders | No way to view order history or repeat orders |
| 4 | Inefficient handling of food item availability | Items shown as available when they are out of stock |
| 5 | No proper system for analyzing sales data | Unable to identify best-selling items or revenue trends |

These problems reduce efficiency and make it difficult to manage daily operations effectively.

---

## 4. Objectives

The main objectives of this project are:

1. **Design and implement a relational database** for canteen management following normalization principles
2. **Maintain accurate records** of customers and their orders using structured tables
3. **Manage food items** including pricing, categories, and real-time availability tracking
4. **Automate bill calculation** using SQL aggregate functions (`SUM`, `COUNT`, `AVG`)
5. **Generate useful reports** such as daily sales, most popular items, category revenue, and order history
6. **Ensure data integrity** through foreign key constraints, CHECK constraints, and transactions
7. **Provide an intuitive user interface** for easy interaction with the database

---

## 5. Scope of the Project

This project covers a small-scale canteen environment with the following functionalities:

| Module | Functionality |
|--------|--------------|
| **Customer Management** | Add, update, delete, and search customer records |
| **Food Item Management** | Manage menu items with pricing, categories, availability toggle |
| **Order Placement** | Interactive cart-based order creation with quantity controls |
| **Order Tracking** | View all orders with status management (Pending → Preparing → Ready → Delivered) |
| **Bill Calculation** | Automatic total calculation using SQL `SUM(Quantity × Price)` |
| **Reports & Analytics** | Daily sales, popular items, category breakdown, top customers, order status distribution |

---

## 6. Significance of the Project

This project is significant because it demonstrates how database systems can be used to solve real-world problems. It provides:

- **Practical understanding of DBMS concepts** — relational modeling, normalization, constraints
- **Experience in designing relational databases** — ER diagrams, table relationships, primary/foreign keys
- **Knowledge of SQL operations** — DDL (CREATE TABLE), DML (INSERT, UPDATE, DELETE), DQL (SELECT with JOINs)
- **Real-world application** — automated billing, inventory tracking, sales analytics
- **Full-stack development skills** — connecting a database to a web-based user interface

---

## 7. Methodology

The project was developed using the following systematic approach:

### 7.1 Requirement Analysis
Understanding the needs of the canteen system and identifying required entities:
- **Customers** — People who place orders
- **Food Items** — Menu items available for ordering
- **Orders** — Records of customer purchases
- **Order Details** — Individual items within each order (resolves Many-to-Many relationship)

### 7.2 System Design
Creating the database structure with proper relationships:
- One-to-Many: Customer → Orders
- One-to-Many: Order → OrderDetails
- Many-to-Many: Orders ↔ FoodItems (resolved through OrderDetails junction table)

### 7.3 Database Creation
Implementing the database using SQL `CREATE TABLE` statements with appropriate constraints:
- `PRIMARY KEY` — Unique identification for each record
- `FOREIGN KEY` — Referential integrity between tables
- `CHECK` — Data validation (e.g., Price > 0, valid status values)
- `DEFAULT` — Automatic value assignment (e.g., timestamps, availability)
- `NOT NULL` — Mandatory field enforcement

### 7.4 Data Insertion
Adding sample data using `INSERT` statements for testing and demonstration purposes:
- 8 sample customers with Pakistani names and contact details
- 15 food items across 9 categories with emoji icons
- 11 sample orders with various statuses and dates

### 7.5 API Implementation
Building RESTful API endpoints for all CRUD operations:
- `GET`, `POST`, `PUT`, `DELETE` for Customers and Food Items
- `GET`, `POST`, `PATCH`, `DELETE` for Orders
- `GET` for various report endpoints

### 7.6 Query Implementation
Writing SQL queries to perform operations such as:
- **Data retrieval** — `SELECT` with `WHERE`, `ORDER BY`, `LIMIT`
- **JOIN operations** — `INNER JOIN` across multiple tables
- **Aggregations** — `SUM()`, `COUNT()`, `AVG()`, `GROUP BY`
- **Subqueries** — Nested queries for average order value calculation
- **Transactions** — Atomic order creation ensuring data consistency

### 7.7 Frontend Development
Building a modern, responsive web interface using React.js with:
- Dashboard with interactive charts
- CRUD forms for data management
- Cart-based order placement system
- Tabbed reporting interface

### 7.8 Testing and Validation
Testing the system to ensure correct functionality:
- Verified all CRUD operations work correctly
- Tested foreign key constraints (cascade delete)
- Validated bill calculations against manual calculations
- Tested report accuracy with sample data

---

## 8. Database Design

### 8.1 Entity-Relationship (ER) Diagram

```
┌──────────────┐         ┌──────────────┐
│  Customers   │         │  FoodItems   │
├──────────────┤         ├──────────────┤
│ CustomerID PK│───┐     │ ItemID    PK │───┐
│ Name         │   │     │ ItemName     │   │
│ Contact      │   │     │ Category     │   │
│ Email        │   │     │ Price        │   │
│ CreatedAt    │   │     │ Availability │   │
└──────────────┘   │     │ ImageEmoji   │   │
                   │     │ CreatedAt    │   │
                   │     └──────────────┘   │
                   │                        │
              1:M  │                        │  M:1
                   │                        │
                   ▼                        ▼
             ┌──────────────┐    ┌──────────────────┐
             │   Orders     │    │  OrderDetails    │
             ├──────────────┤    ├──────────────────┤
             │ OrderID   PK │──▶ │ DetailID      PK │
             │ CustomerID FK│    │ OrderID       FK │
             │ OrderDate    │    │ ItemID        FK │
             │ Status       │    │ Quantity         │
             └──────────────┘    │ PriceAtOrder     │
                                 └──────────────────┘
```

### 8.2 Entities and Attributes

#### Table: Customers
| Attribute | Data Type | Constraint | Description |
|-----------|-----------|------------|-------------|
| CustomerID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique customer identifier |
| Name | TEXT | NOT NULL | Customer full name |
| Contact | TEXT | NOT NULL | Phone number |
| Email | TEXT | — | Email address (optional) |
| WalletBalance | REAL | NOT NULL, DEFAULT 500.0, CHECK(WalletBalance >= 0) | Digital wallet cash balance |
| LoyaltyPoints | INTEGER | NOT NULL, DEFAULT 0, CHECK(LoyaltyPoints >= 0) | Reward points balance |
| CreatedAt | TEXT | DEFAULT datetime('now') | Registration timestamp |

#### Table: FoodItems
| Attribute | Data Type | Constraint | Description |
|-----------|-----------|------------|-------------|
| ItemID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique item identifier |
| ItemName | TEXT | NOT NULL | Name of the food item |
| Category | TEXT | NOT NULL, DEFAULT 'General' | Food category |
| Price | REAL | NOT NULL, CHECK(Price > 0) | Price in Rs. |
| Availability | INTEGER | NOT NULL, DEFAULT 1 | 1 = Available, 0 = Unavailable |
| ImageEmoji | TEXT | DEFAULT '🍽️' | Emoji icon for UI display |
| CreatedAt | TEXT | DEFAULT datetime('now') | Creation timestamp |

#### Table: Orders
| Attribute | Data Type | Constraint | Description |
|-----------|-----------|------------|-------------|
| OrderID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique order identifier |
| CustomerID | INTEGER | FOREIGN KEY → Customers(CustomerID) | Customer who placed the order |
| OrderDate | TEXT | DEFAULT datetime('now') | Order placement timestamp |
| Status | TEXT | CHECK(IN: Pending, Preparing, Ready, Delivered, Cancelled) | Current order status |
| PaymentMethod | TEXT | NOT NULL, DEFAULT 'Cash', CHECK(PaymentMethod IN ('Cash', 'Wallet')) | Payment method used |

#### Table: OrderDetails
| Attribute | Data Type | Constraint | Description |
|-----------|-----------|------------|-------------|
| DetailID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique detail identifier |
| OrderID | INTEGER | FOREIGN KEY → Orders(OrderID) | Parent order reference |
| ItemID | INTEGER | FOREIGN KEY → FoodItems(ItemID) | Food item reference |
| Quantity | INTEGER | NOT NULL, CHECK(Quantity > 0) | Number of items ordered |
| PriceAtOrder | REAL | NOT NULL | Price at time of order (preserves historical pricing) |

### 8.3 Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| Customers → Orders | One-to-Many | One customer can place multiple orders |
| Orders → OrderDetails | One-to-Many | One order can contain multiple items |
| FoodItems → OrderDetails | One-to-Many | One food item can appear in multiple order details |
| Orders ↔ FoodItems | Many-to-Many | Resolved through the OrderDetails junction table |

### 8.4 Normalization

The database is normalized up to **Third Normal Form (3NF)**:

**First Normal Form (1NF):**
- All columns contain atomic (indivisible) values
- Each row is unique (identified by primary key)
- No repeating groups

**Second Normal Form (2NF):**
- Satisfies 1NF
- All non-key attributes are fully dependent on the primary key
- No partial dependencies (OrderDetails uses composite foreign keys, not composite primary key)

**Third Normal Form (3NF):**
- Satisfies 2NF
- No transitive dependencies
- PriceAtOrder in OrderDetails stores price at time of order (not dependent on FoodItems.Price which may change)
- Customer information is stored only in Customers table, not repeated in Orders

---

## 9. SQL Implementation

### 9.1 DDL — Data Definition Language

#### CREATE TABLE Statements:

```sql
CREATE TABLE IF NOT EXISTS Customers (
    CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Contact TEXT NOT NULL,
    Email TEXT,
    WalletBalance REAL NOT NULL DEFAULT 500.0 CHECK(WalletBalance >= 0),
    LoyaltyPoints INTEGER NOT NULL DEFAULT 0 CHECK(LoyaltyPoints >= 0),
    CreatedAt TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS FoodItems (
    ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemName TEXT NOT NULL,
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
    Status TEXT NOT NULL DEFAULT 'Pending'
        CHECK(Status IN ('Pending','Preparing','Ready','Delivered','Cancelled')),
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
```

### 9.2 DML — Data Manipulation Language

#### INSERT — Adding Sample Data:

```sql
-- Inserting Customers
INSERT INTO Customers (Name, Contact, Email) VALUES
    ('Ahmed Khan', '0301-1234567', 'ahmed.khan@email.com'),
    ('Sara Ali', '0312-9876543', 'sara.ali@email.com'),
    ('Usman Raza', '0333-5551234', 'usman.raza@email.com');

-- Inserting Food Items
INSERT INTO FoodItems (ItemName, Category, Price, Availability, ImageEmoji) VALUES
    ('Chicken Biryani', 'Rice', 250, 1, '🍚'),
    ('Beef Burger', 'Fast Food', 350, 1, '🍔'),
    ('Chicken Shawarma', 'Fast Food', 200, 1, '🌯'),
    ('Cold Coffee', 'Beverages', 180, 1, '☕');

-- Inserting an Order
INSERT INTO Orders (CustomerID) VALUES (1);

-- Inserting Order Details
INSERT INTO OrderDetails (OrderID, ItemID, Quantity, PriceAtOrder) VALUES
    (1, 1, 2, 250),  -- 2x Chicken Biryani
    (1, 4, 1, 180);  -- 1x Cold Coffee
```

#### UPDATE — Modifying Records:

```sql
-- Update customer contact
UPDATE Customers SET Contact = '0300-9999999' WHERE CustomerID = 1;

-- Update food item price
UPDATE FoodItems SET Price = 280 WHERE ItemID = 1;

-- Update order status
UPDATE Orders SET Status = 'Delivered' WHERE OrderID = 1;

-- Toggle food item availability
UPDATE FoodItems SET Availability = 0 WHERE ItemID = 3;
```

#### DELETE — Removing Records:

```sql
-- Delete a customer (cascades to their orders)
DELETE FROM Customers WHERE CustomerID = 5;

-- Delete a food item
DELETE FROM FoodItems WHERE ItemID = 10;

-- Delete an order (cascades to order details)
DELETE FROM Orders WHERE OrderID = 3;
```

### 9.3 DQL — Data Query Language

#### Simple SELECT Queries:

```sql
-- Get all customers
SELECT * FROM Customers ORDER BY CreatedAt DESC;

-- Get available food items
SELECT * FROM FoodItems WHERE Availability = 1 ORDER BY Category, ItemName;

-- Get pending orders
SELECT * FROM Orders WHERE Status = 'Pending';
```

#### JOIN Queries:

```sql
-- Get all orders with customer information and total amount
SELECT o.OrderID, o.OrderDate, o.Status,
    c.CustomerID, c.Name AS CustomerName, c.Contact,
    COUNT(od.DetailID) AS ItemCount,
    SUM(od.Quantity) AS TotalQuantity,
    SUM(od.Quantity * od.PriceAtOrder) AS TotalAmount
FROM Orders o
JOIN Customers c ON o.CustomerID = c.CustomerID
LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
GROUP BY o.OrderID
ORDER BY o.OrderDate DESC;

-- Get full order details with item information
SELECT od.DetailID, od.Quantity, od.PriceAtOrder,
    f.ItemID, f.ItemName, f.Category, f.ImageEmoji,
    (od.Quantity * od.PriceAtOrder) AS Subtotal
FROM OrderDetails od
JOIN FoodItems f ON od.ItemID = f.ItemID
WHERE od.OrderID = 1;

-- Get customer data with aggregated order statistics
SELECT c.*,
    COUNT(DISTINCT o.OrderID) AS TotalOrders,
    COALESCE(SUM(od.Quantity * od.PriceAtOrder), 0) AS TotalSpent
FROM Customers c
LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
GROUP BY c.CustomerID;
```

#### Aggregation & Report Queries:

```sql
-- Daily Sales Report (last 7 days)
SELECT date(o.OrderDate) AS Date,
    COUNT(DISTINCT o.OrderID) AS OrderCount,
    SUM(od.Quantity * od.PriceAtOrder) AS Revenue
FROM Orders o
JOIN OrderDetails od ON o.OrderID = od.OrderID
WHERE o.Status != 'Cancelled'
    AND date(o.OrderDate) >= date('now', 'localtime', '-6 days')
GROUP BY date(o.OrderDate)
ORDER BY Date ASC;

-- Most Popular Items
SELECT f.ItemName, f.Category, f.Price,
    SUM(od.Quantity) AS TotalQuantity,
    SUM(od.Quantity * od.PriceAtOrder) AS TotalRevenue,
    COUNT(DISTINCT od.OrderID) AS OrderCount
FROM FoodItems f
JOIN OrderDetails od ON f.ItemID = od.ItemID
JOIN Orders o ON od.OrderID = o.OrderID
WHERE o.Status != 'Cancelled'
GROUP BY f.ItemID
ORDER BY TotalQuantity DESC
LIMIT 10;

-- Revenue by Category
SELECT f.Category,
    SUM(od.Quantity * od.PriceAtOrder) AS Revenue,
    SUM(od.Quantity) AS TotalItems
FROM FoodItems f
JOIN OrderDetails od ON f.ItemID = od.ItemID
JOIN Orders o ON od.OrderID = o.OrderID
WHERE o.Status != 'Cancelled'
GROUP BY f.Category
ORDER BY Revenue DESC;

-- Top Customers by Spending
SELECT c.Name, c.Contact,
    COUNT(DISTINCT o.OrderID) AS OrderCount,
    SUM(od.Quantity * od.PriceAtOrder) AS TotalSpent
FROM Customers c
JOIN Orders o ON c.CustomerID = o.CustomerID
JOIN OrderDetails od ON o.OrderID = od.OrderID
WHERE o.Status != 'Cancelled'
GROUP BY c.CustomerID
ORDER BY TotalSpent DESC
LIMIT 5;

-- Average Order Value (Subquery)
SELECT COALESCE(AVG(order_total), 0) AS AvgOrderValue FROM (
    SELECT SUM(od.Quantity * od.PriceAtOrder) AS order_total
    FROM OrderDetails od
    JOIN Orders o ON od.OrderID = o.OrderID
    WHERE o.Status != 'Cancelled'
    GROUP BY od.OrderID
);

-- Order Status Distribution
SELECT Status, COUNT(*) AS Count
FROM Orders
GROUP BY Status;

-- Total Revenue
SELECT COALESCE(SUM(od.Quantity * od.PriceAtOrder), 0) AS TotalRevenue
FROM OrderDetails od
JOIN Orders o ON od.OrderID = o.OrderID
WHERE o.Status != 'Cancelled';
```

#### Transaction Example (Order Creation):

```sql
BEGIN TRANSACTION;

-- Step 1: Create the order (specifying payment method)
INSERT INTO Orders (CustomerID, PaymentMethod) VALUES (1, 'Wallet');

-- Step 2: Get the new order ID (e.g. 12)

-- Step 3: Insert order details (which fire the wallet deduction trigger)
INSERT INTO OrderDetails (OrderID, ItemID, Quantity, PriceAtOrder)
    VALUES (12, 1, 2, 250);
INSERT INTO OrderDetails (OrderID, ItemID, Quantity, PriceAtOrder)
    VALUES (12, 7, 1, 180);

COMMIT;
-- If any step fails (e.g., wallet balance drops below 0), ROLLBACK is executed.
```

---

### 9.4 Triggers (Automated Event Logic)

Triggers automate processes upon data changes and enforce complex database integrity rules.

#### Trigger 1: Wallet Balance Auto-Deduction
Fires `AFTER INSERT` on `OrderDetails`. If the parent order's `PaymentMethod` is `'Wallet'`, it automatically decrements the total price from the customer's wallet. If the wallet goes below 0, the customer's table `CHECK` constraint fails and the transaction is aborted.

```sql
CREATE TRIGGER IF NOT EXISTS deduct_wallet_on_order_detail
AFTER INSERT ON OrderDetails
WHEN (SELECT PaymentMethod FROM Orders WHERE OrderID = NEW.OrderID) = 'Wallet'
BEGIN
  UPDATE Customers
  SET WalletBalance = WalletBalance - (NEW.Quantity * NEW.PriceAtOrder)
  WHERE CustomerID = (SELECT CustomerID FROM Orders WHERE OrderID = NEW.OrderID);
END;
```

#### Trigger 2: Wallet Refund on Order Cancellation
Fires `AFTER UPDATE` of `Status` on `Orders`. If the status changes to `'Cancelled'` and payment was made via `'Wallet'`, the database automatically calculates the sum of the order items and refunds it back to the customer's wallet.

```sql
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
```

#### Trigger 3: Loyalty Points Awarding on Successful Delivery
Fires `AFTER UPDATE` of `Status` on `Orders`. When an order status updates to `'Delivered'`, it calculates 10% of the total order value and credits it as loyalty points to the customer's account.

```sql
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
```

---

### 9.5 Indexing (Performance Optimization)

SQLite automatically indexes primary keys and unique columns, but does not index foreign keys. We explicitly added index definitions to optimize performance for the frequent `JOIN` queries between `Orders`, `OrderDetails`, and `Customers`.

```sql
-- Optimize lookups for customer orders
CREATE INDEX IF NOT EXISTS idx_orders_customer ON Orders(CustomerID);

-- Optimize join queries between Orders and OrderDetails
CREATE INDEX IF NOT EXISTS idx_orderdetails_order ON OrderDetails(OrderID);

-- Optimize join queries between OrderDetails and FoodItems
CREATE INDEX IF NOT EXISTS idx_orderdetails_item ON OrderDetails(ItemID);
```

#### Verification via Explain Query Plan
Running `EXPLAIN QUERY PLAN` shows that SQLite utilizes `idx_orderdetails_order` rather than performing a full-table scan (O(N)) when showing itemized details for a single order, resulting in an O(log N) lookup time.

---

### 9.6 Stored Procedures (SQLite Transaction Blocks)

SQLite does not support native `CREATE PROCEDURE` syntax. To demonstrate stored procedure concepts, we encapsulate transactional, multi-query business logic on the backend application server inside structured database transaction functions.

#### 1. Place Order Procedure (`sp_place_order`)
Wraps the double insert (creating the order first, then looping and inserting each item in `OrderDetails`) in a single database transaction. This ensures that if any item insertion fails (or the wallet balance check is violated), the entire order is rolled back (Atomicity).

```javascript
// JavaScript equivalent of a database Stored Procedure
const sp_place_order = db.transaction((custId, paymentMthd, orderItems) => {
  // 1. Insert parent order
  const orderResult = db.prepare(
    'INSERT INTO Orders (CustomerID, PaymentMethod) VALUES (?, ?)'
  ).run(custId, paymentMthd);
  
  const orderId = orderResult.lastInsertRowid;
  const insertDetail = db.prepare(
    'INSERT INTO OrderDetails (OrderID, ItemID, Quantity, PriceAtOrder) VALUES (?, ?, ?, ?)'
  );

  // 2. Loop and insert details (fires the deduct_wallet trigger)
  for (const item of orderItems) {
    const food = db.prepare('SELECT * FROM FoodItems WHERE ItemID = ? AND Availability = 1').get(item.ItemID);
    if (!food) throw new Error(`Food item ${item.ItemID} not found or unavailable`);
    insertDetail.run(orderId, item.ItemID, item.Quantity, food.Price);
  }

  return orderId;
});
```

#### 2. Top-Up Wallet Procedure (`sp_topup_wallet`)
Ensures that verifying the customer exists and updating their balance is handled atomically.

```javascript
const sp_topup_wallet = db.transaction((id, amt) => {
  const customer = db.prepare('SELECT * FROM Customers WHERE CustomerID = ?').get(id);
  if (!customer) throw new Error('Customer not found');

  db.prepare('UPDATE Customers SET WalletBalance = WalletBalance + ? WHERE CustomerID = ?')
    .run(amt, id);

  return db.prepare('SELECT * FROM Customers WHERE CustomerID = ?').get(id);
});
```

---

## 10. Functional Requirements

| # | Requirement | Implementation |
|---|-------------|----------------|
| 1 | Add, update, and delete customer records | Customers page with modal forms |
| 2 | Add, update, and delete food items | Food Items page with card grid and modal |
| 3 | Place and manage orders | New Order page with interactive cart |
| 4 | Store order details | OrderDetails table with foreign keys |
| 5 | Calculate total bill | `SUM(Quantity × PriceAtOrder)` SQL aggregation |
| 6 | Update order status | Dropdown selector on Order History page |
| 7 | Generate total sales report | Reports → Sales tab with area chart |
| 8 | Identify most popular items | Reports → Popular Items tab with bar chart |
| 9 | View order history | Order History page with search and filters |
| 10 | Track item availability | Food Items toggle switch |

---

## 11. Non-Functional Requirements

| Requirement | How It Is Achieved |
|-------------|-------------------|
| **Simplicity** | Clean, intuitive dark-themed UI with clear navigation |
| **Data Consistency** | Foreign key constraints with ON DELETE CASCADE |
| **Data Integrity** | CHECK constraints, NOT NULL, transactions |
| **Performance** | SQLite WAL mode, indexed primary keys, efficient queries |
| **Reliability** | Transactions for order creation, error handling on all API endpoints |
| **Accuracy** | PriceAtOrder preserves historical pricing; SQL aggregations for calculations |

---

## 12. Features of the System

### 12.1 Dashboard
- Total revenue, orders, customers, pending orders at a glance
- Daily sales bar chart (last 7 days)
- Revenue by category pie chart (donut)
- Most popular items table
- Recent orders with status badges

### 12.2 Customer Management
- Full CRUD (Create, Read, Update, Delete)
- Search by name or contact
- Aggregated stats: total orders and total spent per customer
- Modal-based add/edit forms

### 12.3 Food Item Management
- Visual card grid layout with emoji icons
- Category-based filtering (pills)
- Search functionality
- Availability toggle switch
- Price and category management
- Order count per item

### 12.4 Order Placement
- Customer selection dropdown
- Searchable food item grid
- Click-to-add cart interaction
- Quantity controls (+/−)
- Real-time subtotal and total calculation
- Order summary before submission

### 12.5 Order History
- Complete order listing with search
- Status filter pills (All, Pending, Preparing, Ready, Delivered, Cancelled)
- Inline status update dropdown
- Detailed order view panel (click to expand)
- Itemized bill display

### 12.6 Reports & Analytics
- **Sales Report**: Area chart + daily breakdown table
- **Popular Items**: Horizontal bar chart + detailed item table
- **Categories**: Pie chart + category breakdown with percentages
- **Top Customers**: Bar chart + ranked customer table
- **Order Status**: Pie chart + status distribution table

---

## 13. Tools and Technologies

| Tool / Technology | Purpose |
|-------------------|---------|
| **SQLite** | Lightweight relational database engine (replaces SQL Server/SSMS) |
| **SQL** | DDL, DML, DQL operations |
| **Node.js** | JavaScript runtime for backend server |
| **Express.js** | Web framework for building RESTful APIs |
| **better-sqlite3** | High-performance SQLite library for Node.js |
| **React.js 18** | Frontend UI library for building interactive pages |
| **Vite** | Fast build tool and development server |
| **Recharts** | Charting library for data visualization |
| **Lucide React** | Icon library for UI elements |
| **React Router** | Client-side routing for single-page app navigation |
| **CSS (Custom)** | Premium dark theme with glassmorphism and animations |

---

## 14. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                  │
│  ┌───────────────────────────────────────────────┐  │
│  │            React.js Frontend (Vite)           │  │
│  │  ┌──────────┬──────────┬──────────┬────────┐  │  │
│  │  │Dashboard │Customers │FoodItems │ Orders │  │  │
│  │  │          │          │          │Reports │  │  │
│  │  └──────────┴──────────┴──────────┴────────┘  │  │
│  │           Recharts │ Lucide │ Router           │  │
│  └───────────────────────┬───────────────────────┘  │
│                          │ HTTP Requests (fetch)     │
│                          ▼                           │
│  ┌───────────────────────────────────────────────┐  │
│  │          Express.js Backend (API Server)       │  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │  /api/customers   → CRUD Operations      │ │  │
│  │  │  /api/food-items  → CRUD + Toggle        │ │  │
│  │  │  /api/orders      → CRUD + Status Update │ │  │
│  │  │  /api/reports     → Analytics Queries     │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  │                       │                        │  │
│  │                       ▼                        │  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │        SQLite Database (canteen.db)       │ │  │
│  │  │  ┌───────────┐  ┌────────────────────┐   │ │  │
│  │  │  │ Customers │  │    FoodItems       │   │ │  │
│  │  │  └─────┬─────┘  └────────┬───────────┘   │ │  │
│  │  │        │                 │               │ │  │
│  │  │        ▼                 ▼               │ │  │
│  │  │  ┌───────────┐  ┌────────────────────┐   │ │  │
│  │  │  │  Orders   │──│   OrderDetails     │   │ │  │
│  │  │  └───────────┘  └────────────────────┘   │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User interacts with React frontend (e.g., places an order)
2. Frontend sends HTTP request to Express API (`POST /api/orders`)
3. Express route handler executes SQL queries on SQLite database
4. Database returns results
5. Express sends JSON response back to frontend
6. React updates the UI with the new data

---

## 15. Screenshots / UI Overview

### 15.1 Dashboard
The dashboard provides a comprehensive overview with:
- 4 stats cards showing Total Revenue, Total Orders, Customers, and Pending Orders
- Daily sales bar chart with gradient fills
- Revenue by category donut chart
- Most popular items table ranked by quantity
- Recent orders table with colored status badges

### 15.2 Customer Management
- Clean table view with search functionality
- Each row shows: ID, Name, Contact, Email, Total Orders, Total Spent
- Edit and Delete action buttons per row
- Modal popup for adding/editing with form validation

### 15.3 Food Items
- Visual card grid with food emoji icons
- Category filter pills for quick filtering
- Each card shows: emoji, name, category, price, availability badge
- Toggle switch for availability, edit and delete buttons

### 15.4 New Order
- Split layout: menu grid (left) + cart panel (right)
- Customer dropdown selector
- Click-to-add food items with quantity badge
- Cart with +/− controls and real-time total
- Order summary with itemized bill before submission

### 15.5 Order History
- Full order table with search and status filter pills
- Inline status dropdown for quick status updates
- Click on any order to expand detail panel on the right
- Detail panel shows customer info, itemized items, and total bill

### 15.6 Reports
- 5-tab interface: Sales, Popular Items, Categories, Top Customers, Order Status
- Each tab includes both chart visualization and detailed data table
- SQL queries displayed for educational reference

---

## 16. Expected Outcomes

| # | Outcome | Status |
|---|---------|--------|
| 1 | Efficient management of canteen operations | ✅ Achieved |
| 2 | Accurate and automated billing system | ✅ Achieved via SQL SUM aggregation |
| 3 | Organized and structured data storage | ✅ Achieved with 3NF-normalized schema |
| 4 | Easy data retrieval and reporting | ✅ Achieved with 5 report types |
| 5 | Reduction in manual errors | ✅ Achieved through form validation and constraints |
| 6 | Real-time availability tracking | ✅ Achieved with availability toggle |
| 7 | Order status management | ✅ Achieved with 5-stage workflow |

---

## 17. Limitations

1. **Lightweight database** — SQLite is used instead of a full RDBMS like SQL Server or MySQL; suitable for small-scale but not for concurrent multi-user production environments
2. **Single-user system** — No authentication or user roles implemented
3. **Local deployment only** — Runs on localhost; not hosted on a web server
4. **No payment integration** — Bill calculation only; no actual payment processing
5. **No real-time notifications** — Status changes require manual page refresh
6. **Basic reporting** — Limited to last 7 days for sales reports

---

## 18. Future Enhancements

1. **User Authentication** — Login system with admin and cashier roles
2. **Online Ordering** — Web-based ordering for customers with QR code menu
3. **Mobile App** — React Native version for mobile devices
4. **Real-time Updates** — WebSocket integration for live order tracking
5. **Payment Integration** — JazzCash, EasyPaisa, or card payment support
6. **Inventory Management** — Ingredient-level stock tracking with low-stock alerts
7. **Cloud Deployment** — Host on AWS, Heroku, or Vercel for remote access
8. **Receipt Printing** — Generate and print order receipts/bills
9. **Advanced Analytics** — Monthly/yearly trends, profit margins, peak hour analysis
10. **Migration to SQL Server** — Scale to a production-grade RDBMS

---

## 19. Conclusion

The **Canteen Order Management System** is a comprehensive database-driven solution that effectively addresses the limitations of manual canteen management systems. By implementing this project, the following core DBMS concepts have been demonstrated in a practical, real-world context:

- **Relational database design** with proper entity identification and relationship mapping
- **Normalization up to 3NF** ensuring data consistency and eliminating redundancy
- **SQL operations** including DDL (table creation with constraints), DML (data manipulation), and DQL (complex queries with JOINs and aggregations)
- **Referential integrity** through foreign key constraints with cascade operations
- **Transactions** for maintaining atomicity during order creation
- **Aggregate functions** (SUM, COUNT, AVG) for automated billing and reporting

The addition of a modern web interface transforms the raw SQL backend into an intuitive, visually appealing application that demonstrates how databases serve as the backbone of real-world software systems.

This project serves as a strong foundation for understanding database applications and can be extended with additional features such as authentication, online ordering, and cloud deployment.

---

## 20. References

1. Elmasri, R., & Navathe, S. B. — *Fundamentals of Database Systems* (7th Edition)
2. SQLite Documentation — https://www.sqlite.org/docs.html
3. Express.js Documentation — https://expressjs.com
4. React.js Documentation — https://react.dev
5. MDN Web Docs — SQL Basics — https://developer.mozilla.org/en-US/docs/Glossary/SQL
6. better-sqlite3 Documentation — https://github.com/WiseLibs/better-sqlite3

---

*This report was prepared as part of the DBMS Lab course project. The complete source code is available in the project directory.*
