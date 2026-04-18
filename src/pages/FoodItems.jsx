import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

const EMOJIS = ['🍽️','🍚','🍔','🌯','🥗','🍛','🍟','☕','🥤','🥪','🍝','🥩','💧','🍫','🍇','🫓','🍕','🧁','🥘','🍜']
const CATEGORIES = ['General','Rice','Fast Food','Desi','Healthy','Snacks','Beverages','Italian','Desserts','Bread']

export default function FoodItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ItemName: '', Category: 'General', Price: '', Availability: 1, ImageEmoji: '🍽️' })

  const fetchItems = () => {
    fetch('/api/food-items').then(r => r.json()).then(data => {
      setItems(data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchItems() }, [])

  const categories = ['All', ...new Set(items.map(i => i.Category))]

  const filtered = items.filter(i => {
    const matchSearch = i.ItemName.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'All' || i.Category === filterCat
    return matchSearch && matchCat
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ ItemName: '', Category: 'General', Price: '', Availability: 1, ImageEmoji: '🍽️' })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      ItemName: item.ItemName,
      Category: item.Category,
      Price: item.Price,
      Availability: item.Availability,
      ImageEmoji: item.ImageEmoji
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.ItemName || !form.Price) return toast.error('Item name and price are required')

    const url = editing ? `/api/food-items/${editing.ItemID}` : '/api/food-items'
    const method = editing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, Price: Number(form.Price) })
    })

    if (res.ok) {
      toast.success(editing ? 'Item updated!' : 'Item added!')
      setShowModal(false)
      fetchItems()
    } else {
      const err = await res.json()
      toast.error(err.error)
    }
  }

  const handleToggle = async (id) => {
    const res = await fetch(`/api/food-items/${id}/toggle`, { method: 'PATCH' })
    if (res.ok) {
      toast.success('Availability toggled')
      fetchItems()
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    const res = await fetch(`/api/food-items/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Item deleted')
      fetchItems()
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Food Items</h2>
            <p>Manage your canteen menu, pricing, and availability.</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus /> Add Item
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="search-box">
          <Search />
          <input
            className="form-input"
            placeholder="Search menu items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-pills">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${filterCat === cat ? 'active' : ''}`}
            onClick={() => setFilterCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <h3>No items found</h3>
            <p>Try a different search or add a new food item.</p>
          </div>
        </div>
      ) : (
        <div className="food-grid">
          {filtered.map(item => (
            <div key={item.ItemID} className="food-card" style={{ opacity: item.Availability ? 1 : 0.5 }}>
              <span className="food-card-emoji">{item.ImageEmoji}</span>
              <div className="food-card-name">{item.ItemName}</div>
              <div className="food-card-category">{item.Category} • Ordered {item.TotalOrdered}x</div>
              <div className="food-card-footer">
                <span className="food-card-price">Rs. {item.Price}</span>
                <div className="food-card-actions">
                  <button className="btn btn-ghost btn-icon" onClick={() => handleToggle(item.ItemID)} title="Toggle availability">
                    {item.Availability ?
                      <ToggleRight style={{ width: 20, height: 20, color: 'var(--success)' }} /> :
                      <ToggleLeft style={{ width: 20, height: 20, color: 'var(--danger)' }} />
                    }
                  </button>
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(item)} title="Edit">
                    <Edit2 style={{ width: 15, height: 15 }} />
                  </button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(item.ItemID, item.ItemName)} title="Delete">
                    <Trash2 style={{ width: 15, height: 15, color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <span className={`badge ${item.Availability ? 'available' : 'unavailable'}`}>
                  <span className="badge-dot" />
                  {item.Availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Food Item' : 'Add New Food Item'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Emoji Picker */}
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {EMOJIS.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setForm({ ...form, ImageEmoji: e })}
                        style={{
                          fontSize: '1.5rem',
                          padding: '4px 6px',
                          border: form.ImageEmoji === e ? '2px solid var(--accent)' : '2px solid transparent',
                          borderRadius: 8,
                          background: form.ImageEmoji === e ? 'var(--accent-glow)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input
                    className="form-input"
                    placeholder="Enter item name"
                    value={form.ItemName}
                    onChange={e => setForm({ ...form, ItemName: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={form.Category}
                      onChange={e => setForm({ ...form, Category: e.target.value })}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (Rs.) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      placeholder="0"
                      value={form.Price}
                      onChange={e => setForm({ ...form, Price: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
