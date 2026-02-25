import { useState, useEffect } from 'react';
import { transactionService } from '@/services/transactionService';
import type { TransactionResult } from '@/types/api';

interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export function useTransactions(page: number = 0, size: number = 5) {
  const [transactions, setTransactions] = useState<TransactionResult[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 0,
    size,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await transactionService.getMyTransactions(page, size);
        if (!cancelled) {
          setTransactions(data.items);
          setPagination({
            page: data.page,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            hasNext: data.hasNext,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load transactions');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchTransactions();
    return () => { cancelled = true; };
  }, [page, size]);

  return { transactions, pagination, isLoading, error };
}
