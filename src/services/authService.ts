import api from './api';
import type {
  LoginRequest,
  LoginResult,
  RegisterUserRequest,
  RegisterResult,
  VerifyTwoFactorRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
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
