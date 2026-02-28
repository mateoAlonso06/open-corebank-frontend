import { useState } from 'react'
import { ChevronRight, CheckCircle, Info, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { updateMyCustomer } from '@/services/customerService'
import ProfileSidebar from '@/components/shared/ProfileSidebar'
import '../styles/ProfilePage.css'

const ProfilePage = () => {
  const { customer, user, setCustomer } = useAuth()

  const [formData, setFormData] = useState({
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? '',
    city: customer?.city ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFeedback(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)
    try {
      const updated = await updateMyCustomer(formData)
      setCustomer(updated)
      setFeedback({ type: 'success', message: 'Profile updated successfully.' })
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      phone: customer?.phone ?? '',
      address: customer?.address ?? '',
      city: customer?.city ?? '',
    })
    setFeedback(null)
  }

  return (
    <div className="profile-page">
      <ProfileSidebar />

      <div className="profile-content">
        <div className="profile-breadcrumb">
          <span>Settings</span>
          <ChevronRight size={16} />
          <span className="current">Edit Profile</span>
        </div>

        <div className="profile-form-section">
          <div className="section-header">
            <h1>Personal Information</h1>
            <p>Update your personal details and how we can reach you.</p>
          </div>

          {feedback && (
            <div className={`feedback-message feedback-${feedback.type}`}>
              {feedback.message}
            </div>
          )}

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
                  value={user?.email ?? ''}
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

            <div className="form-group full-width">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving && <Loader2 size={16} className="spinner" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

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
