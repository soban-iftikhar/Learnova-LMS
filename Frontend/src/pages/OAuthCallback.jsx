import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth, getHomePath } from '../context/AuthContext'
import { authApi } from '../api/auth'
import { PageLoader } from '../components/common/Spinner'
import { useToast } from '../components/common/Toast'

/**
 * Handles the OAuth2 redirect from the backend.
 * Backend redirects to: /oauth-callback?access_token=...&refresh_token=...&role=...
 * We store the tokens, fetch the user profile, then redirect to the role home.
 */
const OAuthCallback = () => {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const toast      = useToast()
  // We can't use useAuth().login here since we already have tokens — set manually
  const { } = useAuth()

  useEffect(() => {
    const access_token  = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const role          = params.get('role')

    if (!access_token) {
      toast.error('OAuth login failed. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    // Store tokens
    localStorage.setItem('access_token',  access_token)
    localStorage.setItem('refresh_token', refresh_token || '')

    // Fetch user profile to populate AuthContext
    authApi.getMe()
      .then(res => {
        // Force page reload so AuthContext picks up tokens from localStorage
        const home = getHomePath(res.data.role || role)
        window.location.replace(home)
      })
      .catch(() => {
        toast.error('Failed to load user profile. Please sign in again.')
        navigate('/login', { replace: true })
      })
  }, [])   // eslint-disable-line

  return <PageLoader />
}

export default OAuthCallback
