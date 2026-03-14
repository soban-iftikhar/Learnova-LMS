import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../common/Logo'

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 text-sm text-gray-400 max-w-xs">
            A modern learning platform designed to help you grow at your own pace. Learn without limits.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink mb-3">Platform</p>
          <ul className="space-y-2">
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/courses', label: 'Courses' },
              { to: '/about', label: 'About' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-gray-400 hover:text-brand-500 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink mb-3">Support</p>
          <ul className="space-y-2">
            {[
              { to: '/contact', label: 'Contact Us' },
              { to: '/help', label: 'Help Center' },
              { to: '#', label: 'Privacy Policy' },
            ].map(({ to, label }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-gray-400 hover:text-brand-500 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Learnova. All rights reserved.</p>
        <p className="text-xs text-gray-400">Built for learners, by learners.</p>
      </div>
    </div>
  </footer>
)

export default Footer
