import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, BookOpen, Award, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Logo from '../components/common/Logo'

const QUALIFICATION_OPTIONS = [
  { value: '', label: 'Select qualification' },
  { value: 'BS', label: 'Bachelor\'s Degree (BS/BA)' },
  { value: 'MS', label: 'Master\'s Degree (MS/MA)' },
  { value: 'PhD', label: 'Doctorate (PhD)' },
]

const TeacherSignup = () => {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    qualification: '', experience: '',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.name.trim())         errs.name = 'Full name is required'
    if (!form.email)               errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password)            errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.qualification)       errs.qualification = 'Please select your qualification'
    if (!form.experience && form.experience !== 0)
      errs.experience = 'Years of experience is required'
    else if (Number(form.experience) < 0 || Number(form.experience) > 60)
      errs.experience = 'Enter a valid number of years (0–60)'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register({
        name:          form.name,
        email:         form.email,
        password:      form.password,
        role:          'INSTRUCTOR',
        qualification: form.qualification,
        experience:    Number(form.experience),
      })
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
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-500 relative overflow-hidden p-12 flex-col justify-between">
        <Logo size="lg" linkTo="/" />
        <div className="space-y-6">
          {[
            { icon: BookOpen, title: 'Share your expertise', desc: 'Teach students from around the world.' },
            { icon: Award,    title: 'Build your reputation', desc: 'Grow your professional profile.' },
            { icon: Briefcase,title: 'Earn from teaching',   desc: 'Monetize your knowledge and skills.' },
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

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo /></div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">Become an Instructor</h1>
            <p className="mt-2 text-gray-400">Create and share your courses with students worldwide.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic info */}
            <Input
              label="Full Name" type="text" placeholder="Dr. Jane Smith"
              leftIcon={<User size={18} />}
              value={form.name} onChange={setField('name')} error={errors.name} required
            />
            <Input
              label="Email Address" type="email" placeholder="you@example.com"
              leftIcon={<Mail size={18} />}
              value={form.email} onChange={setField('email')} error={errors.email} required
            />
            <Input
              label="Password" type="password" placeholder="Min. 8 characters"
              leftIcon={<Lock size={18} />}
              value={form.password} onChange={setField('password')} error={errors.password} required
            />
            <Input
              label="Confirm Password" type="password" placeholder="••••••••"
              leftIcon={<Lock size={18} />}
              value={form.confirmPassword} onChange={setField('confirmPassword')}
              error={errors.confirmPassword} required
            />

            {/* Instructor-specific fields */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Academic Background
              </p>

              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-sm font-medium text-ink-muted">
                  Highest Qualification <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.qualification}
                  onChange={setField('qualification')}
                  className={`w-full px-4 py-3 bg-surface-muted border rounded-xl text-ink
                    focus:outline-none focus:ring-2 focus:border-transparent transition-all
                    ${errors.qualification ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-brand-400'}`}
                >
                  {QUALIFICATION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.qualification && <p className="text-xs text-red-500">{errors.qualification}</p>}
              </div>

              <Input
                label="Years of Teaching Experience"
                type="number"
                placeholder="e.g., 5"
                leftIcon={<Briefcase size={18} />}
                value={form.experience}
                onChange={setField('experience')}
                error={errors.experience}
                required
                hint="Enter 0 if you are a first-time instructor"
              />
            </div>

            <Button loading={loading} type="submit" fullWidth size="lg">
              Create Instructor Account
            </Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign in</Link>
          </p>
          <p className="text-center text-gray-400 text-sm mt-2">
            Looking to learn?{' '}
            <Link to="/signup/student" className="text-brand-500 hover:text-brand-600 font-semibold">Student registration</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default TeacherSignup
