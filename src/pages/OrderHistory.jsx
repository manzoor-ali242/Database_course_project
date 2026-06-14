import { useState, useEffect } from 'react'
import { Search, Eye, Trash2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetail, setOrderDetail] = useState(null)

  const fetchOrders = () => {
    fetch('/api/orders').then(r => r.json()).then(data => {
      setOrders(data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchOrders() }, [])

  const viewOrder = async (id) => {
    const res = await fetch(`/api/orders/${id}`)
    const data = await res.json()
    setOrderDetail(data)
    setSelectedOrder(id)
  }

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Status: status })
    })
    if (res.ok) {
      toast.success(`Order #${id} → ${status}`)
      fetchOrders()
      if (orderDetail && orderDetail.OrderID === id) {
        setOrderDetail({ ...orderDetail, Status: status })
      }
    }
  }

  const deleteOrder = async (id) => {
    if (!confirm(`Delete order #${id}?`)) return
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Order deleted')
      fetchOrders()
      if (selectedOrder === id) {
        setSelectedOrder(null)
        setOrderDetail(null)
      }
    }
  }

  const filtered = orders.filter(o => {
    const matchSearch = o.CustomerName.toLowerCase().includes(search.toLowerCase()) ||
      `#${o.OrderID}`.includes(search)
    const matchStatus = filterStatus === 'All' || o.Status === filterStatus
    return matchSearch && matchStatus
  })

  const statuses = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled']

  const formatDate = (d) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h2>Order History</h2>
        <p>View and manage all canteen orders.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="search-box">
          <Search />
          <input
            className="form-input"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-pills">
        {statuses.map(s => (
          <button
            key={s}
            className={`filter-pill ${filterStatus === s ? 'active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="data-grid" style={{ gridTemplateColumns: selectedOrder ? '1fr 400px' : '1fr' }}>
        {/* Orders Table */}
        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No orders found</h3>
              <p>Try a different search or filter.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.OrderID} style={{
                      background: selectedOrder === o.OrderID ? 'var(--accent-glow)' : undefined,
                      cursor: 'pointer'
                    }} onClick={() => viewOrder(o.OrderID)}>
                      <td className="font-bold text-accent">#{o.OrderID}</td>
                      <td className="font-bold">{o.CustomerName}</td>
                      <td className="text-secondary" style={{ fontSize: '0.82rem' }}>{formatDate(o.OrderDate)}</td>
                      <td>{o.TotalQuantity} items</td>
                      <td>
                        <span className="badge" style={{
                          background: o.PaymentMethod === 'Wallet' ? 'var(--success-bg)' : 'var(--info-bg)',
                          color: o.PaymentMethod === 'Wallet' ? 'var(--success)' : 'var(--info)',
                          fontSize: '0.72rem'
                        }}>
                          {o.PaymentMethod === 'Wallet' ? '💳 Wallet' : '💵 Cash'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={o.Status}
                          onChange={e => { e.stopPropagation(); updateStatus(o.OrderID, e.target.value) }}
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Preparing">🍳 Preparing</option>
                          <option value="Ready">✅ Ready</option>
                          <option value="Delivered">🚀 Delivered</option>
                          <option value="Cancelled">❌ Cancelled</option>
                        </select>
                      </td>
                      <td className="text-right text-accent font-bold">Rs. {Number(o.TotalAmount).toLocaleString()}</td>
                      <td className="text-right">
                        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); viewOrder(o.OrderID) }} title="View">
                            <Eye style={{ width: 16, height: 16 }} />
                          </button>
                          <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); deleteOrder(o.OrderID) }} title="Delete">
                            <Trash2 style={{ width: 16, height: 16, color: 'var(--danger)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && orderDetail && (
          <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 32 }}>
            <div className="order-detail-header">
              <div>
                <div className="order-detail-id">Order #{orderDetail.OrderID}</div>
                <div className="text-secondary" style={{ fontSize: '0.82rem' }}>
                  {formatDate(orderDetail.OrderDate)}
                </div>
              </div>
              <span className={`badge ${orderDetail.Status.toLowerCase()}`}>
                <span className="badge-dot" />
                {orderDetail.Status}
              </span>
            </div>

            <div className="mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '16px' }}>
              <div>
                <div className="form-label">Customer</div>
                <div className="font-bold">{orderDetail.CustomerName}</div>
                <div className="text-secondary" style={{ fontSize: '0.82rem' }}>
                  {orderDetail.Contact} {orderDetail.Email && `• ${orderDetail.Email}`}
                </div>
              </div>
              <div>
                <div className="form-label">Payment</div>
                <span className="badge" style={{
                  background: orderDetail.PaymentMethod === 'Wallet' ? 'var(--success-bg)' : 'var(--info-bg)',
                  color: orderDetail.PaymentMethod === 'Wallet' ? 'var(--success)' : 'var(--info)',
                  fontSize: '0.72rem', marginTop: '4px'
                }}>
                  {orderDetail.PaymentMethod === 'Wallet' ? '💳 Wallet' : '💵 Cash'}
                </span>
              </div>
            </div>

            <div className="form-label">Order Items</div>
            <div className="order-detail-items">
              {orderDetail.details.map(d => (
                <div key={d.DetailID} className="order-item-row">
                  <div className="order-item-info">
                    <span className="order-item-emoji">{d.ImageEmoji}</span>
                    <div>
                      <div className="order-item-name">{d.ItemName}</div>
                      <div className="order-item-price">Rs. {d.PriceAtOrder} × {d.Quantity}</div>
                    </div>
                  </div>
                  <span className="order-item-subtotal">Rs. {Number(d.Subtotal).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="order-summary-row">
                <span className="text-secondary">Items</span>
                <span>{orderDetail.details.reduce((s, d) => s + d.Quantity, 0)}</span>
              </div>
              <div className="order-summary-row order-summary-total">
                <span>Total Bill</span>
                <span>Rs. {Number(orderDetail.TotalAmount).toLocaleString()}</span>
              </div>
              {orderDetail.Status === 'Delivered' && (
                <div className="order-summary-row" style={{ marginTop: '8px', color: 'var(--accent)', fontWeight: 600 }}>
                  <span>Loyalty Points Earned</span>
                  <span>+{Math.floor(orderDetail.TotalAmount * 0.10)} pts</span>
                </div>
              )}
              {orderDetail.Status === 'Cancelled' && orderDetail.PaymentMethod === 'Wallet' && (
                <div className="order-summary-row" style={{ marginTop: '8px', color: 'var(--success)', fontWeight: 600 }}>
                  <span>Refunded to Wallet</span>
                  <span>Rs. {Number(orderDetail.TotalAmount).toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              className="btn btn-secondary mt-4"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setSelectedOrder(null); setOrderDetail(null) }}
            >
              Close Details
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
