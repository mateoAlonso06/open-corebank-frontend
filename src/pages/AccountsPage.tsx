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
} from 'lucide-react'
import { AxiosError } from 'axios'
import { useAccounts } from '@/hooks/useAccounts'
import { accountService } from '@/services/accountService'
import { formatCurrency } from '@/utils/formatters'
import AccountDetailModal from '@/components/shared/AccountDetailModal'
import type { AccountResult, AccountType, CreateAccountRequest } from '@/types/api'
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
      if (err instanceof AxiosError && err.response?.status === 409) {
        const typeLabel = accountTypeConfig[accountType].label
        setError(`You already have a ${typeLabel} in ${currency}. Only one account per type and currency is allowed.`)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create account')
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
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDeposit = type === 'deposit'
  const title = isDeposit ? 'Deposit Funds' : 'Withdraw Funds'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const request = {
        amount: numAmount,
        currency: account.currency,
        idempotencyKey: crypto.randomUUID(),
      }
      if (isDeposit) {
        await accountService.deposit(account.id, request)
      } else {
        await accountService.withdraw(account.id, request)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${type}`)
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
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="money-modal-account">
          <span className="money-modal-label">Account</span>
          <span className="money-modal-value">
            {account.alias} (*{account.accountNumber.slice(-4)}) — {formatCurrency(account.balance, account.currency)}
          </span>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
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
          {error && <p className="form-error">{error}</p>}
          <div className="modal-form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn-primary ${!isDeposit ? 'withdraw' : ''}`} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 size={16} className="spinner" /> Processing...</>
              ) : (
                <>{isDeposit ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />} {isDeposit ? 'Deposit' : 'Withdraw'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountsPage
