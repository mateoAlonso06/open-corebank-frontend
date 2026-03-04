import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { User, Shield, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

type AvatarStyle = 'male' | 'female'

function getAvatarStyle(): AvatarStyle {
  return (localStorage.getItem('avatarStyle') as AvatarStyle) || 'male'
}

function buildAvatarUrl(style: AvatarStyle): string {
  return style === 'female' ? '/avatars/female.svg' : '/avatars/male.svg'
}

const ProfileSidebar = () => {
  const { customer, user, logout } = useAuth()
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(getAvatarStyle)

  const fullName = customer
    ? `${customer.firstName} ${customer.lastName}`
    : user?.email ?? ''

  const handleStyleChange = (style: AvatarStyle) => {
    localStorage.setItem('avatarStyle', style)
    setAvatarStyle(style)
  }

  return (
    <aside className="profile-sidebar">
      <div className="profile-user-card">
        <img
          src={buildAvatarUrl(avatarStyle)}
          alt="User avatar"
          className="profile-avatar"
        />
        <div className="avatar-style-toggle">
          <button
            className={`avatar-style-btn ${avatarStyle === 'male' ? 'active' : ''}`}
            onClick={() => handleStyleChange('male')}
            title="Male avatar"
          >
            M
          </button>
          <button
            className={`avatar-style-btn ${avatarStyle === 'female' ? 'active' : ''}`}
            onClick={() => handleStyleChange('female')}
            title="Female avatar"
          >
            F
          </button>
        </div>
        <h3 className="profile-name" title={fullName}>{fullName}</h3>
        {user?.email && <span className="profile-member-type" title={user.email}>{user.email}</span>}
      </div>

      <nav className="profile-nav">
        <NavLink to="/profile" end className={({ isActive }) => `profile-nav-item ${isActive ? 'active' : ''}`}>
          <User size={18} />
          <span>Personal Info</span>
        </NavLink>
        <NavLink to="/profile/security" className={({ isActive }) => `profile-nav-item ${isActive ? 'active' : ''}`}>
          <Shield size={18} />
          <span>Security</span>
        </NavLink>
      </nav>

      <button className="profile-signout-btn" onClick={logout}>
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </aside>
  )
}

export default ProfileSidebar
