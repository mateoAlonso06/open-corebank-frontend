import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  ArrowLeftRight,
  CreditCard,
  User,
  Landmark
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import './Sidebar.css'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Wallet, label: 'Accounts', path: '/accounts' },
  { icon: Receipt, label: 'Transactions', path: '/transactions' },
  { icon: ArrowLeftRight, label: 'Transfers', path: '/transfers' },
  { icon: CreditCard, label: 'Payments', path: '/payments' },
  { icon: User, label: 'Profile', path: '/profile' },
]

function formatLastLogin(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '\u2014'

  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  if (isToday) return `Today at ${time}`

  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${monthDay} at ${time}`
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const { lastLoginAt } = useAuth()

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')} role="button" tabIndex={0}>
          <div className="logo-icon">
            <Landmark size={20} />
          </div>
          <div className="logo-info">
            <span className="logo-name">Open CoreBank</span>
            <span className="logo-tagline">Secure Banking</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="last-login">
          <span className="last-login-label">Last Login</span>
          <span className="last-login-time">{formatLastLogin(lastLoginAt)}</span>
        </div>
      </div>
    </aside>
    </>
  )
}

export default Sidebar
