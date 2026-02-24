import api from './api';
import type { CustomerResult } from '@/types/api';

export async function getMyCustomer(): Promise<CustomerResult> {
  const res = await api.get<CustomerResult>('/customers/me');
  return res.data;
}
