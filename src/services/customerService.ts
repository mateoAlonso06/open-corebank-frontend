import api from './api';
import type { CustomerResult, CustomerUpdateRequest } from '@/types/api';

export async function getMyCustomer(): Promise<CustomerResult> {
  const res = await api.get<CustomerResult>('/customers/me');
  return res.data;
}

export async function updateMyCustomer(data: CustomerUpdateRequest): Promise<CustomerResult> {
  const res = await api.put<CustomerResult>('/customers/me', data);
  return res.data;
}
