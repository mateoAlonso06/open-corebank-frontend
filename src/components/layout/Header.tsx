import { Search, Bell, Settings } from 'lucide-react'
import './Header.css'

interface HeaderProps {
  userName?: string
}

const Header = ({ userName = 'Alex' }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header-left">
        <h2 className="welcome-text">Welcome back, {userName}</h2>
      </div>

      <div className="header-right">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search transactions..." />
        </div>

        <div className="header-actions">
          <button className="header-action-btn notification-btn">
            <Bell size={20} />
            <span className="notification-badge"></span>
          </button>
          <button className="header-action-btn">
            <Settings size={20} />
          </button>
          <div className="user-avatar">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
              alt="User avatar" 
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
