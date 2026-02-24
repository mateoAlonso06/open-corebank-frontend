import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, RefreshCw, ShieldCheck } from 'lucide-react'
import '../styles/LoadingPage.css'

interface LoadingPageProps {
  userName?: string
}

const LoadingPage = ({ userName = 'Alexander' }: LoadingPageProps) => {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Incremento variable para hacer más realista
        const increment = Math.random() * 15 + 5
        return Math.min(prev + increment, 100)
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        navigate('/dashboard')
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [progress, navigate])

  return (
    <div className="loading-page">
      {/* Decorative Background Elements */}
      <div className="loading-bg-decoration">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
        <div className="bg-shape bg-shape-4"></div>
      </div>

      {/* Main Content */}
      <div className="loading-content">
        {/* Logo */}
        <div className="loading-logo">
          <div className="logo-circle">
            <Landmark size={40} />
          </div>
        </div>

        {/* Welcome Message */}
        <h1 className="loading-title">Welcome back, {userName}</h1>

        {/* Status Message */}
        <div className="loading-status">
          <RefreshCw size={16} className="status-icon spinning" />
          <span>Securing your connection...</span>
        </div>

        {/* Progress Bar */}
        <div className="loading-progress">
          <div className="progress-header">
            <span className="progress-label">ESTABLISHING SESSION</span>
            <span className="progress-percent">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="loading-security">
          <div className="security-badge">
            <ShieldCheck size={16} />
            <span>Verified by CoreBank Security</span>
          </div>
          <p className="security-text">
            Your data is protected by industry-standard AES-256 encryption.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage
