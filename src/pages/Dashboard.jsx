import { useState, useEffect } from 'react'
import {
  Users, UtensilsCrossed, ShoppingCart, DollarSign,
  TrendingUp, Clock, ArrowUpRight, Package
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#ff7a2f', '#a855f7', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [dailySales, setDailySales] = useState([])
  const [popularItems, setPopularItems] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [categoryRevenue, setCategoryRevenue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/reports/dashboard').then(r => r.json()),
      fetch('/api/reports/daily-sales').then(r => r.json()),
      fetch('/api/reports/popular-items').then(r => r.json()),
      fetch('/api/reports/recent-orders').then(r => r.json()),
      fetch('/api/reports/category-revenue').then(r => r.json()),
    ]).then(([s, ds, pi, ro, cr]) => {
      setStats(s)
      setDailySales(ds.map(d => ({
        ...d,
        Date: new Date(d.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })))
      setPopularItems(pi)
      setRecentOrders(ro)
      setCategoryRevenue(cr)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const formatCurrency = (val) => `Rs. ${Number(val).toLocaleString()}`

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), sub: `Today: ${formatCurrency(stats.todayRevenue)}`, icon: DollarSign, color: 'orange' },
    { label: 'Total Orders', value: stats.totalOrders, sub: `Today: ${stats.todayOrders}`, icon: ShoppingCart, color: 'blue' },
    { label: 'Customers', value: stats.totalCustomers, sub: `Avg Order: ${formatCurrency(stats.avgOrderValue)}`, icon: Users, color: 'purple' },
    { label: 'Pending Orders', value: stats.pendingOrders, sub: `${stats.totalItems} menu items`, icon: Clock, color: 'green' },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome back! Here's an overview of your canteen operations.</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className={`stat-card ${s.color}`}>
              <div className={`stat-icon ${s.color}`}>
                <Icon />
              </div>
              <div className="stat-info">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-subtitle">{s.sub}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="data-grid">
        {/* Daily Sales Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Daily Sales (Last 7 Days)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="Date" stroke="#5c5c74" fontSize={12} />
                <YAxis stroke="#5c5c74" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f0f0f5',
                    fontSize: '0.85rem'
                  }}
                  formatter={(value) => [`Rs. ${value}`, 'Revenue']}
                />
                <Bar dataKey="Revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff7a2f" />
                    <stop offset="100%" stopColor="#ff4d00" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Pie */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🍕 Revenue by Category</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="Revenue"
                  nameKey="Category"
                >
                  {categoryRevenue.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f0f0f5',
                    fontSize: '0.85rem'
                  }}
                  formatter={(value) => [`Rs. ${value}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
            {categoryRevenue.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                <span style={{ color: '#8888a0' }}>{c.Category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="data-grid">
        {/* Popular Items */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔥 Most Popular Items</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th className="text-right">Ordered</th>
                  <th className="text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {popularItems.slice(0, 5).map((item, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ marginRight: 8 }}>{item.ImageEmoji}</span>
                      {item.ItemName}
                    </td>
                    <td className="text-secondary">{item.Category}</td>
                    <td className="text-right font-bold">{item.TotalQuantity}</td>
                    <td className="text-right text-accent font-bold">{formatCurrency(item.TotalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Recent Orders</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={i}>
                    <td className="font-bold">#{order.OrderID}</td>
                    <td>{order.CustomerName}</td>
                    <td>
                      <span className={`badge ${order.Status.toLowerCase()}`}>
                        <span className="badge-dot" />
                        {order.Status}
                      </span>
                    </td>
                    <td className="text-right text-accent font-bold">{formatCurrency(order.TotalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
