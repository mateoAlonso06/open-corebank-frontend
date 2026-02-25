import { useNavigate } from 'react-router-dom'
import { CreditCard, ArrowLeft } from 'lucide-react'
import '@/styles/PaymentsPage.css'

const PaymentsPage = () => {
  const navigate = useNavigate()

  return (
    <div className="payments-page">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">
          <CreditCard size={48} />
        </div>
        <h1>Payments Coming Soon</h1>
        <p>
          We're working hard to bring you a seamless payment experience.
          Pay bills, manage subscriptions, and more — all from one place.
        </p>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default PaymentsPage
