import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  User, 
  Shield, 
  Bell, 
  Link2, 
  LogOut,
  ChevronRight,
  CheckCircle,
  Info
} from 'lucide-react'
import '../styles/ProfilePage.css'

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    postalCode: '62704'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Saving changes:', formData)
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

        <button className="profile-signout-btn">
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
          <span className="current">Edit Profile</span>
        </div>

        {/* Form Section */}
        <div className="profile-form-section">
          <div className="section-header">
            <h1>Personal Information</h1>
            <p>Update your personal details and how we can reach you.</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                  <span className="verified-badge">
                    <CheckCircle size={14} />
                  </span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  className="disabled"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Home Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel">Cancel</button>
              <button type="submit" className="btn-save">Save Changes</button>
            </div>
          </form>
        </div>

        {/* Identity Verification Notice */}
        <div className="verification-notice">
          <div className="notice-icon">
            <Info size={20} />
          </div>
          <div className="notice-content">
            <h4>Identity Verification</h4>
            <p>
              Some sensitive information cannot be edited here for security reasons. To change your verified email or 
              primary banking identity, please visit a local branch or contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
