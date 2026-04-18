import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ Name: '', Contact: '', Email: '' })

  const fetchCustomers = () => {
    fetch('/api/customers').then(r => r.json()).then(data => {
      setCustomers(data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchCustomers() }, [])

  const filtered = customers.filter(c =>
    c.Name.toLowerCase().includes(search.toLowerCase()) ||
    c.Contact.includes(search)
  )

  const openAdd = () => {
    setEditing(null)
    setForm({ Name: '', Contact: '', Email: '' })
    setShowModal(true)
  }

  const openEdit = (customer) => {
    setEditing(customer)
    setForm({ Name: customer.Name, Contact: customer.Contact, Email: customer.Email || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.Name || !form.Contact) return toast.error('Name and Contact are required')

    const url = editing ? `/api/customers/${editing.CustomerID}` : '/api/customers'
    const method = editing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      toast.success(editing ? 'Customer updated!' : 'Customer added!')
      setShowModal(false)
      fetchCustomers()
    } else {
      const err = await res.json()
      toast.error(err.error)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete customer "${name}"? This will also delete their orders.`)) return
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Customer deleted')
      fetchCustomers()
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Customers</h2>
            <p>Manage your canteen customers and their information.</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus /> Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-box mb-4">
        <Search />
        <input
          className="form-input"
          placeholder="Search customers by name or contact..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No customers found</h3>
            <p>Add your first customer to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th className="text-right">Total Spent</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.CustomerID}>
                    <td className="text-muted">#{c.CustomerID}</td>
                    <td className="font-bold">{c.Name}</td>
                    <td>
                      <span className="flex items-center gap-2">
                        <Phone style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                        {c.Contact}
                      </span>
                    </td>
                    <td>
                      {c.Email ? (
                        <span className="flex items-center gap-2">
                          <Mail style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                          {c.Email}
                        </span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className="badge preparing">{c.TotalOrders}</span>
                    </td>
                    <td className="text-right text-accent font-bold">
                      Rs. {Number(c.TotalSpent).toLocaleString()}
                    </td>
                    <td className="text-right">
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => openEdit(c)} title="Edit">
                          <Edit2 style={{ width: 16, height: 16 }} />
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(c.CustomerID, c.Name)} title="Delete">
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input"
                    placeholder="Enter customer name"
                    value={form.Name}
                    onChange={e => setForm({ ...form, Name: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Number *</label>
                    <input
                      className="form-input"
                      placeholder="0300-1234567"
                      value={form.Contact}
                      onChange={e => setForm({ ...form, Contact: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      placeholder="email@example.com"
                      value={form.Email}
                      onChange={e => setForm({ ...form, Email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
