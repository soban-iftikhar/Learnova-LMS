import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, getHomePath } from '../context/AuthContext'
import { PageLoader } from './common/Spinner'

/**
 * Guards authenticated routes.
 * If allowedRoles is supplied, redirects non-matching users to their own home.
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    // Send the user to the correct dashboard for their role instead of a 404
    return <Navigate to={getHomePath(user?.role)} replace />
  }

  return children
}

/**
 * Guards guest-only routes (login / signup).
 * Redirects already-logged-in users to their role-appropriate dashboard.
 */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to={getHomePath(user?.role)} replace />
  return children
}
