import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UtensilsCrossed, ShoppingCart,
  ClipboardList, BarChart3
} from 'lucide-react'

const navItems = [
  { section: 'Main' },
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/new-order', label: 'New Order', icon: ShoppingCart },
  { section: 'Management' },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/food-items', label: 'Food Items', icon: UtensilsCrossed },
  { path: '/orders', label: 'Order History', icon: ClipboardList },
  { section: 'Analytics' },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🍽️</div>
          <div className="sidebar-logo-text">
            <h1>CanteenPro</h1>
            <span>Order Management</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} className="sidebar-section-title">
                {item.section}
              </div>
            )
          }

          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          DBMS Lab Project<br />
          Canteen Order Management System<br />
          © 2026
        </p>
      </div>
    </aside>
  )
}
