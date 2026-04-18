import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function NewOrder() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [cart, setCart] = useState([]) // [{ItemID, ItemName, Price, ImageEmoji, Quantity}]
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/food-items').then(r => r.json()),
    ]).then(([c, f]) => {
      setCustomers(c)
      setFoodItems(f.filter(i => i.Availability))
      setLoading(false)
    })
  }, [])

  const filteredFood = foodItems.filter(f =>
    f.ItemName.toLowerCase().includes(search.toLowerCase()) ||
    f.Category.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (item) => {
    const existing = cart.find(c => c.ItemID === item.ItemID)
    if (existing) {
      setCart(cart.map(c => c.ItemID === item.ItemID ? { ...c, Quantity: c.Quantity + 1 } : c))
    } else {
      setCart([...cart, { ItemID: item.ItemID, ItemName: item.ItemName, Price: item.Price, ImageEmoji: item.ImageEmoji, Quantity: 1 }])
    }
  }

  const updateQty = (itemId, delta) => {
    setCart(cart
      .map(c => c.ItemID === itemId ? { ...c, Quantity: c.Quantity + delta } : c)
      .filter(c => c.Quantity > 0)
    )
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.ItemID !== itemId))
  }

  const subtotal = cart.reduce((sum, c) => sum + (c.Price * c.Quantity), 0)
  const totalItems = cart.reduce((sum, c) => sum + c.Quantity, 0)

  const handlePlaceOrder = async () => {
    if (!selectedCustomer) return toast.error('Please select a customer')
    if (cart.length === 0) return toast.error('Please add items to the order')

    setSubmitting(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        CustomerID: Number(selectedCustomer),
        items: cart.map(c => ({ ItemID: c.ItemID, Quantity: c.Quantity }))
      })
    })

    if (res.ok) {
      const order = await res.json()
      toast.success(`Order #${order.OrderID} placed successfully! Total: Rs. ${Number(order.TotalAmount).toLocaleString()}`)
      navigate('/orders')
    } else {
      const err = await res.json()
      toast.error(err.error)
    }
    setSubmitting(false)
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h2>New Order</h2>
        <p>Create a new order by selecting a customer and adding food items.</p>
      </div>

      <div className="data-grid" style={{ gridTemplateColumns: '1fr 380px' }}>
        {/* Left - Menu */}
        <div>
          {/* Customer Select */}
          <div className="card mb-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Customer *</label>
              <select
                className="form-select"
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
              >
                <option value="">-- Choose a customer --</option>
                {customers.map(c => (
                  <option key={c.CustomerID} value={c.CustomerID}>
                    {c.Name} ({c.Contact})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu Items */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🍽️ Menu Items</span>
              <div className="search-box" style={{ maxWidth: 220 }}>
                <input
                  className="form-input"
                  placeholder="Search menu..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 14, fontSize: '0.82rem' }}
                />
              </div>
            </div>
            <div className="food-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {filteredFood.map(item => {
                const inCart = cart.find(c => c.ItemID === item.ItemID)
                return (
                  <div
                    key={item.ItemID}
                    className="food-card"
                    onClick={() => addToCart(item)}
                    style={{ cursor: 'pointer', border: inCart ? '1px solid var(--accent)' : undefined }}
                  >
                    <span className="food-card-emoji" style={{ fontSize: '2rem' }}>{item.ImageEmoji}</span>
                    <div className="food-card-name" style={{ fontSize: '0.88rem' }}>{item.ItemName}</div>
                    <div className="food-card-category">{item.Category}</div>
                    <div className="food-card-price" style={{ fontSize: '1rem' }}>Rs. {item.Price}</div>
                    {inCart && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'var(--accent)', color: 'white',
                        width: 22, height: 22, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {inCart.Quantity}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right - Cart */}
        <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 32 }}>
          <div className="card-header">
            <span className="card-title">
              <ShoppingCart style={{ width: 18, height: 18, display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
              Cart ({totalItems} items)
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">🛒</div>
              <h3>Cart is empty</h3>
              <p>Click on menu items to add them to the order.</p>
            </div>
          ) : (
            <>
              <div className="order-items-list">
                {cart.map(item => (
                  <div key={item.ItemID} className="order-item-row">
                    <div className="order-item-info">
                      <span className="order-item-emoji">{item.ImageEmoji}</span>
                      <div>
                        <div className="order-item-name">{item.ItemName}</div>
                        <div className="order-item-price">Rs. {item.Price} each</div>
                      </div>
                    </div>
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.ItemID, -1)}>−</button>
                      <span>{item.Quantity}</span>
                      <button onClick={() => updateQty(item.ItemID, 1)}>+</button>
                    </div>
                    <span className="order-item-subtotal">Rs. {(item.Price * item.Quantity).toLocaleString()}</span>
                    <button className="btn btn-ghost btn-icon" onClick={() => removeFromCart(item.ItemID)}>
                      <X style={{ width: 14, height: 14, color: 'var(--danger)' }} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="order-summary-row">
                  <span className="text-secondary">Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="order-summary-row">
                  <span className="text-secondary">Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="order-summary-row order-summary-total">
                  <span>Total</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                className="btn btn-primary mt-4"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                <ShoppingCart />
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
