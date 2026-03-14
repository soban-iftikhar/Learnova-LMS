import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Logo from '../components/common/Logo'

const OAUTH_URL = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`

const LoginPage = () => {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.error || 'Invalid email or password'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-400 relative overflow-hidden p-12 flex-col justify-between">
        <div>
          <Logo size="lg" linkTo="/" />
        </div>
        <div>
          <blockquote className="text-white/90 text-2xl font-light leading-relaxed mb-6">
            "The beautiful thing about learning is that no one can take it away from you."
          </blockquote>
          <cite className="text-white/60 text-sm">— B.B. King</cite>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-1/4 w-64 h-64 rounded-full bg-white/5" />

        {/* Stats */}
        <div className="flex gap-8">
          {[['10k+', 'Learners'], ['200+', 'Courses'], ['50+', 'Instructors']].map(([num, lbl]) => (
            <div key={lbl}>
              <p className="text-white text-2xl font-bold">{num}</p>
              <p className="text-white/60 text-sm">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">Welcome back</h1>
            <p className="mt-2 text-gray-400">Sign in to continue your learning journey.</p>
          </div>

          {/* Google OAuth */}
          <a
            href={OAUTH_URL}
            className="flex items-center justify-center gap-3 w-full px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-ink hover:bg-surface-muted transition-colors mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-surface text-xs text-gray-400">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              error={errors.password}
              required
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-500 hover:text-brand-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" rightIcon={<ArrowRight size={18} />}>
              Sign In
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-500 font-medium hover:text-brand-600 transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
