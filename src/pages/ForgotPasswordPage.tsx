import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Landmark, ArrowRight, ArrowLeft, Mail } from 'lucide-react'
import * as authService from '@/services/authService'
import { AxiosError } from 'axios'
import '../styles/ForgotPasswordPage.css'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword({ email })
      setSubmitted(true)
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 400) {
        setError('Please enter a valid email address.')
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
            Reset your password securely.
          </h1>

          <p className="branding-description">
            Enter your email address and we'll send you a link to reset your password. The link will expire after a short time for your security.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          <div className="form-header">
            <h2>Forgot Password</h2>
            <p>Enter your email and we'll send you a reset link.</p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="forgot-success">
              <div className="forgot-success-icon">
                <Mail size={32} />
              </div>
              <h3>Check your inbox</h3>
              <p>
                If an account with <strong>{email}</strong> exists, we've sent a password reset link. Check your spam folder if you don't see it.
              </p>
              <Link to="/login" className="submit-button forgot-back-btn">
                <ArrowLeft size={18} />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage
