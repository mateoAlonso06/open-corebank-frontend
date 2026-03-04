import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronRight, Loader2, X, AlertTriangle } from 'lucide-react'
import { changePassword, get2FAStatus, toggle2FA, deactivateAccount } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import ProfileSidebar from '@/components/shared/ProfileSidebar'
import '../styles/ProfilePage.css'
import '../styles/SecurityPage.css'

const SecurityPage = () => {
  const { logout } = useAuth()
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

  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [deactivatePassword, setDeactivatePassword] = useState('')
  const [deactivateLoading, setDeactivateLoading] = useState(false)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)

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

  const handleDeactivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deactivatePassword) {
      setDeactivateError('Please enter your password.')
      return
    }
    setDeactivateLoading(true)
    setDeactivateError(null)
    try {
      await deactivateAccount(deactivatePassword)
      logout()
    } catch (err) {
      const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined
      setDeactivateError(backendMessage ?? 'Failed to deactivate account. Please try again.')
      setDeactivateLoading(false)
    }
  }

  const handleCloseDeactivateModal = () => {
    setShowDeactivateModal(false)
    setDeactivatePassword('')
    setDeactivateError(null)
  }

  return (
    <>
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
              onClick={() => setShowDeactivateModal(true)}
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>

    {showDeactivateModal && (

      <div
        className="deactivate-modal-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) handleCloseDeactivateModal() }}
        role="dialog"
        aria-modal="true"
      >
        <div className="deactivate-modal-card">
          <div className="deactivate-modal-header">
            <div className="deactivate-modal-title">
              <AlertTriangle size={20} className="deactivate-modal-icon" />
              <h2>Deactivate Account</h2>
            </div>
            <button className="deactivate-modal-close" onClick={handleCloseDeactivateModal} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="deactivate-modal-body">
            <p className="deactivate-modal-warning">
              This will permanently deactivate your account and all associated bank accounts.
              You will no longer be able to log in. This action cannot be undone.
            </p>
            <p className="deactivate-modal-note">
              Note: deactivation will be rejected if any of your bank accounts have a positive balance.
            </p>

            <form onSubmit={handleDeactivateSubmit}>
              <div className="deactivate-form-group">
                <label htmlFor="deactivatePassword">Confirm your password</label>
                <input
                  id="deactivatePassword"
                  type="password"
                  placeholder="••••••••"
                  value={deactivatePassword}
                  onChange={(e) => { setDeactivatePassword(e.target.value); setDeactivateError(null) }}
                  autoFocus
                />
              </div>

              {deactivateError && (
                <p className="deactivate-error">{deactivateError}</p>
              )}

              <div className="deactivate-modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseDeactivateModal} disabled={deactivateLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-deactivate-confirm" disabled={deactivateLoading}>
                  {deactivateLoading ? <><Loader2 size={16} className="spinner" /> Deactivating...</> : 'Deactivate Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default SecurityPage
