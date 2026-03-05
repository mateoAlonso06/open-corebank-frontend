import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Landmark, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react'
import * as authService from '@/services/authService'
import { AxiosError } from 'axios'
import '../styles/ResetPasswordPage.css'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo">
              <div className="logo-icon">
                <Landmark size={24} />
              </div>
              <span className="logo-text">Open CoreBank</span>
            </div>
          </div>
        </div>
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="form-error">
              This reset link is invalid. Please request a new one.
            </div>
            <Link to="/forgot-password" className="submit-button reset-back-btn">
              Request new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword({ token, newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status
        if (status === 422) {
          setError('This reset link is invalid, expired, or has already been used. Please request a new one.')
        } else if (status === 400) {
          setError('Please check your input and try again.')
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="logo">
            <div className="logo-icon">
              <Landmark size={24} />
            </div>
            <span className="logo-text">Open CoreBank</span>
          </div>

          <h1 className="branding-title">
            Create a new password.
          </h1>

          <p className="branding-description">
            Choose a strong password that you haven't used before. Your new password must be at least 8 characters long.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          <div className="form-header">
            <h2>Reset Password</h2>
            <p>Enter and confirm your new password below.</p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {success ? (
            <div className="reset-success">
              <div className="reset-success-icon">
                <CheckCircle size={32} />
              </div>
              <h3>Password updated</h3>
              <p>Your password has been reset successfully. Redirecting you to login...</p>
              <Link to="/login" className="submit-button reset-back-btn">
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Updating...' : 'Reset Password'}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div className="forgot-back-link">
                <Link to="/login" className="back-to-login">
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
