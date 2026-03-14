import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const AppLayout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar (desktop only) */}
      <Sidebar onLogout={handleLogout} />

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Navbar (mobile) - hidden on desktop since sidebar handles nav */}
        <div className="lg:hidden">
          <Navbar />
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
