import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronRight, Loader2 } from 'lucide-react'
import { changePassword, get2FAStatus, toggle2FA } from '@/services/authService'
import ProfileSidebar from '@/components/shared/ProfileSidebar'
import '../styles/ProfilePage.css'
import '../styles/SecurityPage.css'

const SecurityPage = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(true)
  const [twoFactorToggling, setTwoFactorToggling] = useState(false)

  useEffect(() => {
    get2FAStatus()
      .then(res => setTwoFactorEnabled(res.enabled))
      .catch(() => {})
      .finally(() => setTwoFactorLoading(false))
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
    setPasswordFeedback(null)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New passwords do not match.' })
      return
    }
    if (!passwords.currentPassword || !passwords.newPassword) {
      setPasswordFeedback({ type: 'error', message: 'Please fill in all password fields.' })
      return
    }
    setPasswordSaving(true)
    setPasswordFeedback(null)
    try {
      await changePassword({ oldPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      setPasswordFeedback({ type: 'success', message: 'Password updated successfully.' })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined
      setPasswordFeedback({ type: 'error', message: backendMessage ?? 'Failed to change password. Please check your current password and try again.' })
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleToggle2FA = async (checked: boolean) => {
    setTwoFactorToggling(true)
    try {
      await toggle2FA({ enable: checked })
      setTwoFactorEnabled(checked)
    } catch {
      // revert on failure
    } finally {
      setTwoFactorToggling(false)
    }
  }

  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      console.log('Account deactivation requested')
    }
  }

  return (
    <div className="profile-page">
      <ProfileSidebar />

      <div className="profile-content">
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

            {passwordFeedback && (
              <div className={`feedback-message feedback-${passwordFeedback.type}`}>
                {passwordFeedback.message}
              </div>
            )}

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

              <button type="submit" className="btn-save" style={{ alignSelf: 'flex-start' }} disabled={passwordSaving}>
                {passwordSaving && <Loader2 size={16} className="spinner" />}
                {passwordSaving ? 'Updating...' : 'Update Password'}
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
            {twoFactorLoading ? (
              <Loader2 size={20} className="spinner" />
            ) : (
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  disabled={twoFactorToggling}
                  onChange={(e) => handleToggle2FA(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            )}
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
