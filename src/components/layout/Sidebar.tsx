import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  CreditCard, 
  TrendingUp, 
  User,
  Shield
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Wallet, label: 'Accounts', path: '/accounts' },
  { icon: ArrowLeftRight, label: 'Transfers', path: '/transfers' },
  { icon: CreditCard, label: 'Payments', path: '/payments' },
  { icon: TrendingUp, label: 'Investments', path: '/investments' },
  { icon: User, label: 'Profile', path: '/profile' },
]

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Shield size={20} />
          </div>
          <div className="logo-info">
            <span className="logo-name">CoreBank</span>
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
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="last-login">
          <span className="last-login-label">Last Login</span>
          <span className="last-login-time">Today at 09:42 AM</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
