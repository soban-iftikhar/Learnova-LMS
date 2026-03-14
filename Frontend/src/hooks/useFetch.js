import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${url}`,
        {
          ...options,
          headers,
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [url, token, options])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, error, loading, refetch: fetchData }
}
