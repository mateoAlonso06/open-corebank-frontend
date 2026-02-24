import { 
  Download, 
  Wallet, 
  PiggyBank, 
  Filter, 
  ArrowDownToLine,
  ShoppingBag,
  Building2,
  Coffee,
  Target,
  AlertTriangle,
  Plus
} from 'lucide-react'
import '../styles/DashboardPage.css'

const accounts = [
  {
    type: 'Checking Account',
    number: '**** 4291',
    balance: '$5,240.50',
    icon: Wallet,
    color: '#2563eb',
    actions: ['Transfer', 'Pay']
  },
  {
    type: 'Savings Account',
    number: '**** 8820',
    balance: '$12,800.00',
    icon: PiggyBank,
    color: '#22c55e',
    actions: ['Add Funds', 'Details']
  }
]

const transactions = [
  {
    id: 1,
    date: 'Oct 05, 2023',
    time: '02:15 PM',
    merchant: 'Amazon.com',
    icon: ShoppingBag,
    category: 'Shopping',
    categoryColor: '#3b82f6',
    status: 'Completed',
    statusColor: '#22c55e',
    amount: '-$45.00',
    isNegative: true
  },
  {
    id: 2,
    date: 'Oct 04, 2023',
    time: '09:00 AM',
    merchant: 'Tech Corp Salary',
    icon: Building2,
    category: 'Income',
    categoryColor: '#22c55e',
    status: 'Completed',
    statusColor: '#22c55e',
    amount: '+$3,200.00',
    isNegative: false
  },
  {
    id: 3,
    date: 'Oct 03, 2023',
    time: '08:30 AM',
    merchant: 'Starbucks',
    icon: Coffee,
    category: 'Food & Drink',
    categoryColor: '#f97316',
    status: 'Pending',
    statusColor: '#eab308',
    amount: '-$6.50',
    isNegative: true
  }
]

const spendingCategories = ['Shop', 'Bills', 'Food', 'Travel', 'Other']

const quickTransferContacts = [
  { name: 'John', avatar: 'John' },
  { name: 'Sarah', avatar: 'Sarah' },
  { name: 'Mike', avatar: 'Mike' }
]

const DashboardPage = () => {
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
        {accounts.map((account, index) => (
          <div key={index} className="account-card">
            <div className="account-header">
              <div className="account-info">
                <span className="account-type">{account.type}</span>
                <span className="account-number">{account.number}</span>
              </div>
              <div className="account-icon" style={{ background: `${account.color}20` }}>
                <account.icon size={20} style={{ color: account.color }} />
              </div>
            </div>
            <div className="account-balance">{account.balance}</div>
            <div className="account-actions">
              {account.actions.map((action, idx) => (
                <button 
                  key={idx} 
                  className={`account-action-btn ${idx === 0 ? 'primary' : 'secondary'}`}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}

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
            <span>CATEGORY</span>
            <span>STATUS</span>
            <span>AMOUNT</span>
          </div>
          
          {transactions.map((tx) => (
            <div key={tx.id} className="table-row">
              <div className="tx-date">
                <span className="date">{tx.date}</span>
                <span className="time">{tx.time}</span>
              </div>
              <div className="tx-merchant">
                <div className="merchant-icon">
                  <tx.icon size={16} />
                </div>
                <span>{tx.merchant}</span>
              </div>
              <div className="tx-category">
                <span 
                  className="category-badge" 
                  style={{ 
                    background: `${tx.categoryColor}15`,
                    color: tx.categoryColor
                  }}
                >
                  {tx.category}
                </span>
              </div>
              <div className="tx-status">
                <span 
                  className="status-indicator" 
                  style={{ background: tx.statusColor }}
                ></span>
                <span>{tx.status}</span>
              </div>
              <div className={`tx-amount ${tx.isNegative ? 'negative' : 'positive'}`}>
                {tx.amount}
              </div>
            </div>
          ))}
        </div>

        <button className="view-all-btn">View All Transactions</button>
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
    </div>
  )
}

export default DashboardPage
