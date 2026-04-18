import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'

const COLORS = ['#ff7a2f', '#a855f7', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

const tooltipStyle = {
  contentStyle: {
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#f0f0f5',
    fontSize: '0.85rem'
  }
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales')
  const [dailySales, setDailySales] = useState([])
  const [popularItems, setPopularItems] = useState([])
  const [categoryRevenue, setCategoryRevenue] = useState([])
  const [topCustomers, setTopCustomers] = useState([])
  const [orderStatus, setOrderStatus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/reports/daily-sales').then(r => r.json()),
      fetch('/api/reports/popular-items').then(r => r.json()),
      fetch('/api/reports/category-revenue').then(r => r.json()),
      fetch('/api/reports/top-customers').then(r => r.json()),
      fetch('/api/reports/order-status').then(r => r.json()),
    ]).then(([ds, pi, cr, tc, os]) => {
      setDailySales(ds.map(d => ({
        ...d,
        Date: new Date(d.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })))
      setPopularItems(pi)
      setCategoryRevenue(cr)
      setTopCustomers(tc)
      setOrderStatus(os)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const tabs = [
    { id: 'sales', label: '💰 Sales Report' },
    { id: 'items', label: '🔥 Popular Items' },
    { id: 'categories', label: '📂 Categories' },
    { id: 'customers', label: '👥 Top Customers' },
    { id: 'status', label: '📊 Order Status' },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <p>Comprehensive insights into your canteen operations using SQL aggregations.</p>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SALES REPORT */}
      {activeTab === 'sales' && (
        <div>
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">📊 Daily Sales Revenue (Last 7 Days)</span>
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                SQL: SELECT date(OrderDate), SUM(Quantity * Price) ... GROUP BY date(OrderDate)
              </span>
            </div>
            <div className="chart-container" style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySales}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff7a2f" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ff7a2f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="Date" stroke="#5c5c74" fontSize={12} />
                  <YAxis stroke="#5c5c74" fontSize={12} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`Rs. ${v}`, 'Revenue']} />
                  <Area type="monotone" dataKey="Revenue" stroke="#ff7a2f" strokeWidth={2.5} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">📋 Daily Breakdown</span>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="text-right">Orders</th>
                    <th className="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {dailySales.map((d, i) => (
                    <tr key={i}>
                      <td className="font-bold">{d.Date}</td>
                      <td className="text-right">{d.OrderCount}</td>
                      <td className="text-right text-accent font-bold">Rs. {Number(d.Revenue).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPULAR ITEMS */}
      {activeTab === 'items' && (
        <div>
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">🔥 Most Frequently Ordered Items</span>
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                SQL: SELECT ItemName, SUM(Quantity) ... GROUP BY ItemID ORDER BY SUM(Quantity) DESC
              </span>
            </div>
            <div className="chart-container" style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#5c5c74" fontSize={12} />
                  <YAxis dataKey="ItemName" type="category" stroke="#5c5c74" fontSize={12} width={120} />
                  <Tooltip {...tooltipStyle} formatter={(v, name) => [name === 'TotalQuantity' ? `${v} units` : `Rs. ${v}`, name === 'TotalQuantity' ? 'Qty Sold' : 'Revenue']} />
                  <Bar dataKey="TotalQuantity" fill="#ff7a2f" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">📋 Detailed Item Report</span>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total Sold</th>
                    <th className="text-right">Orders</th>
                    <th className="text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {popularItems.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{ marginRight: 8 }}>{item.ImageEmoji}</span>
                        <span className="font-bold">{item.ItemName}</span>
                      </td>
                      <td className="text-secondary">{item.Category}</td>
                      <td className="text-right">Rs. {item.Price}</td>
                      <td className="text-right font-bold">{item.TotalQuantity}</td>
                      <td className="text-right">{item.OrderCount}</td>
                      <td className="text-right text-accent font-bold">Rs. {Number(item.TotalRevenue).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="data-grid">
          <div className="card">
            <div className="card-header">
              <span className="card-title">📂 Revenue by Category</span>
            </div>
            <div className="chart-container" style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={4} dataKey="Revenue" nameKey="Category" label={({ Category, percent }) => `${Category} (${(percent * 100).toFixed(0)}%)`}>
                    {categoryRevenue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v) => [`Rs. ${v}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">📋 Category Breakdown</span>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-right">Items Sold</th>
                    <th className="text-right">Revenue</th>
                    <th className="text-right">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRevenue.map((c, i) => {
                    const totalRev = categoryRevenue.reduce((s, x) => s + x.Revenue, 0)
                    return (
                      <tr key={i}>
                        <td>
                          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 10 }} />
                          <span className="font-bold">{c.Category}</span>
                        </td>
                        <td className="text-right">{c.TotalItems}</td>
                        <td className="text-right text-accent font-bold">Rs. {Number(c.Revenue).toLocaleString()}</td>
                        <td className="text-right">{((c.Revenue / totalRev) * 100).toFixed(1)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TOP CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 Top Customers by Spending</span>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              SQL: SELECT Name, SUM(Quantity * Price) ... GROUP BY CustomerID ORDER BY TotalSpent DESC
            </span>
          </div>
          <div className="data-grid">
            <div className="chart-container" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="Name" stroke="#5c5c74" fontSize={12} />
                  <YAxis stroke="#5c5c74" fontSize={12} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`Rs. ${v}`, 'Total Spent']} />
                  <Bar dataKey="TotalSpent" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th className="text-right">Orders</th>
                    <th className="text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28, borderRadius: '50%',
                          background: i === 0 ? 'var(--accent-glow)' : 'var(--bg-input)',
                          color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)',
                          fontWeight: 700, fontSize: '0.82rem'
                        }}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="font-bold">{c.Name}</td>
                      <td className="text-secondary">{c.Contact}</td>
                      <td className="text-right">{c.OrderCount}</td>
                      <td className="text-right text-accent font-bold">Rs. {Number(c.TotalSpent).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ORDER STATUS */}
      {activeTab === 'status' && (
        <div className="data-grid">
          <div className="card">
            <div className="card-header">
              <span className="card-title">📊 Order Status Distribution</span>
            </div>
            <div className="chart-container" style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatus} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={4} dataKey="Count" nameKey="Status" label={({ Status, Count }) => `${Status} (${Count})`}>
                    {orderStatus.map((entry, i) => {
                      const colors = { Pending: '#f59e0b', Preparing: '#3b82f6', Ready: '#a855f7', Delivered: '#22c55e', Cancelled: '#ef4444' }
                      return <Cell key={i} fill={colors[entry.Status] || COLORS[i]} />
                    })}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">📋 Status Summary</span>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th className="text-right">Count</th>
                    <th className="text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {orderStatus.map((s, i) => {
                    const total = orderStatus.reduce((sum, x) => sum + x.Count, 0)
                    return (
                      <tr key={i}>
                        <td>
                          <span className={`badge ${s.Status.toLowerCase()}`}>
                            <span className="badge-dot" />
                            {s.Status}
                          </span>
                        </td>
                        <td className="text-right font-bold">{s.Count}</td>
                        <td className="text-right">{((s.Count / total) * 100).toFixed(1)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
