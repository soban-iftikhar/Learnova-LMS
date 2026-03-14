import { createContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken)
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('authToken')
        } else {
          setToken(savedToken)
          setUser({
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
          })
        }
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('authToken')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password, role = 'STUDENT') => {
    setError(null)
    try {
      const roleEndpoint = role === 'STUDENT' ? 'student' : 'instructor'
      const endpoint = `${import.meta.env.VITE_API_BASE_URL}/${roleEndpoint}/login`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const tokenString = await response.text()
      const decoded = jwtDecode(tokenString)

      localStorage.setItem('authToken', tokenString)
      setToken(tokenString)
      setUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      })

      return decoded
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signup = async (data, role = 'STUDENT') => {
    setError(null)
    try {
      const roleEndpoint = role === 'STUDENT' ? 'student/registerStudent' : 'instructor/registerInstructor'
      const endpoint = `${import.meta.env.VITE_API_BASE_URL}/${roleEndpoint}`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Signup failed')
      }

      const result = await response.json()
      
      // Auto-login after signup
      if (result.token) {
        const decoded = jwtDecode(result.token)
        localStorage.setItem('authToken', result.token)
        setToken(result.token)
        setUser({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        })
      }

      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
    setError(null)
  }

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
