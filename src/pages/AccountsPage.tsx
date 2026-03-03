import { useState, useEffect } from 'react'
import {
  Plus,
  Wallet,
  PiggyBank,
  TrendingUp,
  Loader2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react'
import axios from 'axios'
import { useAccounts } from '@/hooks/useAccounts'
import { accountService } from '@/services/accountService'
import { formatCurrency } from '@/utils/formatters'
import AccountDetailModal from '@/components/shared/AccountDetailModal'
import type { AccountResult, AccountType, CreateAccountRequest, TransactionResult } from '@/types/api'
import '@/styles/AccountsPage.css'

const accountTypeConfig: Record<AccountType, { label: string; icon: typeof Wallet; color: string }> = {
  CHECKING: { label: 'Checking Account', icon: Wallet, color: '#2563eb' },
  SAVINGS: { label: 'Savings Account', icon: PiggyBank, color: '#22c55e' },
  INVESTMENT: { label: 'Investment Account', icon: TrendingUp, color: '#8b5cf6' },
}

type MoneyModalType = 'deposit' | 'withdraw'

const AccountsPage = () => {
  const { accounts, isLoading, error, refetch } = useAccounts()
  const [selectedAccount, setSelectedAccount] = useState<AccountResult | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [moneyModal, setMoneyModal] = useState<{ type: MoneyModalType; account: AccountResult } | null>(null)

  return (
    <div className="accounts-page">
      <div className="accounts-page-header">
        <h1>My Accounts</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          New Account
        </button>
      </div>

      {isLoading ? (
        <div className="accounts-loading">
          <Loader2 size={28} className="spinner" />
          <span>Loading accounts...</span>
        </div>
      ) : error ? (
        <div className="accounts-error">
          <p>{error}</p>
          <button className="btn-secondary" onClick={refetch}>Retry</button>
        </div>
      ) : accounts.length === 0 ? (
        <div className="accounts-empty">
          <div className="empty-icon">
            <Wallet size={32} />
          </div>
          <h3>No accounts yet</h3>
          <p>Create your first bank account to start managing your finances.</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create Account
          </button>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account) => {
            const config = accountTypeConfig[account.accountType]
            const Icon = config.icon
            return (
              <div key={account.id} className="account-card-full">
                <div className="account-card-header">
                  <div className="account-card-icon" style={{ background: `${config.color}20` }}>
                    <Icon size={20} style={{ color: config.color }} />
                  </div>
                  <div className="account-card-info">
                    <span className="account-card-type">{config.label}</span>
                    <span className="account-card-number">{account.accountNumber}</span>
                  </div>
                </div>

                <div className="account-card-alias">
                  <span className="alias-label">Alias</span>
                  <span className="alias-value">{account.alias}</span>
                </div>

                <div className="account-card-balances">
                  <div className="balance-item">
                    <span className="balance-label">Balance</span>
                    <span className="balance-value">{formatCurrency(account.balance, account.currency)}</span>
                  </div>
                  <div className="balance-item">
                    <span className="balance-label">Available</span>
                    <span className="balance-value available">{formatCurrency(account.availableBalance, account.currency)}</span>
                  </div>
                </div>

                <div className="account-card-actions">
                  <button
                    className="btn-action deposit"
                    onClick={() => setMoneyModal({ type: 'deposit', account })}
                  >
                    <ArrowDownToLine size={16} />
                    Deposit
                  </button>
                  <button
                    className="btn-action withdraw"
                    onClick={() => setMoneyModal({ type: 'withdraw', account })}
                  >
                    <ArrowUpFromLine size={16} />
                    Withdraw
                  </button>
                  <button
                    className="btn-action details"
                    onClick={() => setSelectedAccount(account)}
                  >
                    <Eye size={16} />
                    Details
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); refetch() }}
        />
      )}

      {moneyModal && (
        <MoneyOperationModal
          type={moneyModal.type}
          account={moneyModal.account}
          onClose={() => setMoneyModal(null)}
          onSuccess={() => { setMoneyModal(null); refetch() }}
        />
      )}

      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  )
}

function CreateAccountModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [availableTypes, setAvailableTypes] = useState<AccountType[]>([])
  const [typesLoading, setTypesLoading] = useState(true)
  const [accountType, setAccountType] = useState<AccountType>('CHECKING')
  const [currency, setCurrency] = useState('USD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    accountService.getAccountTypes()
      .then((types) => {
        setAvailableTypes(types)
        if (types.length > 0) setAccountType(types[0])
      })
      .catch(() => setAvailableTypes(['CHECKING', 'SAVINGS', 'INVESTMENT']))
      .finally(() => setTypesLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const request: CreateAccountRequest = { accountType, currency }
      await accountService.createAccount(request)
      onSuccess()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        const typeLabel = accountTypeConfig[accountType].label
        setError(`You already have a ${typeLabel} in ${currency}. Only one account per type and currency is allowed.`)
      } else {
        const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined
        setError(backendMessage ?? (err instanceof Error ? err.message : 'Failed to create account'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlay} role="dialog" aria-modal="true">
      <div className="modal-card compact">
        <div className="modal-header">
          <h2>New Account</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="accountType">Account Type</label>
            {typesLoading ? (
              <div className="form-loading"><Loader2 size={16} className="spinner" /> Loading types...</div>
            ) : (
              <select
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
              >
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{accountTypeConfig[t]?.label ?? t}</option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
            </select>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={16} className="spinner" /> Creating...</> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type MoneyModalStep = 'form' | 'confirm' | 'processing' | 'receipt' | 'error'

const PROCESSING_STEPS = [
  { icon: Shield, label: 'Verifying account...' },
  { icon: RefreshCw, label: 'Processing transaction...' },
  { icon: BadgeCheck, label: 'Finalizing...' },
]

function MoneyOperationModal({
  type,
  account,
  onClose,
  onSuccess,
}: {
  type: MoneyModalType
  account: AccountResult
  onClose: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState<MoneyModalStep>('form')
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState(0)
  const [receipt, setReceipt] = useState<TransactionResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isDeposit = type === 'deposit'
  const numAmount = parseFloat(amount)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount')
      return
    }
    if (!isDeposit && numAmount > account.availableBalance) {
      setFormError('Insufficient funds')
      return
    }
    setFormError(null)
    setStep('confirm')
  }

  const handleConfirm = () => {
    setStep('processing')
  }

  useEffect(() => {
    if (step !== 'processing') return

    let cancelled = false

    const run = async () => {
      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        if (cancelled) return
        setProcessingStep(i)
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 400))
      }

      try {
        const request = {
          amount: numAmount,
          currency: account.currency,
          idempotencyKey: crypto.randomUUID(),
        }
        const result = isDeposit
          ? await accountService.deposit(account.id, request)
          : await accountService.withdraw(account.id, request)

        if (cancelled) return
        setReceipt(result)
        setStep('receipt')
      } catch (err) {
        if (cancelled) return
        const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined
        setSubmitError(backendMessage ?? (err instanceof Error ? err.message : `Failed to ${type}`))
        setStep('error')
      }
    }

    run()
    return () => { cancelled = true }
  }, [step, numAmount, account, isDeposit, type])

  const handleDone = () => {
    onSuccess()
  }

  const handleOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && (step === 'form' || step === 'receipt' || step === 'error')) {
      step === 'form' ? onClose() : onSuccess()
    }
  }

  const title = step === 'receipt'
    ? (isDeposit ? 'Deposit Successful' : 'Withdrawal Successful')
    : step === 'error'
      ? 'Transaction Failed'
      : step === 'processing'
        ? 'Processing'
        : step === 'confirm'
          ? 'Confirm Transaction'
          : (isDeposit ? 'Deposit Funds' : 'Withdraw Funds')

  return (
    <div className="modal-overlay" onClick={handleOverlay} role="dialog" aria-modal="true">
      <div className="modal-card compact">
        {step !== 'processing' && (
          <div className="modal-header">
            <h2>{title}</h2>
            {(step === 'form' || step === 'error') && (
              <button
                className="modal-close-btn"
                onClick={step === 'form' ? onClose : handleDone}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* STEP: Form */}
        {step === 'form' && (
          <>
            <div className="money-modal-account">
              <span className="money-modal-label">Account</span>
              <span className="money-modal-value">
                {account.alias} (*{account.accountNumber.slice(-4)}) — {formatCurrency(account.balance, account.currency)}
              </span>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="amount">Amount ({account.currency})</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
              </div>
              {formError && <p className="form-error">{formError}</p>}
              <div className="modal-form-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary">
                  Continue
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP: Confirmation */}
        {step === 'confirm' && (
          <div className="money-confirm">
            <div className="money-confirm-summary">
              <div className={`money-confirm-amount ${isDeposit ? 'deposit' : 'withdraw'}`}>
                {isDeposit ? '+' : '-'}{formatCurrency(numAmount, account.currency)}
              </div>
              <div className="money-confirm-details">
                <div className="money-confirm-row">
                  <span className="money-confirm-label">Operation</span>
                  <span className="money-confirm-value">{isDeposit ? 'Deposit' : 'Withdrawal'}</span>
                </div>
                <div className="money-confirm-row">
                  <span className="money-confirm-label">Account</span>
                  <span className="money-confirm-value">{account.alias}</span>
                </div>
                <div className="money-confirm-row">
                  <span className="money-confirm-label">Account Number</span>
                  <span className="money-confirm-value money-mono">*{account.accountNumber.slice(-4)}</span>
                </div>
                <div className="money-confirm-row">
                  <span className="money-confirm-label">Current Balance</span>
                  <span className="money-confirm-value">{formatCurrency(account.balance, account.currency)}</span>
                </div>
              </div>
            </div>
            <div className="modal-form-actions" style={{ padding: '0 24px 24px' }}>
              <button className="btn-secondary" onClick={() => setStep('form')}>Back</button>
              <button className={`btn-primary ${!isDeposit ? 'withdraw' : ''}`} onClick={handleConfirm}>
                {isDeposit ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                Confirm {isDeposit ? 'Deposit' : 'Withdrawal'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: Processing */}
        {step === 'processing' && (
          <div className="money-processing">
            <div className="money-processing-steps">
              {PROCESSING_STEPS.map((s, i) => {
                const Icon = s.icon
                const state = i < processingStep ? 'done' : i === processingStep ? 'active' : 'pending'
                return (
                  <div key={i} className={`money-processing-step ${state}`}>
                    <div className="money-step-icon">
                      {state === 'done' ? (
                        <CheckCircle size={20} />
                      ) : state === 'active' ? (
                        <Icon size={20} className="spinner" />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    <span className="money-step-label">{s.label}</span>
                  </div>
                )
              })}
            </div>
            <p className="money-processing-hint">Please do not close this window.</p>
          </div>
        )}

        {/* STEP: Receipt */}
        {step === 'receipt' && receipt && (
          <div className="money-error">
            <div className="money-error-icon success">
              <CheckCircle size={48} />
            </div>
            <p className="money-error-message">
              {isDeposit ? '+' : '-'}{formatCurrency(receipt.amount, receipt.currency)}
            </p>
            <p className="money-error-message" style={{ color: '#6b7280', fontSize: 13 }}>
              Balance: {formatCurrency(receipt.balanceAfter, receipt.currency)}
              {' · '}Ref: {receipt.referenceNumber}
            </p>
            <div className="modal-form-actions" style={{ padding: '0 24px 24px' }}>
              <button className="btn-primary" onClick={handleDone}>Done</button>
            </div>
          </div>
        )}

        {/* STEP: Error */}
        {step === 'error' && (
          <div className="money-error">
            <div className="money-error-icon">
              <AlertCircle size={48} />
            </div>
            <p className="money-error-message">{submitError}</p>
            <div className="modal-form-actions" style={{ padding: '0 24px 24px' }}>
              <button className="btn-secondary" onClick={handleDone}>Close</button>
              <button className="btn-primary" onClick={() => setStep('confirm')}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountsPage
