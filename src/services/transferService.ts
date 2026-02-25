import api from './api';
import type { TransferMoneyRequest, TransferReceipt, PagedResult } from '@/types/api';

export const transferService = {
  createTransfer: async (request: TransferMoneyRequest): Promise<TransferReceipt> => {
    const { data } = await api.post<TransferReceipt>('/transfers', request);
    return data;
  },

  getMyTransfers: async (page: number, size: number): Promise<PagedResult<TransferReceipt>> => {
    const { data } = await api.get<PagedResult<TransferReceipt>>('/transfers/me', {
      params: { page, size },
    });
    return data;
  },
};
