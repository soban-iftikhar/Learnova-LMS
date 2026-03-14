import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowRight, GraduationCap, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Logo from '../components/common/Logo'

const SignupPage = () => {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const setField = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors(er => ({ ...er, [key]: undefined }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ink to-ink-soft relative overflow-hidden p-12 flex-col justify-between">
        <Logo size="lg" linkTo="/" />

        <div className="space-y-6">
          {[
            { icon: GraduationCap, title: 'Learn at your own pace', desc: 'Access courses anytime, anywhere, on any device.' },
            { icon: BookOpen, title: 'Expert-led content', desc: 'Learn from industry professionals and certified instructors.' },
            { icon: ArrowRight, title: 'Track your progress', desc: 'Visual dashboards and analytics keep you on track.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={20} className="text-brand-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/50 text-sm mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-500/10" />
        <div className="absolute bottom-20 -right-10 w-48 h-48 rounded-full bg-brand-500/10" />

        <p className="text-white/30 text-xs">© {new Date().getFullYear()} Learnova</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo /></div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">Create your account</h1>
            <p className="mt-2 text-gray-400">Start learning for free. No credit card required.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'STUDENT', label: 'Student', desc: 'I want to learn', icon: GraduationCap },
              { value: 'INSTRUCTOR', label: 'Instructor', desc: 'I want to teach', icon: BookOpen },
            ].map(({ value, label, desc, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: value }))}
                className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all
                  ${form.role === value
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <Icon size={20} className={form.role === value ? 'text-brand-500' : 'text-gray-400'} />
                <span className={`text-sm font-semibold ${form.role === value ? 'text-brand-700' : 'text-ink'}`}>{label}</span>
                <span className="text-xs text-gray-400">{desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              placeholder="John Doe"
              leftIcon={<User size={16} />}
              value={form.name}
              onChange={setField('name')}
              error={errors.name}
              required
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              value={form.email}
              onChange={setField('email')}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              leftIcon={<Lock size={16} />}
              value={form.password}
              onChange={setField('password')}
              error={errors.password}
              required
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              value={form.confirmPassword}
              onChange={setField('confirmPassword')}
              error={errors.confirmPassword}
              required
            />

            <p className="text-xs text-gray-400">
              By signing up, you agree to our{' '}
              <Link to="#" className="text-brand-500 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="#" className="text-brand-500 hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" fullWidth loading={loading} size="lg" rightIcon={<ArrowRight size={18} />}>
              Create Account
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-medium hover:text-brand-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
