import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Returns the correct home path for each role */
export const getHomePath = (role) => {
  if (role === 'INSTRUCTOR') return '/teacher/dashboard'
  if (role === 'ADMIN')      return '/admin/dashboard'
  return '/dashboard'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authApi.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password)
    const { access_token, refresh_token, user: userData } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser(userData)
    return userData          // caller uses role to redirect
  }, [])

  const register = useCallback(async (formData) => {
    const res = await authApi.register(formData)
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch (_) {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
      role: user?.role ?? null,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
