import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  User, 
  Shield, 
  Bell, 
  Link2, 
  LogOut,
  ChevronRight
} from 'lucide-react'
import '../styles/ProfilePage.css'
import '../styles/SecurityPage.css'

const SecurityPage = () => {
  const navigate = useNavigate()
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Updating password:', passwords)
  }

  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      console.log('Account deactivation requested')
    }
  }

  return (
    <div className="profile-page">
      {/* Profile Sidebar */}
      <aside className="profile-sidebar">
        <div className="profile-user-card">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" 
            alt="User avatar"
            className="profile-avatar"
          />
          <h3 className="profile-name">John Doe</h3>
          <span className="profile-member-type">Premium Member</span>
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
          <NavLink to="/profile/notifications" className={({ isActive }) => `profile-nav-item ${isActive ? 'active' : ''}`}>
            <Bell size={18} />
            <span>Notifications</span>
          </NavLink>
          <NavLink to="/profile/linked-accounts" className={({ isActive }) => `profile-nav-item ${isActive ? 'active' : ''}`}>
            <Link2 size={18} />
            <span>Linked Accounts</span>
          </NavLink>
        </nav>

        <button className="profile-signout-btn" onClick={() => navigate('/login')}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Breadcrumb */}
        <div className="profile-breadcrumb">
          <span>Settings</span>
          <ChevronRight size={16} />
          <span className="current">Security</span>
        </div>

        {/* Change Password Section */}
        <div className="profile-form-section">
          <div className="section-header">
            <h1>Security Settings</h1>
            <p>Manage your account security and authentication preferences.</p>
          </div>

          <div className="security-subsection">
            <h3>Change Password</h3>
            <p className="subsection-description">
              Ensure your account is using a long, random password to stay secure.
            </p>

            <form onSubmit={handleUpdatePassword} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="btn-save" style={{ alignSelf: 'flex-start' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="profile-form-section">
          <div className="two-factor-row">
            <div className="two-factor-info">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="profile-form-section danger-zone">
          <div className="section-header">
            <h2 className="danger-title">Danger Zone</h2>
            <p>Irreversible actions related to your account security.</p>
          </div>

          <div className="deactivate-account">
            <div className="deactivate-info">
              <h3>Deactivate Account</h3>
              <p>
                Once you deactivate your account, all your data will be permanently 
                removed. This action cannot be undone.
              </p>
            </div>
            <button 
              className="btn-deactivate"
              onClick={handleDeactivateAccount}
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityPage
