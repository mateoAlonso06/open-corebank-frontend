import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Wallet, PiggyBank, TrendingUp, Loader2, Copy, Check } from 'lucide-react'
import { accountService } from '@/services/accountService'
import { transactionService } from '@/services/transactionService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { AccountResult, AccountBalanceResult, TransactionResult, AccountType } from '@/types/api'
import '@/styles/AccountDetailModal.css'

const accountTypeConfig: Record<AccountType, { label: string; icon: typeof Wallet; color: string }> = {
  CHECKING: { label: 'Checking Account', icon: Wallet, color: '#2563eb' },
  SAVINGS: { label: 'Savings Account', icon: PiggyBank, color: '#22c55e' },
  INVESTMENT: { label: 'Investment Account', icon: TrendingUp, color: '#8b5cf6' },
}

interface AccountDetailModalProps {
  account: AccountResult
  onClose: () => void
}

const AccountDetailModal = ({ account, onClose }: AccountDetailModalProps) => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<AccountBalanceResult | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [transactions, setTransactions] = useState<TransactionResult[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const config = accountTypeConfig[account.accountType]
  const Icon = config.icon

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    accountService.getAccountBalance(account.id)
      .then(setBalance)
      .catch(() => setBalance(null))
      .finally(() => setBalanceLoading(false))

    transactionService.getAccountTransactions(account.id, 0, 5)
      .then((res) => setTransactions(res.items))
      .catch(() => setTransactions([]))
      .finally(() => setTxLoading(false))
  }, [account.id])

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-account-icon" style={{ background: `${config.color}20` }}>
              <Icon size={20} style={{ color: config.color }} />
            </div>
            <h2>{config.label}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Account Info */}
          <div className="modal-info-grid">
            <div className="modal-info-item full-width">
              <span className="modal-info-label">Account Number (CBU)</span>
              <div className="modal-info-copyable">
                <span className="modal-info-value">{account.accountNumber}</span>
                <button
                  className="modal-copy-btn"
                  onClick={() => handleCopy(account.accountNumber, 'cbu')}
                  aria-label="Copy account number"
                >
                  {copiedField === 'cbu' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <div className="modal-info-item">
              <span className="modal-info-label">Alias</span>
              <div className="modal-info-copyable">
                <span className="modal-info-value">{account.alias}</span>
                <button
                  className="modal-copy-btn"
                  onClick={() => handleCopy(account.alias, 'alias')}
                  aria-label="Copy alias"
                >
                  {copiedField === 'alias' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <div className="modal-info-item">
              <span className="modal-info-label">Currency</span>
              <span className="modal-info-value">{account.currency}</span>
            </div>
          </div>

          {/* Balance */}
          <div className="modal-balance-section">
            {balanceLoading ? (
              <div className="modal-balance-loading">
                <Loader2 size={16} className="spinner" />
                <span>Loading balance...</span>
              </div>
            ) : (
              <>
                <div className="modal-balance-row">
                  <span className="modal-balance-label">Balance</span>
                  <span className="modal-balance-value">
                    {formatCurrency(balance?.balance ?? account.balance, account.currency)}
                  </span>
                </div>
                <div className="modal-balance-row">
                  <span className="modal-balance-label">Available</span>
                  <span className="modal-balance-value available">
                    {formatCurrency(balance?.availableBalance ?? account.availableBalance, account.currency)}
                  </span>
                </div>
                {balance?.lastUpdated && (
                  <span className="modal-balance-updated">
                    Updated {formatDate(balance.lastUpdated)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="modal-transactions-section">
            <h3>Recent Transactions</h3>
            {txLoading ? (
              <div className="modal-tx-loading">
                <Loader2 size={16} className="spinner" />
                <span>Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <p className="modal-tx-empty">No transactions yet for this account.</p>
            ) : (
              <div className="modal-tx-list">
                {transactions.map((tx) => {
                  const isNegative = ['TRANSFER_OUT', 'WITHDRAWAL', 'FEE', 'DEBIT'].includes(tx.transactionType)
                  const sign = isNegative ? '-' : '+'
                  return (
                    <div key={tx.id} className="modal-tx-item">
                      <div className="modal-tx-left">
                        <span className="modal-tx-description">{tx.description}</span>
                        <span className="modal-tx-date">{formatDate(tx.executedAt)}</span>
                      </div>
                      <span className={`modal-tx-amount ${isNegative ? 'negative' : 'positive'}`}>
                        {sign}{formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="modal-footer-btn primary"
            onClick={() => { onClose(); navigate('/accounts'); }}
          >
            View in Accounts
          </button>
          <button className="modal-footer-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountDetailModal
