import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, User, Settings, Shield, LogOut } from 'lucide-react'
import './Header.css'

interface HeaderProps {
  userName?: string
}

const Header = ({ userName = 'Alex' }: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMenuClick = (path: string) => {
    setIsDropdownOpen(false)
    navigate(path)
  }

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
          
          <div className="user-menu" ref={dropdownRef}>
            <button 
              className="user-avatar-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
                alt="User avatar" 
              />
            </button>

            {isDropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
                    alt="User avatar" 
                  />
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">{userName}</span>
                    <span className="dropdown-user-email">alex@corebank.com</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => handleMenuClick('/profile')}>
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuClick('/profile/settings')}>
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuClick('/profile/security')}>
                  <Shield size={16} />
                  <span>Security</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={() => handleMenuClick('/login')}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
