import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Lock, Shield, ArrowRight, Landmark } from 'lucide-react'
import '../styles/VerificationPage.css'

interface VerificationPageProps {
  type?: 'two-factor' | 'account-confirmation'
}

const VerificationPage = ({ type = 'two-factor' }: VerificationPageProps) => {
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const maskedEmail = 'j***@example.com'

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const verificationCode = code.join('')
    console.log('Verification code:', verificationCode)
    
    if (type === 'two-factor') {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleResendCode = () => {
    console.log('Resending code...')
    setCode(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  const isCodeComplete = code.every(digit => digit !== '')

  const pageConfig = {
    'two-factor': {
      title: 'Security Check',
      subtitle: 'Two-Factor Authentication Required',
      message: `We've sent a 6-digit verification code to your registered email address ${maskedEmail}.`,
      buttonText: 'Verify and Continue',
      backText: 'Back to Login',
      backPath: '/login'
    },
    'account-confirmation': {
      title: 'Confirm Your Account',
      subtitle: 'Email Verification Required',
      message: `We've sent a 6-digit verification code to your email address ${maskedEmail}.`,
      buttonText: 'Verify Account',
      backText: 'Back to Login',
      backPath: '/login'
    }
  }

  const config = pageConfig[type]

  return (
    <div className="verification-page">
      {/* Header */}
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

      {/* Main Content */}
      <main className="verification-main">
        <div className="verification-card">
          {/* Icon */}
          <div className="verification-icon">
            <CheckCircle size={32} />
          </div>

          {/* Title */}
          <h1>{config.title}</h1>
          <p className="verification-subtitle">{config.subtitle}</p>

          {/* Message Box */}
          <div className="verification-message">
            <div className="message-icon">
              <Lock size={18} />
            </div>
            <p>{config.message}</p>
          </div>

          {/* Code Input */}
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
                />
              ))}
            </div>

            {/* Resend Link */}
            <p className="resend-text">
              Didn't receive a code?{' '}
              <button type="button" className="resend-link" onClick={handleResendCode}>
                Resend Code
              </button>
            </p>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="verify-button"
              disabled={!isCodeComplete}
            >
              {config.buttonText}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Back Link */}
          <button 
            className="back-link"
            onClick={() => navigate(config.backPath)}
          >
            {config.backText}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="verification-footer">
        <div className="footer-badges">
          <span>
            <Lock size={14} />
            256-BIT ENCRYPTION
          </span>
          <span className="separator">•</span>
          <span>
            <Shield size={14} />
            PCI DSS COMPLIANT
          </span>
        </div>
        <p>&copy; 2024 CoreBank Financial Services. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default VerificationPage
