import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, HelpCircle } from 'lucide-react'
import '../styles/LoginPage.css'

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password, rememberMe })
  }

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="logo">
            <div className="logo-icon">
              <Shield size={24} />
            </div>
            <span className="logo-text">CoreBank</span>
          </div>

          <h1 className="branding-title">
            Managing your wealth with precision and care.
          </h1>

          <p className="branding-description">
            Join over 2 million customers worldwide who trust CoreBank for their personal and business financial growth. Secure, fast, and transparent.
          </p>

          <div className="trust-badges">
            <div className="badge">
              <div className="badge-icon">
                <Shield size={18} />
              </div>
              <div className="badge-content">
                <span className="badge-title">FDIC Insured</span>
                <span className="badge-subtitle">Up to $250,000</span>
              </div>
            </div>

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

      {/* Right Side - Login Form */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Log In
            </button>
            <button
              className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* Form Header */}
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Please enter your details to access your account.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Username or Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button type="submit" className="submit-button">
              Sign In to CoreBank
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <button className="social-button">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="social-button">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Footer */}
          <div className="form-footer">
            <div className="compliance-badge">
              <Shield size={14} />
              <span>PCI DSS COMPLIANT</span>
            </div>
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
