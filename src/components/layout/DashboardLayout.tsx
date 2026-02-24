import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import './DashboardLayout.css'

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default DashboardLayout
