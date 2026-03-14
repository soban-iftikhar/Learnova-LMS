import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="text-center max-w-md">
        {/* Large 404 */}
        <div className="relative mb-8 select-none">
          <p className="text-[10rem] font-black text-gray-100 leading-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-brand-50 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#1f9b6e"/>
                <path d="M12 34 L24 14 L36 34" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 27 L31 27" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-ink mb-3">Page not found</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Looks like you've ventured off the learning path. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link to="/dashboard" className="btn-primary">
            <Home size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
