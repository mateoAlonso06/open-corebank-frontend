import api from './api';
import type { TransactionResult, PagedResult } from '@/types/api';

export const transactionService = {
  getTransactionById: async (transactionId: string): Promise<TransactionResult> => {
    const { data } = await api.get<TransactionResult>(`/transactions/${transactionId}`);
    return data;
  },

  getMyTransactions: async (page: number, size: number): Promise<PagedResult<TransactionResult>> => {
    const { data } = await api.get<PagedResult<TransactionResult>>('/transactions/me', {
      params: { page, size },
    });
    return data;
  },

  getAccountTransactions: async (
    accountId: string,
    page: number,
    size: number,
  ): Promise<PagedResult<TransactionResult>> => {
    const { data } = await api.get<PagedResult<TransactionResult>>(
      `/transactions/accounts/${accountId}`,
      { params: { page, size } },
    );
    return data;
  },
};
