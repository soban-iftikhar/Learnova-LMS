import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, BookOpen, User, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Logo from '../components/common/Logo'

const TeacherSignup = () => {
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
      await register({ name: form.name, email: form.email, password: form.password, role: 'INSTRUCTOR' })
      toast.success('Instructor account created! Please sign in.')
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-500 relative overflow-hidden p-12 flex-col justify-between">
        <Logo size="lg" linkTo="/" />
        <div className="space-y-6">
          {[
            { icon: BookOpen, title: 'Share your expertise', desc: 'Teach students from around the world and make an impact.' },
            { icon: Award, title: 'Build your reputation', desc: 'Grow your professional profile and showcase your teaching skills.' },
            { icon: ArrowRight, title: 'Earn money', desc: 'Monetize your knowledge and build a stable income stream.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/70 text-sm mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute bottom-20 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <p className="text-white/40 text-xs">© {new Date().getFullYear()} Learnova</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo /></div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">Become an Instructor</h1>
            <p className="mt-2 text-gray-400">Create and share your courses with students worldwide.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={setField('name')}
              error={errors.name}
              leftIcon={User}
            />
            <Input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={setField('email')}
              error={errors.email}
              leftIcon={Mail}
            />
            <Input
              type="password"
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChange={setField('password')}
              error={errors.password}
              leftIcon={Lock}
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={setField('confirmPassword')}
              error={errors.confirmPassword}
              leftIcon={Lock}
            />
            <Button loading={loading} type="submit" className="w-full">
              Become an Instructor
            </Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign in</Link>
          </p>
          <p className="text-center text-gray-400 text-sm mt-3">
            Looking to learn? <Link to="/signup/student" className="text-brand-500 hover:text-brand-600 font-semibold">Student registration</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default TeacherSignup
