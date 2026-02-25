import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, RefreshCw, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as customerService from '@/services/customerService'
import '../styles/LoadingPage.css'

const LoadingPage = () => {
  const navigate = useNavigate()
  const auth = useAuth()
  const [progress, setProgress] = useState(0)
  const [customerReady, setCustomerReady] = useState(false)
  const fetchStarted = useRef(false)

  // Fetch customer data on mount
  useEffect(() => {
    if (fetchStarted.current) return
    fetchStarted.current = true

    const fetchCustomer = async () => {
      try {
        const customer = await customerService.getMyCustomer()
        auth.setCustomer(customer)
        setCustomerReady(true)
      } catch {
        auth.logout()
      }
    }
    fetchCustomer()
  }, [auth])

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        const increment = Math.random() * 15 + 5
        return Math.min(prev + increment, 100)
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  // Navigate only when both progress is complete AND customer data is loaded
  useEffect(() => {
    if (progress >= 100 && customerReady) {
      const timeout = setTimeout(() => {
        navigate('/dashboard')
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [progress, customerReady, navigate])

  const displayName = auth.customer?.firstName ?? auth.user?.email ?? ''

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
        <h1 className="loading-title">Welcome back, {displayName}</h1>

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
            <span>Verified by Open CoreBank Security</span>
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
