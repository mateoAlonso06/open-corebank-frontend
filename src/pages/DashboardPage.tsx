import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download,
  Wallet,
  PiggyBank,
  TrendingUp,
  Filter,
  ArrowDownToLine,
  Target,
  AlertTriangle,
  Plus,
  Loader2,
  CreditCard,
  Receipt,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters'
import AccountDetailModal from '@/components/shared/AccountDetailModal'
import type { AccountResult, AccountType } from '@/types/api'
import '../styles/DashboardPage.css'

const accountTypeConfig: Record<AccountType, { label: string; icon: typeof Wallet; color: string; actions: string[] }> = {
  CHECKING: { label: 'Checking Account', icon: Wallet, color: '#2563eb', actions: ['Transfer', 'Details'] },
  SAVINGS: { label: 'Savings Account', icon: PiggyBank, color: '#22c55e', actions: ['Transfer', 'Details'] },
  INVESTMENT: { label: 'Investment Account', icon: TrendingUp, color: '#8b5cf6', actions: ['Transfer', 'Details'] },
}

const spendingCategories = ['Shop', 'Bills', 'Food', 'Travel', 'Other']

const quickTransferContacts = [
  { name: 'John', avatar: 'John' },
  { name: 'Sarah', avatar: 'Sarah' },
  { name: 'Mike', avatar: 'Mike' }
]

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
  const [hiddenBalances, setHiddenBalances] = useState<Set<string>>(new Set())

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Financial Dashboard</h1>
        <button className="download-report-btn">
          <Download size={16} />
          Download Report
        </button>
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

        {/* Monthly Spending Card */}
        <div className="spending-card">
          <div className="spending-header">
            <span className="spending-title">MONTHLY SPENDING</span>
            <span className="spending-period">Oct 2023</span>
          </div>
          <div className="spending-chart">
            {spendingCategories.map((category, idx) => (
              <div key={idx} className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    height: `${[60, 45, 75, 30, 50][idx]}%`,
                    background: ['#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#6b7280'][idx]
                  }}
                ></div>
                <span className="chart-label">{category}</span>
              </div>
            ))}
          </div>
          <div className="spending-total">
            <span>Total Spent</span>
            <span className="total-amount">$1,842.10</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <div className="section-actions">
            <button className="filter-btn">
              <Filter size={16} />
              Filter
            </button>
            <button className="export-btn">
              <ArrowDownToLine size={16} />
              Export
            </button>
          </div>
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
                <div key={tx.id} className="table-row">
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
        {/* Financial Insights */}
        <div className="insights-card">
          <h3>Financial Insights</h3>

          <div className="insight-item">
            <div className="insight-icon savings">
              <Target size={18} />
            </div>
            <div className="insight-content">
              <span className="insight-title">Savings Goal Alert</span>
              <span className="insight-description">
                You're only $200 away from your "New Car" goal this month. Keep it up!
              </span>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon warning">
              <AlertTriangle size={18} />
            </div>
            <div className="insight-content">
              <span className="insight-title">Spending Limit</span>
              <span className="insight-description">
                You've used 85% of your monthly dining budget ($425/$500). Consider slowing down to stay on track.
              </span>
            </div>
          </div>
        </div>

        {/* Quick Transfer */}
        <div className="quick-transfer-card">
          <h3>Quick Transfer</h3>

          <div className="transfer-contacts">
            <div className="contact add-new">
              <div className="contact-avatar">
                <Plus size={20} />
              </div>
              <span>New</span>
            </div>
            {quickTransferContacts.map((contact, idx) => (
              <div key={idx} className="contact">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.avatar}`}
                  alt={contact.name}
                  className="contact-avatar"
                />
                <span>{contact.name}</span>
              </div>
            ))}
          </div>

          <div className="transfer-amount-input">
            <input type="text" placeholder="Enter amount" />
            <span className="currency">USD</span>
          </div>

          <button className="send-money-btn">
            Send Money
          </button>
        </div>
      </div>
      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  )
}

export default DashboardPage
