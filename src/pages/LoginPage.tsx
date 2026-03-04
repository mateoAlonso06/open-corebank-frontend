import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Landmark, ArrowRight, HelpCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as authService from '@/services/authService'
import type { RegisterUserRequest } from '@/types/api'
import { AxiosError } from 'axios'
import '../styles/LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const auth = useAuth()

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // TODO: enable when refresh tokens are implemented
  // const [rememberMe, setRememberMe] = useState(false)

  // Signup state
  const [signupData, setSignupData] = useState<RegisterUserRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    documentType: 'DNI',
    documentNumber: '',
    birthDate: '',
    phone: '',
    address: '',
    city: '',
    country: 'AR',
  })

  const updateSignup = (field: keyof RegisterUserRequest, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await authService.login({ email, password })
      if (result.requiresTwoFactor && result.twoFactorData) {
        navigate('/verify-2fa', {
          state: {
            sessionToken: result.twoFactorData.sessionToken,
            maskedEmail: result.twoFactorData.maskedEmail,
            expirySeconds: result.twoFactorData.expirySeconds,
          },
        })
      } else {
        auth.login(result)
        navigate('/loading')
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status
        if (status === 401) {
          setError('Invalid email or password. Please try again.')
        } else if (status === 403) {
          setError(err.response?.data?.message ?? 'Your account has been deactivated. Please contact support.')
        } else if (status === 423) {
          setError('Your account has been locked. Please contact support.')
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await authService.register(signupData)
      navigate('/confirm-account', { state: { email: signupData.email } })
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status
        if (status === 409) {
          setError('An account with this email already exists.')
        } else if (status === 422) {
          setError('Please check your information and try again.')
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

  const switchTab = (tab: 'login' | 'signup') => {
    setActiveTab(tab)
    setError('')
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
            Managing your wealth with precision and care.
          </h1>

          <p className="branding-description">
            Join over 2 million customers worldwide who trust Open CoreBank for their personal and business financial growth. Secure, fast, and transparent.
          </p>

          <div className="trust-badges">
            <div className="badge">
              <div className="badge-icon">
                <Lock size={18} />
              </div>
              <div className="badge-content">
                <span className="badge-title">256-bit Encryption</span>
                <span className="badge-subtitle">Bank-grade security</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Log In
            </button>
            <button
              className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => switchTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <>
              {/* Form Header */}
              <div className="form-header">
                <h2>Welcome Back</h2>
                <p>Please enter your details to access your account.</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="login-form">
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

                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="password">Password</label>
                    <a href="#" className="forgot-password">Forgot password?</a>
                  </div>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* TODO: enable when refresh tokens are implemented
                <div className="remember-me">
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <span>Remember me for 30 days</span>
                  </label>
                </div>
                */}

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In to Open CoreBank'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

            </>
          ) : (
            <>
              {/* Signup Header */}
              <div className="form-header">
                <h2>Create Account</h2>
                <p>Fill in your details to open a new Open CoreBank account.</p>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSignup} className="login-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="firstName"
                        placeholder="John"
                        value={signupData.firstName}
                        onChange={(e) => updateSignup('firstName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="lastName"
                        placeholder="Doe"
                        value={signupData.lastName}
                        onChange={(e) => updateSignup('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signupEmail">Email</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="signupEmail"
                      placeholder="john@example.com"
                      value={signupData.email}
                      onChange={(e) => updateSignup('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signupPassword">Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      id="signupPassword"
                      placeholder="Min. 8 characters"
                      value={signupData.password}
                      onChange={(e) => updateSignup('password', e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="documentType">Document Type</label>
                    <div className="input-wrapper">
                      <select
                        id="documentType"
                        className="form-select"
                        value={signupData.documentType}
                        onChange={(e) => updateSignup('documentType', e.target.value)}
                        required
                      >
                        <option value="DNI">DNI</option>
                        <option value="PASSPORT">Passport</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="documentNumber">Document Number</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="documentNumber"
                        placeholder="12345678"
                        value={signupData.documentNumber}
                        onChange={(e) => updateSignup('documentNumber', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="birthDate">Birth Date</label>
                    <div className="input-wrapper">
                      <input
                        type="date"
                        id="birthDate"
                        value={signupData.birthDate}
                        onChange={(e) => updateSignup('birthDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <div className="input-wrapper">
                      <input
                        type="tel"
                        id="phone"
                        placeholder="+54 11 1234-5678"
                        value={signupData.phone}
                        onChange={(e) => updateSignup('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="address"
                      placeholder="Av. Corrientes 1234"
                      value={signupData.address}
                      onChange={(e) => updateSignup('address', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="city"
                        placeholder="Buenos Aires"
                        value={signupData.city}
                        onChange={(e) => updateSignup('city', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <div className="input-wrapper">
                      <select
                        id="country"
                        className="form-select"
                        value={signupData.country}
                        onChange={(e) => updateSignup('country', e.target.value)}
                        required
                      >
                        <option value="AR">Argentina</option>
                        <option value="UY">Uruguay</option>
                        <option value="CL">Chile</option>
                        <option value="BR">Brazil</option>
                        <option value="US">United States</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </>
          )}

          {/* Footer */}
          <div className="form-footer">
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Help Link */}
        <div className="help-link">
          <HelpCircle size={16} />
          <span>Need help with your account?</span>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
