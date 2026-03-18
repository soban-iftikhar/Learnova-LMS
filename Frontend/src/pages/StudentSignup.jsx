import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, GraduationCap, BookOpen, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Logo from '../components/common/Logo'

const StudentSignup = () => {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
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
      await register({ name: form.name, email: form.email, password: form.password, role: 'STUDENT' })
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ink to-ink-soft relative overflow-hidden p-12 flex-col justify-between">
        <Logo size="lg" linkTo="/" textWhite />
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
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-500/10" />
        <div className="absolute bottom-20 -right-10 w-48 h-48 rounded-full bg-brand-500/10" />
        <p className="text-white/30 text-xs">© {new Date().getFullYear()} Learnova</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo /></div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">Student Registration</h1>
            <p className="mt-2 text-gray-400">Start learning for free. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={setField('name')}
              error={errors.name}
              leftIcon={<User size={18} />}
            />
            <Input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={setField('email')}
              error={errors.email}
              leftIcon={<Mail size={18} />}
            />
            <Input
              type="password"
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChange={setField('password')}
              error={errors.password}
              leftIcon={<Lock size={18} />}
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={setField('confirmPassword')}
              error={errors.confirmPassword}
              leftIcon={<Lock size={18} />}
            />
            <Button loading={loading} type="submit" className="w-full">
              Create Student Account
            </Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign in</Link>
          </p>
          <p className="text-center text-gray-400 text-sm mt-3">
            Want to teach? <Link to="/signup/teacher" className="text-brand-500 hover:text-brand-600 font-semibold">Become an instructor</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default StudentSignup
