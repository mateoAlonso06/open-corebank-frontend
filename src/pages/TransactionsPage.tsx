import { useState, useEffect, useCallback } from 'react'
import { ArrowDownToLine, Filter, Loader2, Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import { transactionService } from '@/services/transactionService'
import { useAccounts } from '@/hooks/useAccounts'
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters'
import TransactionDetailModal from '@/components/shared/TransactionDetailModal'
import type { TransactionResult } from '@/types/api'
import '../styles/TransactionsPage.css'

const PAGE_SIZE = 10

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED': return '#22c55e'
    case 'PENDING': return '#eab308'
    case 'FAILED': return '#ef4444'
    default: return '#6b7280'
  }
}

const TransactionsPage = () => {
  const { accounts } = useAccounts()
  const [transactions, setTransactions] = useState<TransactionResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [filterAccount, setFilterAccount] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)

  const fetchTransactions = useCallback(async (currentPage: number) => {
    setIsLoading(true)
    try {
      if (filterAccount) {
        const res = await transactionService.getAccountTransactions(filterAccount, currentPage, PAGE_SIZE)
        setTransactions(res.items)
        setTotalPages(res.totalPages)
        setTotalElements(res.totalElements)
      } else {
        const res = await transactionService.getMyTransactions(currentPage, PAGE_SIZE)
        setTransactions(res.items)
        setTotalPages(res.totalPages)
        setTotalElements(res.totalElements)
      }
    } catch {
      setTransactions([])
      setTotalPages(0)
      setTotalElements(0)
    } finally {
      setIsLoading(false)
    }
  }, [filterAccount])

  useEffect(() => {
    setPage(0)
  }, [filterAccount])

  useEffect(() => {
    fetchTransactions(page)
  }, [page, fetchTransactions])

  const filteredTransactions = filterStatus
    ? transactions.filter((tx) => tx.status.toUpperCase() === filterStatus)
    : transactions

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <span className="tx-page-subtitle">{totalElements} total transactions</span>
        </div>
        <div className="section-actions">
          <button className="filter-btn" onClick={() => setShowFilters((v) => !v)}>
            <Filter size={16} />
            Filters
          </button>
          <button className="export-btn">
            <ArrowDownToLine size={16} />
            Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="tx-filters">
          <div className="tx-filter-group">
            <label className="tx-filter-label">Account</label>
            <select
              className="tx-filter-select"
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
            >
              <option value="">All accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.alias} (*{acc.accountNumber.slice(-4)})
                </option>
              ))}
            </select>
          </div>
          <div className="tx-filter-group">
            <label className="tx-filter-label">Status</label>
            <select
              className="tx-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      )}

      <div className="tx-table-card">
        <div className="table-header">
          <span>DATE & TIME</span>
          <span>DESCRIPTION</span>
          <span>STATUS</span>
          <span>AMOUNT</span>
        </div>

        {isLoading ? (
          <div className="transactions-empty-state">
            <Loader2 size={24} className="spinner" />
            <span className="empty-state-description">Loading transactions...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="transactions-empty-state">
            <div className="empty-state-icon small">
              <Receipt size={24} />
            </div>
            <h4 className="empty-state-title">No transactions found</h4>
            <p className="empty-state-description">
              {filterAccount || filterStatus
                ? 'Try adjusting your filters to see more results.'
                : 'Your transactions will appear here once you start using your accounts.'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isNegative = ['TRANSFER_OUT', 'WITHDRAWAL', 'FEE', 'DEBIT'].includes(tx.transactionType)
            const sign = isNegative ? '-' : '+'
            const statusColor = getStatusColor(tx.status)

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
                  <span className="status-indicator" style={{ background: statusColor }}></span>
                  <span>{tx.status}</span>
                </div>
                <div className={`tx-amount ${isNegative ? 'negative' : 'positive'}`}>
                  {sign}{formatCurrency(tx.amount, tx.currency)}
                </div>
              </div>
            )
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="tx-pagination">
          <button
            className="tx-page-btn"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="tx-page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="tx-page-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
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

export default TransactionsPage
