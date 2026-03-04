import api from './api';
import type {
  LoginRequest,
  LoginResult,
  RegisterUserRequest,
  RegisterResult,
  VerifyTwoFactorRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ChangeUserPasswordRequest,
  TwoFactorStatusResponse,
  ToggleTwoFactorRequest,
} from '@/types/api';

export async function login(data: LoginRequest): Promise<LoginResult> {
  const res = await api.post<LoginResult>('/auth/login', data);
  return res.data;
}

export async function register(data: RegisterUserRequest): Promise<RegisterResult> {
  const res = await api.post<RegisterResult>('/auth/register', data);
  return res.data;
}

export async function verify2FA(data: VerifyTwoFactorRequest): Promise<LoginResult> {
  const res = await api.post<LoginResult>('/auth/2fa/verify', data);
  return res.data;
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<void> {
  await api.post('/auth/verify-email', data);
}

export async function resendVerification(data: ResendVerificationRequest): Promise<void> {
  await api.post('/auth/resend-verification', data);
}

export async function refreshAccessToken(): Promise<{ token: string }> {
  const res = await api.post<{ token: string }>('/auth/refresh');
  return res.data;
}

export async function logoutSession(): Promise<void> {
  await api.post('/auth/logout');
}

export async function changePassword(data: ChangeUserPasswordRequest): Promise<void> {
  await api.put('/auth/change-password', data);
}

export async function get2FAStatus(): Promise<TwoFactorStatusResponse> {
  const res = await api.get<TwoFactorStatusResponse>('/auth/2fa/status');
  return res.data;
}

export async function toggle2FA(data: ToggleTwoFactorRequest): Promise<void> {
  await api.put('/auth/2fa/toggle', data);
}

export async function deactivateAccount(password: string): Promise<void> {
  await api.delete('/auth/account', { data: { password } });
}
