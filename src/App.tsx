import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<DashboardPage />} />
          <Route path="/transfers" element={<DashboardPage />} />
          <Route path="/payments" element={<DashboardPage />} />
          <Route path="/investments" element={<DashboardPage />} />
          <Route path="/profile" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
