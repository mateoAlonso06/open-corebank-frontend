import api from './api';
import type {
  AccountResult,
  AccountBalanceResult,
  AccountPublicResult,
  AccountType,
  CreateAccountRequest,
  DepositMoneyRequest,
  WithdrawMoneyRequest,
  MoneyOperationResult,
} from '@/types/api';

export const accountService = {
  getMyAccounts: async (): Promise<AccountResult[]> => {
    const { data } = await api.get<AccountResult[]>('/accounts/me');
    return data;
  },

  getAccountById: async (accountId: string): Promise<AccountResult> => {
    const { data } = await api.get<AccountResult>(`/accounts/me/${accountId}`);
    return data;
  },

  getAccountBalance: async (accountId: string): Promise<AccountBalanceResult> => {
    const { data } = await api.get<AccountBalanceResult>(`/accounts/me/${accountId}/balance`);
    return data;
  },

  getAccountTypes: async (): Promise<AccountType[]> => {
    const { data } = await api.get<AccountType[]>('/accounts/types');
    return data;
  },

  searchByAlias: async (alias: string): Promise<AccountPublicResult> => {
    const { data } = await api.get<AccountPublicResult>('/accounts/search', {
      params: { alias },
    });
    return data;
  },

  createAccount: async (request: CreateAccountRequest): Promise<AccountResult> => {
    const { data } = await api.post<AccountResult>('/accounts', request);
    return data;
  },

  deposit: async (accountId: string, request: DepositMoneyRequest): Promise<MoneyOperationResult> => {
    const { data } = await api.post<MoneyOperationResult>(
      `/transactions/accounts/${accountId}/deposits`,
      request,
    );
    return data;
  },

  withdraw: async (accountId: string, request: WithdrawMoneyRequest): Promise<MoneyOperationResult> => {
    const { data } = await api.post<MoneyOperationResult>(
      `/transactions/accounts/${accountId}/withdrawals`,
      request,
    );
    return data;
  },
};
