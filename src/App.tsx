import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import VerificationPage from './pages/VerificationPage'
import LoadingPage from './pages/LoadingPage'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SecurityPage from './pages/SecurityPage'

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
          <Route path="/verify-2fa" element={<VerificationPage type="two-factor" />} />
          <Route path="/confirm-account" element={<VerificationPage type="account-confirmation" />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/accounts" element={<DashboardPage />} />
              <Route path="/transfers" element={<DashboardPage />} />
              <Route path="/payments" element={<DashboardPage />} />
              <Route path="/investments" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/settings" element={<ProfilePage />} />
              <Route path="/profile/security" element={<SecurityPage />} />
              <Route path="/profile/notifications" element={<ProfilePage />} />
              <Route path="/profile/linked-accounts" element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
