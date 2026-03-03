import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeftRight,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import axios from 'axios'
import { useAccounts } from '@/hooks/useAccounts'
import { accountService } from '@/services/accountService'
import { transferService } from '@/services/transferService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type {
  TransferMoneyRequest,
  TransferReceipt,
  TransferCategory,
  AccountPublicResult,
} from '@/types/api'
import '@/styles/TransfersPage.css'

const CATEGORIES: { value: TransferCategory; label: string }[] = [
  { value: 'OTHERS', label: 'Others' },
  { value: 'FOOD', label: 'Food' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'RECHARGES', label: 'Recharges' },
  { value: 'TAXES', label: 'Taxes' },
]

type DestMode = 'alias' | 'cbu'

const TransfersPage = () => {
  const { accounts, isLoading: accountsLoading } = useAccounts()

  // Form state
  const [fromAccountId, setFromAccountId] = useState('')
  const [destMode, setDestMode] = useState<DestMode>('alias')
  const [destAlias, setDestAlias] = useState('')
  const [destCbu, setDestCbu] = useState('')
  const [aliasSearch, setAliasSearch] = useState<AccountPublicResult | null>(null)
  const [aliasSearching, setAliasSearching] = useState(false)
  const [aliasError, setAliasError] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [category, setCategory] = useState<TransferCategory>('OTHERS')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null)

  // History state
  const [transfers, setTransfers] = useState<TransferReceipt[]>([])
  const [historyPage, setHistoryPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [historyLoading, setHistoryLoading] = useState(true)

  const fetchHistory = useCallback(async (page: number) => {
    setHistoryLoading(true)
    try {
      const result = await transferService.getMyTransfers(page, 10)
      setTransfers(result.items)
      setTotalPages(result.totalPages)
    } catch {
      setTransfers([])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory(historyPage)
  }, [historyPage, fetchHistory])

  // Auto-select first account
  useEffect(() => {
    if (accounts.length > 0 && !fromAccountId) {
      setFromAccountId(accounts[0].id)
      setCurrency(accounts[0].currency)
    }
  }, [accounts, fromAccountId])

  const handleSearchAlias = async () => {
    if (!destAlias.trim()) return
    setAliasSearching(true)
    setAliasError(null)
    setAliasSearch(null)
    try {
      const result = await accountService.searchByAlias(destAlias.trim())
      setAliasSearch(result)
    } catch {
      setAliasError('Account not found')
    } finally {
      setAliasSearching(false)
    }
  }

  const handleFromAccountChange = (accountId: string) => {
    setFromAccountId(accountId)
    const acc = accounts.find((a) => a.id === accountId)
    if (acc) setCurrency(acc.currency)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setSubmitError('Please enter a valid amount')
      return
    }
    if (!fromAccountId) {
      setSubmitError('Please select a source account')
      return
    }
    if (destMode === 'alias' && !destAlias.trim()) {
      setSubmitError('Please enter a destination alias')
      return
    }
    if (destMode === 'alias' && /^\d{10,}$/.test(destAlias.trim())) {
      setSubmitError('It looks like you entered a CBU/account number. Switch to "By CBU" mode or enter a valid alias.')
      return
    }
    if (destMode === 'cbu' && !destCbu.trim()) {
      setSubmitError('Please enter a destination CBU')
      return
    }
    if (destMode === 'cbu' && /[a-zA-Z]/.test(destCbu.trim())) {
      setSubmitError('It looks like you entered an alias. Switch to "By Alias" mode or enter a valid CBU/account number.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const request: TransferMoneyRequest = {
        fromAccountId,
        amount: numAmount,
        currency,
        category,
        description: description || 'Transfer',
        idempotencyKey: crypto.randomUUID(),
      }
      if (destMode === 'alias') {
        request.toAlias = destAlias.trim()
      } else {
        request.toAccountNumber = destCbu.trim()
      }

      const result = await transferService.createTransfer(request)
      setReceipt(result)
      fetchHistory(0)
      setHistoryPage(0)
    } catch (err) {
      const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined
      setSubmitError(backendMessage ?? (err instanceof Error ? err.message : 'Transfer failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setReceipt(null)
    setDestAlias('')
    setDestCbu('')
    setAliasSearch(null)
    setAmount('')
    setDescription('')
    setSubmitError(null)
  }

  const selectedAccount = accounts.find((a) => a.id === fromAccountId)

  return (
    <div className="transfers-page">
      <div className="transfers-page-header">
        <h1>Transfers</h1>
      </div>

      <div className="transfers-content">
        {/* Transfer Form */}
        <div className="transfer-form-card">
          {receipt ? (
            <div className="transfer-receipt">
              <div className="receipt-icon">
                <CheckCircle size={48} />
              </div>
              <h2>Transfer Successful</h2>
              <div className="receipt-details">
                <div className="receipt-row">
                  <span>Amount</span>
                  <span className="receipt-value">{formatCurrency(receipt.amount, receipt.currency)}</span>
                </div>
                {receipt.fee > 0 && (
                  <div className="receipt-row">
                    <span>Fee</span>
                    <span className="receipt-value">{formatCurrency(receipt.fee, receipt.currency)}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span>From</span>
                  <span className="receipt-value">{receipt.source.alias} (*{receipt.source.partialAccountNumber})</span>
                </div>
                <div className="receipt-row">
                  <span>To</span>
                  <span className="receipt-value">{receipt.destination.alias} (*{receipt.destination.partialAccountNumber})</span>
                </div>
                <div className="receipt-row">
                  <span>Reference</span>
                  <span className="receipt-value mono">{receipt.referenceNumber}</span>
                </div>
                <div className="receipt-row">
                  <span>Date</span>
                  <span className="receipt-value">{formatDate(receipt.executedAt)}</span>
                </div>
              </div>
              <button className="btn-primary" onClick={resetForm}>New Transfer</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2>New Transfer</h2>

              <div className="form-group">
                <label htmlFor="fromAccount">From Account</label>
                {accountsLoading ? (
                  <div className="form-loading"><Loader2 size={16} className="spinner" /> Loading...</div>
                ) : (
                  <select
                    id="fromAccount"
                    value={fromAccountId}
                    onChange={(e) => handleFromAccountChange(e.target.value)}
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.alias} (*{acc.accountNumber.slice(-4)}) — {formatCurrency(acc.balance, acc.currency)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Destination</label>
                <div className="dest-toggle">
                  <button
                    type="button"
                    className={`dest-toggle-btn ${destMode === 'alias' ? 'active' : ''}`}
                    onClick={() => setDestMode('alias')}
                  >
                    By Alias
                  </button>
                  <button
                    type="button"
                    className={`dest-toggle-btn ${destMode === 'cbu' ? 'active' : ''}`}
                    onClick={() => setDestMode('cbu')}
                  >
                    By CBU
                  </button>
                </div>

                {destMode === 'alias' ? (
                  <div className="alias-search-group">
                    <div className="alias-input-row">
                      <input
                        type="text"
                        placeholder="Enter alias"
                        value={destAlias}
                        onChange={(e) => { setDestAlias(e.target.value); setAliasSearch(null); setAliasError(null) }}
                      />
                      <button
                        type="button"
                        className="search-alias-btn"
                        onClick={handleSearchAlias}
                        disabled={aliasSearching || !destAlias.trim()}
                      >
                        {aliasSearching ? <Loader2 size={16} className="spinner" /> : <Search size={16} />}
                      </button>
                    </div>
                    {aliasSearch && (
                      <div className="alias-result">
                        <span className="alias-result-name">{aliasSearch.ownerName}</span>
                        <span className="alias-result-detail">{aliasSearch.accountType} — {aliasSearch.currency}</span>
                      </div>
                    )}
                    {aliasError && <p className="form-error">{aliasError}</p>}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter CBU / Account Number"
                    value={destCbu}
                    onChange={(e) => setDestCbu(e.target.value)}
                  />
                )}
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="amount">Amount</label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <input id="currency" type="text" value={currency} readOnly className="currency-readonly" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransferCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <input
                  id="description"
                  type="text"
                  placeholder="What's this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {submitError && (
                <div className="form-error-box">
                  <AlertCircle size={16} />
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary submit-transfer"
                disabled={isSubmitting || accountsLoading}
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="spinner" /> Processing...</>
                ) : (
                  <><ArrowLeftRight size={16} /> Send Transfer</>
                )}
              </button>

              {selectedAccount && (
                <p className="available-balance-hint">
                  Available: {formatCurrency(selectedAccount.availableBalance, selectedAccount.currency)}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Transfer History */}
        <div className="transfer-history-card">
          <h2>Transfer History</h2>

          {historyLoading ? (
            <div className="history-loading">
              <Loader2 size={24} className="spinner" />
              <span>Loading transfers...</span>
            </div>
          ) : transfers.length === 0 ? (
            <div className="history-empty">
              <ArrowLeftRight size={32} />
              <p>No transfers yet</p>
            </div>
          ) : (
            <>
              <div className="history-table">
                <div className="history-header">
                  <span>Date</span>
                  <span>From</span>
                  <span>To</span>
                  <span>Amount</span>
                  <span>Reference</span>
                </div>
                {transfers.map((t) => {
                  const isOutgoing = accounts.some((a) => a.alias === t.source.alias)
                  return (
                    <div key={t.transferId} className="history-row">
                      <span className="history-date">{formatDate(t.executedAt)}</span>
                      <span className="history-account">{t.source.alias}</span>
                      <span className="history-account">{t.destination.alias}</span>
                      <span className={`history-amount ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                        {isOutgoing ? '-' : '+'}{formatCurrency(t.amount, t.currency)}
                      </span>
                      <span className="history-ref">{t.referenceNumber}</span>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="history-pagination">
                  <button
                    className="btn-secondary"
                    disabled={historyPage === 0}
                    onClick={() => setHistoryPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {historyPage + 1} of {totalPages}
                  </span>
                  <button
                    className="btn-secondary"
                    disabled={historyPage >= totalPages - 1}
                    onClick={() => setHistoryPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransfersPage
