import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { CheckCircle, Lock, Shield, ArrowRight, Landmark, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as authService from '@/services/authService'
import { AxiosError } from 'axios'
import '../styles/VerificationPage.css'

interface VerificationPageProps {
  type?: 'two-factor' | 'account-confirmation'
}

interface TwoFactorState {
  sessionToken: string
  maskedEmail: string
  expirySeconds: number
}

const VerificationPage = ({ type = 'two-factor' }: VerificationPageProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const auth = useAuth()

  // 2FA state
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)

  // Email verification state
  const [emailVerifyStatus, setEmailVerifyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Extract state/params based on mode
  const twoFactorState = location.state as TwoFactorState | null
  const emailToken = searchParams.get('token')
  const emailFromState = (location.state as { email?: string } | null)?.email

  // 2FA: validate state and init countdown
  useEffect(() => {
    if (type === 'two-factor') {
      if (!twoFactorState?.sessionToken) {
        navigate('/login', { replace: true })
        return
      }
      setTimeLeft(twoFactorState.expirySeconds)
      inputRefs.current[0]?.focus()
    }
  }, [type, twoFactorState, navigate])

  // 2FA countdown timer
  useEffect(() => {
    if (type !== 'two-factor' || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [type, timeLeft])

  // Email verification: auto-verify if token in URL
  const verifyEmailToken = useCallback(async (token: string) => {
    setEmailVerifyStatus('loading')
    setError('')
    try {
      await authService.verifyEmail({ token })
      setEmailVerifyStatus('success')
    } catch (err) {
      setEmailVerifyStatus('error')
      if (err instanceof AxiosError) {
        const status = err.response?.status
        if (status === 400 || status === 404) {
          setError('This verification link is invalid or has expired.')
        } else {
          setError('An error occurred while verifying your email. Please try again.')
        }
      } else {
        setError('An error occurred while verifying your email. Please try again.')
      }
    }
  }, [])

  useEffect(() => {
    if (type === 'account-confirmation' && emailToken) {
      verifyEmailToken(emailToken)
    }
  }, [type, emailToken, verifyEmailToken])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newCode = [...code]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newCode[index] = char
    })
    setCode(newCode)

    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!twoFactorState) return

    const verificationCode = code.join('')
    setLoading(true)
    setError('')

    try {
      const result = await authService.verify2FA({
        sessionToken: twoFactorState.sessionToken,
        code: verificationCode,
      })
      auth.verify2FA(result)
      navigate('/loading')
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status
        if (status === 401 || status === 400) {
          setError('Invalid verification code. Please try again.')
        } else if (status === 410) {
          setError('This code has expired. Please go back and log in again.')
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!emailFromState || resendLoading) return
    setResendLoading(true)
    setError('')
    setResendSuccess(false)

    try {
      await authService.resendVerification({ email: emailFromState })
      setResendSuccess(true)
    } catch {
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const isCodeComplete = code.every(digit => digit !== '')

  // ─── Account Confirmation: token in URL → auto verify ───
  if (type === 'account-confirmation' && emailToken) {
    return (
      <div className="verification-page">
        <header className="verification-header">
          <div className="header-logo">
            <Landmark size={24} />
            <span>CoreBank</span>
          </div>
          <div className="header-secure">
            <Shield size={16} />
            <span>Secure Session</span>
          </div>
        </header>

        <main className="verification-main">
          <div className="verification-card">
            <div className="verification-icon">
              {emailVerifyStatus === 'loading' && <Loader2 size={32} className="spinning" />}
              {emailVerifyStatus === 'success' && <CheckCircle2 size={32} />}
              {emailVerifyStatus === 'error' && <AlertCircle size={32} />}
              {emailVerifyStatus === 'idle' && <Mail size={32} />}
            </div>

            {emailVerifyStatus === 'loading' && (
              <>
                <h1>Verifying Your Email</h1>
                <p className="verification-subtitle">Please wait while we verify your email address...</p>
              </>
            )}

            {emailVerifyStatus === 'success' && (
              <>
                <h1>Email Verified!</h1>
                <p className="verification-subtitle">Your email has been successfully verified. You can now log in.</p>
                <button className="verify-button" onClick={() => navigate('/login')}>
                  Go to Login
                  <ArrowRight size={18} />
                </button>
              </>
            )}

            {emailVerifyStatus === 'error' && (
              <>
                <h1>Verification Failed</h1>
                <p className="verification-subtitle verification-error-text">{error}</p>
                <button className="verify-button" onClick={() => navigate('/login')}>
                  Back to Login
                  <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </main>

        <footer className="verification-footer">
          <div className="footer-badges">
            <span><Lock size={14} />256-BIT ENCRYPTION</span>
            <span className="separator">&bull;</span>
            <span><Shield size={14} />PCI DSS COMPLIANT</span>
          </div>
          <p>&copy; 2024 CoreBank Financial Services. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  // ─── Account Confirmation: no token → "check your email" ───
  if (type === 'account-confirmation') {
    return (
      <div className="verification-page">
        <header className="verification-header">
          <div className="header-logo">
            <Landmark size={24} />
            <span>CoreBank</span>
          </div>
          <div className="header-secure">
            <Shield size={16} />
            <span>Secure Session</span>
          </div>
        </header>

        <main className="verification-main">
          <div className="verification-card">
            <div className="verification-icon">
              <Mail size={32} />
            </div>

            <h1>Check Your Email</h1>
            <p className="verification-subtitle">We've sent a verification link to your email address.</p>

            <div className="verification-message">
              <div className="message-icon">
                <Mail size={18} />
              </div>
              <p>
                {emailFromState
                  ? <>Please check <strong>{emailFromState}</strong> and click the verification link to activate your account.</>
                  : 'Please check your inbox and click the verification link to activate your account.'
                }
              </p>
            </div>

            {error && (
              <div className="verification-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {resendSuccess && (
              <div className="verification-success">
                <CheckCircle2 size={16} />
                <span>Verification email resent successfully!</span>
              </div>
            )}

            {emailFromState && (
              <p className="resend-text">
                Didn't receive the email?{' '}
                <button
                  type="button"
                  className="resend-link"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending...' : 'Resend Email'}
                </button>
              </p>
            )}

            <button className="back-link" onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </div>
        </main>

        <footer className="verification-footer">
          <div className="footer-badges">
            <span><Lock size={14} />256-BIT ENCRYPTION</span>
            <span className="separator">&bull;</span>
            <span><Shield size={14} />PCI DSS COMPLIANT</span>
          </div>
          <p>&copy; 2024 CoreBank Financial Services. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  // ─── Two-Factor Authentication ───
  return (
    <div className="verification-page">
      <header className="verification-header">
        <div className="header-logo">
          <Landmark size={24} />
          <span>CoreBank</span>
        </div>
        <div className="header-secure">
          <Shield size={16} />
          <span>Secure Session</span>
        </div>
      </header>

      <main className="verification-main">
        <div className="verification-card">
          <div className="verification-icon">
            <CheckCircle size={32} />
          </div>

          <h1>Security Check</h1>
          <p className="verification-subtitle">Two-Factor Authentication Required</p>

          <div className="verification-message">
            <div className="message-icon">
              <Lock size={18} />
            </div>
            <p>
              We've sent a 6-digit verification code to your registered email address{' '}
              <strong>{twoFactorState?.maskedEmail}</strong>.
            </p>
          </div>

          {timeLeft > 0 && (
            <div className="countdown-timer">
              Code expires in <strong>{formatTime(timeLeft)}</strong>
            </div>
          )}

          {timeLeft === 0 && twoFactorState && (
            <div className="countdown-expired">
              Code has expired. Please go back and log in again.
            </div>
          )}

          {error && (
            <div className="verification-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="code-input"
                  disabled={loading || timeLeft === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              className="verify-button"
              disabled={!isCodeComplete || loading || timeLeft === 0}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify and Continue
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <button className="back-link" onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      </main>

      <footer className="verification-footer">
        <div className="footer-badges">
          <span><Lock size={14} />256-BIT ENCRYPTION</span>
          <span className="separator">&bull;</span>
          <span><Shield size={14} />PCI DSS COMPLIANT</span>
        </div>
        <p>&copy; 2024 CoreBank Financial Services. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default VerificationPage
