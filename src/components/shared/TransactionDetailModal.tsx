import { useEffect, useState } from 'react'
import { X, Loader2, Copy, Check } from 'lucide-react'
import { transactionService } from '@/services/transactionService'
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters'
import type { TransactionResult } from '@/types/api'
import '@/styles/AccountDetailModal.css'
import '@/styles/TransactionDetailModal.css'

interface TransactionDetailModalProps {
  transactionId: string
  onClose: () => void
}

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED': return '#22c55e'
    case 'PENDING': return '#eab308'
    case 'FAILED': return '#ef4444'
    default: return '#6b7280'
  }
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    TRANSFER_IN: 'Transfer Received',
    TRANSFER_OUT: 'Transfer Sent',
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    FEE: 'Fee',
    DEBIT: 'Debit',
    CREDIT: 'Credit',
  }
  return labels[type] ?? type
}

const TransactionDetailModal = ({ transactionId, onClose }: TransactionDetailModalProps) => {
  const [transaction, setTransaction] = useState<TransactionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    setLoading(true)
    setError(null)
    transactionService.getTransactionById(transactionId)
      .then(setTransaction)
      .catch(() => setError('Failed to load transaction details.'))
      .finally(() => setLoading(false))
  }, [transactionId])

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const isNegative = transaction
    ? ['TRANSFER_OUT', 'WITHDRAWAL', 'FEE', 'DEBIT'].includes(transaction.transactionType)
    : false

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-header-left">
            <h2>Transaction Details</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="txd-loading">
              <Loader2 size={24} className="spinner" />
              <span>Loading transaction...</span>
            </div>
          ) : error ? (
            <div className="txd-error">{error}</div>
          ) : transaction ? (
            <>
              {/* Amount hero */}
              <div className="txd-amount-hero">
                <span className={`txd-amount ${isNegative ? 'negative' : 'positive'}`}>
                  {isNegative ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
                </span>
                <span className="txd-type-badge" style={{ background: `${getStatusColor(transaction.status)}20`, color: getStatusColor(transaction.status) }}>
                  {transaction.status}
                </span>
              </div>

              {/* Info grid */}
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="modal-info-label">Type</span>
                  <span className="modal-info-value">{getTypeLabel(transaction.transactionType)}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Date</span>
                  <span className="modal-info-value">{formatDate(transaction.executedAt)}, {formatTime(transaction.executedAt)}</span>
                </div>
                <div className="modal-info-item full-width">
                  <span className="modal-info-label">Description</span>
                  <span className="modal-info-value">{transaction.description}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Reference</span>
                  <div className="modal-info-copyable">
                    <span className="modal-info-value">{transaction.referenceNumber}</span>
                    <button
                      className="modal-copy-btn"
                      onClick={() => handleCopy(transaction.referenceNumber, 'ref')}
                      aria-label="Copy reference"
                    >
                      {copiedField === 'ref' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Balance After</span>
                  <span className="modal-info-value">{formatCurrency(transaction.balanceAfter, transaction.currency)}</span>
                </div>
                {transaction.amountFee > 0 && (
                  <div className="modal-info-item">
                    <span className="modal-info-label">Fee</span>
                    <span className="modal-info-value txd-fee">{formatCurrency(transaction.amountFee, transaction.currency)}</span>
                  </div>
                )}
              </div>

            </>
          ) : null}
        </div>

        <div className="modal-footer">
          <button className="modal-footer-btn secondary" onClick={onClose} style={{ flex: 'unset', width: '100%' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetailModal
