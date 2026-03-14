import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Logo from '../common/Logo'
import { Link } from 'react-router-dom'

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-surface">
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm px-4 py-2 rounded-xl">Get Started</Link>
        </div>
      </div>
    </header>
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
)

export default PublicLayout
