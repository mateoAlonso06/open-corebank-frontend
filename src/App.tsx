import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerificationPage from './pages/VerificationPage'
import LoadingPage from './pages/LoadingPage'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import AccountsPage from './pages/AccountsPage'
import TransfersPage from './pages/TransfersPage'
import PaymentsPage from './pages/PaymentsPage'
import ProfilePage from './pages/ProfilePage'
import SecurityPage from './pages/SecurityPage'
import TransactionsPage from './pages/TransactionsPage'

function RootRedirect() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-2fa" element={<VerificationPage type="two-factor" />} />
          <Route path="/confirm-account" element={<VerificationPage type="account-confirmation" />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transfers" element={<TransfersPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/security" element={<SecurityPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
