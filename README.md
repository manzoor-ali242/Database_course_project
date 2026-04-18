# 🍽️ Canteen Order Management System

A full-stack database-driven canteen management system built with **React**, **Express.js**, and **SQLite**.

## 📋 DBMS Concepts Demonstrated

- **DDL**: CREATE TABLE with constraints (PRIMARY KEY, FOREIGN KEY, CHECK, DEFAULT)
- **DML**: INSERT, UPDATE, DELETE operations
- **DQL**: SELECT with JOIN, GROUP BY, aggregate functions (SUM, COUNT, AVG)
- **Normalization**: Database normalized to 3NF
- **Transactions**: Order creation uses SQL transactions
- **Relationships**: One-to-Many (Customer→Orders), Many-to-Many (Orders↔FoodItems via OrderDetails)

## 🚀 Quick Setup

### Step 1: Install Dependencies
Open a terminal in this folder and run:

```bash
npm install
```

### Step 2: Start the Application
```bash
npm run dev
```

This starts both:
- **Backend API** (Express + SQLite) → http://localhost:3001
- **Frontend** (React + Vite) → http://localhost:5173

### Step 3: Open in Browser
Go to: **http://localhost:5173**

## 📊 Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview with stats, charts, recent orders |
| **Customers** | Add, edit, delete customers (CRUD) |
| **Food Items** | Manage menu with categories, pricing, availability |
| **New Order** | Place orders with interactive cart and bill calculation |
| **Order History** | View, filter, update status of all orders |
| **Reports** | Sales analytics, popular items, category breakdown |

## 🗄️ Database Schema

```
Customers (CustomerID PK, Name, Contact, Email, CreatedAt)
FoodItems (ItemID PK, ItemName, Category, Price, Availability, ImageEmoji, CreatedAt)
Orders (OrderID PK, CustomerID FK→Customers, OrderDate, Status)
OrderDetails (DetailID PK, OrderID FK→Orders, ItemID FK→FoodItems, Quantity, PriceAtOrder)
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Recharts + Lucide Icons
- **Backend**: Express.js + better-sqlite3
- **Database**: SQLite (auto-created on first run)
- **Styling**: Custom CSS (dark theme with glassmorphism)
