import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col lg:ml-60">
        <div className="lg:hidden">
          <Navbar />
        </div>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
