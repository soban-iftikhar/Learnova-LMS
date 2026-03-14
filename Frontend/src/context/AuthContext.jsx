import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // On mount: load user from token
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
    setError(null)
    const res = await authApi.login(email, password)
    const { access_token, refresh_token, user: userData } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (formData) => {
    setError(null)
    const res = await authApi.register(formData)
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (_) { /* silent */ }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  const isAuthenticated = Boolean(user)
  const role = user?.role

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAuthenticated, role }}>
      {children}
    </AuthContext.Provider>
  )
}
