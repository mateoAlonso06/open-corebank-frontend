import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Plus,
  Loader2,
  CreditCard,
  Receipt,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { accountService } from '@/services/accountService'
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters'
import AccountDetailModal from '@/components/shared/AccountDetailModal'
import TransactionDetailModal from '@/components/shared/TransactionDetailModal'
import type { AccountResult, AccountType, AccountLimitsResult } from '@/types/api'
import '../styles/DashboardPage.css'

const accountTypeConfig: Record<AccountType, { label: string; icon: typeof Wallet; color: string; actions: string[] }> = {
  CHECKING: { label: 'Checking Account', icon: Wallet, color: '#2563eb', actions: ['Transfer', 'Details'] },
  SAVINGS: { label: 'Savings Account', icon: PiggyBank, color: '#22c55e', actions: ['Transfer', 'Details'] },
  INVESTMENT: { label: 'Investment Account', icon: TrendingUp, color: '#8b5cf6', actions: ['Transfer', 'Details'] },
}

function getLimitColor(used: number, limit: number): string {
  if (limit === 0) return '#6b7280'
  const pct = (used / limit) * 100
  if (pct >= 85) return '#ef4444'
  if (pct >= 60) return '#eab308'
  return '#22c55e'
}

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED': return '#22c55e';
    case 'PENDING': return '#eab308';
    case 'FAILED': return '#ef4444';
    default: return '#6b7280';
  }
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const { accounts, isLoading: accountsLoading } = useAccounts()
  const { transactions, isLoading: transactionsLoading } = useTransactions(0, 5)
  const [selectedAccount, setSelectedAccount] = useState<AccountResult | null>(null)
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)
  const [hiddenBalances, setHiddenBalances] = useState<Set<string>>(new Set())
  const [accountLimits, setAccountLimits] = useState<AccountLimitsResult[]>([])
  const [limitsLoading, setLimitsLoading] = useState(false)
  const [limitsTab, setLimitsTab] = useState<'deposit' | 'withdrawal'>('withdrawal')

  useEffect(() => {
    if (accounts.length === 0) return
    setLimitsLoading(true)
    Promise.all(accounts.map((acc) => accountService.getAccountLimits(acc.id)))
      .then(setAccountLimits)
      .catch(() => setAccountLimits([]))
      .finally(() => setLimitsLoading(false))
  }, [accounts])

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Financial Dashboard</h1>
      </div>

      {/* Account Cards & Spending */}
      <div className="accounts-section">
        {accountsLoading ? (
          <div className="account-card loading-card">
            <Loader2 size={28} className="spinner" />
            <span>Loading accounts...</span>
          </div>
        ) : accounts.length === 0 ? (
          <div className="account-card empty-state-card">
            <div className="empty-state-icon">
              <CreditCard size={32} />
            </div>
            <h3 className="empty-state-title">No accounts yet</h3>
            <p className="empty-state-description">
              Create your first bank account to start managing your finances.
            </p>
            <button className="empty-state-btn" onClick={() => navigate('/accounts')}>
              <Plus size={16} />
              Create Account
            </button>
          </div>
        ) : (
          accounts.map((account) => {
            const config = accountTypeConfig[account.accountType];
            const Icon = config.icon;
            return (
              <div key={account.id} className="account-card">
                <div className="account-header">
                  <div className="account-info">
                    <span className="account-type">{config.label}</span>
                    <span className="account-number">**** {account.accountNumber.slice(-4)}</span>
                  </div>
                  <div className="account-header-right">
                    <button
                      className="balance-toggle-btn"
                      onClick={() => setHiddenBalances((prev) => {
                        const next = new Set(prev)
                        if (next.has(account.id)) next.delete(account.id)
                        else next.add(account.id)
                        return next
                      })}
                      aria-label={hiddenBalances.has(account.id) ? 'Show balance' : 'Hide balance'}
                    >
                      {hiddenBalances.has(account.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <div className="account-icon" style={{ background: `${config.color}20` }}>
                      <Icon size={20} style={{ color: config.color }} />
                    </div>
                  </div>
                </div>
                <div className="account-balance">
                  {hiddenBalances.has(account.id) ? '******' : formatCurrency(account.balance, account.currency)}
                </div>
                <div className="account-actions">
                  {config.actions.map((action, idx) => (
                    <button
                      key={idx}
                      className={`account-action-btn ${idx === 0 ? 'primary' : 'secondary'}`}
                      onClick={() => {
                        if (action === 'Transfer') navigate('/transfers')
                        if (action === 'Details') setSelectedAccount(account)
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Create Account Quick Action */}
        {!accountsLoading && accounts.length > 0 && (
          <div className="account-card create-account-card" onClick={() => navigate('/accounts')}>
            <div className="create-account-content">
              <div className="create-account-icon">
                <Plus size={24} />
              </div>
              <span className="create-account-label">Open New Account</span>
              <span className="create-account-hint">Savings, Checking or Investment</span>
            </div>
          </div>
        )}

      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">
        <div className="section-header">
          <h2>Recent Transactions</h2>
        </div>

        <div className="transactions-table">
          <div className="table-header">
            <span>DATE & TIME</span>
            <span>MERCHANT / DESCRIPTION</span>
            <span>STATUS</span>
            <span>AMOUNT</span>
          </div>

          {transactionsLoading ? (
            <div className="transactions-empty-state">
              <Loader2 size={24} className="spinner" />
              <span className="empty-state-description">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="transactions-empty-state">
              <div className="empty-state-icon small">
                <Receipt size={24} />
              </div>
              <h4 className="empty-state-title">No transactions yet</h4>
              <p className="empty-state-description">
                Your recent transactions will appear here once you start using your accounts.
              </p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isNegative = ['TRANSFER_OUT', 'WITHDRAWAL', 'FEE', 'DEBIT'].includes(tx.transactionType);
              const sign = isNegative ? '-' : '+';
              const statusColor = getStatusColor(tx.status);

              return (
                <div key={tx.id} className="table-row clickable" onClick={() => setSelectedTxId(tx.id)}>
                  <div className="tx-date">
                    <span className="date">{formatDate(tx.executedAt)}</span>
                    <span className="time">{formatTime(tx.executedAt)}</span>
                  </div>
                  <div className="tx-merchant">
                    <span>{tx.description}</span>
                  </div>
                  <div className="tx-status">
                    <span
                      className="status-indicator"
                      style={{ background: statusColor }}
                    ></span>
                    <span>{tx.status}</span>
                  </div>
                  <div className={`tx-amount ${isNegative ? 'negative' : 'positive'}`}>
                    {sign}{formatCurrency(tx.amount, tx.currency)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button className="view-all-btn" onClick={() => navigate('/transactions')}>
          View All Transactions
        </button>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        {/* Spending Limits */}
        <div className="insights-card">
          <div className="limits-card-header">
            <h3>Spending Limits</h3>
            <div className="limits-tab-toggle">
              <button
                className={`limits-tab ${limitsTab === 'withdrawal' ? 'active' : ''}`}
                onClick={() => setLimitsTab('withdrawal')}
              >
                Withdrawals
              </button>
              <button
                className={`limits-tab ${limitsTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setLimitsTab('deposit')}
              >
                Deposits
              </button>
            </div>
          </div>

          {limitsLoading || accountsLoading ? (
            <div className="limits-loading">
              <Loader2 size={20} className="spinner" />
            </div>
          ) : accountLimits.length === 0 ? (
            <p className="limits-empty">No limit data available.</p>
          ) : (
            <div className="limits-list">
              {accountLimits.map((limits) => {
                const account = accounts.find((a) => a.id === limits.accountId)
                const currency = account?.currency ?? 'USD'
                const accountNumber = account?.accountNumber ?? ''
                const config = accountTypeConfig[limits.accountType]
                const period = limits[limitsTab]
                return (
                  <div key={limits.accountId} className="limit-account-block">
                    <div className="limit-account-label">
                      <span>{config.label}</span>
                      {accountNumber && (
                        <span className="limit-account-num">*{accountNumber.slice(-4)}</span>
                      )}
                    </div>
                    <div className="limit-bar-row">
                      <span className="limit-period-label">Daily</span>
                      <div className="limit-bar-track">
                        <div
                          className="limit-bar-fill"
                          style={{
                            width: `${Math.min((period.daily.used / period.daily.limit) * 100, 100)}%`,
                            background: getLimitColor(period.daily.used, period.daily.limit),
                          }}
                        />
                      </div>
                      <span className="limit-bar-text">
                        {formatCurrency(period.daily.used, currency)} / {formatCurrency(period.daily.limit, currency)}
                      </span>
                    </div>
                    <div className="limit-bar-row">
                      <span className="limit-period-label">Monthly</span>
                      <div className="limit-bar-track">
                        <div
                          className="limit-bar-fill"
                          style={{
                            width: `${Math.min((period.monthly.used / period.monthly.limit) * 100, 100)}%`,
                            background: getLimitColor(period.monthly.used, period.monthly.limit),
                          }}
                        />
                      </div>
                      <span className="limit-bar-text">
                        {formatCurrency(period.monthly.used, currency)} / {formatCurrency(period.monthly.limit, currency)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-transfer-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={() => navigate('/transfers')}>
              <div className="quick-action-icon transfer">
                <ArrowLeftRight size={20} />
              </div>
              <span>New Transfer</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/accounts')}>
              <div className="quick-action-icon deposit">
                <ArrowDownToLine size={20} />
              </div>
              <span>Deposit</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/accounts')}>
              <div className="quick-action-icon withdraw">
                <ArrowUpFromLine size={20} />
              </div>
              <span>Withdraw</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/accounts')}>
              <div className="quick-action-icon accounts">
                <Wallet size={20} />
              </div>
              <span>My Accounts</span>
            </button>
          </div>
        </div>
      </div>
      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
      {selectedTxId && (
        <TransactionDetailModal
          transactionId={selectedTxId}
          onClose={() => setSelectedTxId(null)}
        />
      )}
    </div>
  )
}

export default DashboardPage
