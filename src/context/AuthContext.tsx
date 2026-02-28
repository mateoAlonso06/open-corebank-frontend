import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { LoginResult, CustomerResult } from '@/types/api';
import { logoutSession } from '@/services/authService';

interface AuthUser {
  id: string;
  email: string;
  role: LoginResult['role'];
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  customer: CustomerResult | null;
  lastLoginAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (result: LoginResult) => void;
  verify2FA: (result: LoginResult) => void;
  logout: () => void;
  setCustomer: (customer: CustomerResult) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [customer, setCustomerState] = useState<CustomerResult | null>(null);
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedLastLogin = localStorage.getItem('lastLoginAt');
    const savedCustomer = localStorage.getItem('customer');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedLastLogin) {
      setLastLoginAt(savedLastLogin);
    }
    if (savedCustomer) {
      setCustomerState(JSON.parse(savedCustomer));
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((result: LoginResult) => {
    const authUser: AuthUser = { id: result.id, email: result.email, role: result.role };
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(authUser));
    if (result.lastLoginAt) {
      localStorage.setItem('lastLoginAt', result.lastLoginAt);
      setLastLoginAt(result.lastLoginAt);
    } else {
      localStorage.removeItem('lastLoginAt');
      setLastLoginAt(null);
    }
    setToken(result.token);
    setUser(authUser);
  }, []);

  const login = useCallback((result: LoginResult) => {
    persistSession(result);
  }, [persistSession]);

  const verify2FA = useCallback((result: LoginResult) => {
    persistSession(result);
  }, [persistSession]);

  const logout = useCallback(() => {
    logoutSession().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('customer');
    localStorage.removeItem('lastLoginAt');
    setToken(null);
    setUser(null);
    setCustomerState(null);
    setLastLoginAt(null);
    window.location.href = '/login';
  }, []);

  const setCustomer = useCallback((c: CustomerResult) => {
    localStorage.setItem('customer', JSON.stringify(c));
    setCustomerState(c);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        customer,
        lastLoginAt,
        isAuthenticated: !!token,
        isLoading,
        login,
        verify2FA,
        logout,
        setCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
