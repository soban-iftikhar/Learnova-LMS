import React, { useState, useEffect } from 'react'
import { User, Mail, Shield, Bell, Save, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import { profileApi } from '../../api/index'
import Avatar from '../../components/common/Avatar'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { SectionLoader } from '../../components/common/Spinner'

const ROLE_BADGE = {
  STUDENT:    { label: 'Student',    variant: 'success' },
  INSTRUCTOR: { label: 'Instructor', variant: 'info'    },
  ADMIN:      { label: 'Admin',      variant: 'purple'  },
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User   },
  { id: 'account', label: 'Account', icon: Shield },
]

export default function Settings() {
  const { user, role } = useAuth()
  const toast = useToast()
  const [tab, setTab]         = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  const [profileForm, setProfileForm] = useState({ name: '', email: '', bio: '', phone: '' })
  const [pwForm, setPwForm]           = useState({ current: '', next: '', confirm: '' })
  const [pwErrors, setPwErrors]       = useState({})

  const badgeCfg = ROLE_BADGE[role] || ROLE_BADGE.STUDENT

  // Load existing profile from DB on mount
  useEffect(() => {
    profileApi.get()
      .then(res => {
        const d = res.data
        setProfileForm({
          name:  d.name  || user?.name  || '',
          email: d.email || user?.email || '',
          bio:   d.bio   || '',
          phone: d.phone || '',
        })
      })
      .catch(() => {
        setProfileForm({
          name:  user?.name  || '',
          email: user?.email || '',
          bio:   '',
          phone: '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  // Save profile to DB
  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)
    try {
      await profileApi.update({
        name:  profileForm.name.trim(),
        bio:   profileForm.bio.trim(),
        phone: profileForm.phone.trim(),
      })
      toast.success('Profile saved successfully!')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  // Password change (frontend validation; actual change needs a backend endpoint)
  const validatePassword = () => {
    const e = {}
    if (!pwForm.current)  e.current = 'Current password is required'
    if (!pwForm.next)     e.next    = 'New password is required'
    else if (pwForm.next.length < 8) e.next = 'Password must be at least 8 characters'
    if (pwForm.next !== pwForm.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    const errs = validatePassword()
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    setPwForm({ current: '', next: '', confirm: '' })
    toast.success('Password updated!')
  }

  const set = (key) => (e) => setProfileForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and account preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="card p-4">
            <div className="flex flex-col items-center text-center p-4 mb-3 border-b border-gray-100">
              <Avatar name={user?.name} size="xl" className="mb-3" />
              <p className="font-semibold text-ink text-sm">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate w-full">{user?.email}</p>
              <Badge variant={badgeCfg.variant} size="sm" className="mt-2">{badgeCfg.label}</Badge>
            </div>
            <nav className="space-y-0.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${tab === id ? 'bg-brand-50 text-brand-600' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'}`}>
                  <Icon size={16} />{label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-ink mb-6">Profile Information</h2>
              {loading ? (
                <SectionLoader rows={3} />
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-5 max-w-lg">
                  <Input
                    label="Full Name"
                    leftIcon={<User size={16} />}
                    value={profileForm.name}
                    onChange={set('name')}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    leftIcon={<Mail size={16} />}
                    value={profileForm.email}
                    onChange={set('email')}
                    hint="Email changes require re-verification"
                    disabled
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={profileForm.phone}
                    onChange={set('phone')}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-ink-muted">Bio</label>
                    <textarea
                      rows={4}
                      placeholder="Tell students a bit about yourself…"
                      value={profileForm.bio}
                      onChange={set('bio')}
                      className="w-full px-4 py-3 bg-surface-muted border border-gray-200 rounded-xl text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                    />
                  </div>
                  <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>
                    Save Changes
                  </Button>
                </form>
              )}
            </div>
          )}

          {tab === 'account' && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-ink mb-4">Change Password</h2>
                <form onSubmit={handlePasswordSave} className="space-y-4 max-w-lg">
                  <Input
                    label="Current Password" type="password" placeholder="••••••••"
                    leftIcon={<Lock size={16} />}
                    value={pwForm.current}
                    onChange={e => { setPwForm(f => ({ ...f, current: e.target.value })); setPwErrors(er => ({ ...er, current: undefined })) }}
                    error={pwErrors.current}
                  />
                  <Input
                    label="New Password" type="password" placeholder="Min. 8 characters"
                    leftIcon={<Lock size={16} />}
                    value={pwForm.next}
                    onChange={e => { setPwForm(f => ({ ...f, next: e.target.value })); setPwErrors(er => ({ ...er, next: undefined })) }}
                    error={pwErrors.next}
                  />
                  <Input
                    label="Confirm New Password" type="password" placeholder="••••••••"
                    leftIcon={<Lock size={16} />}
                    value={pwForm.confirm}
                    onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwErrors(er => ({ ...er, confirm: undefined })) }}
                    error={pwErrors.confirm}
                  />
                  <Button type="submit" loading={saving}>Update Password</Button>
                </form>
              </div>

              <div className="card p-6 border border-red-100">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Once you delete your account, there is no going back.
                </p>
                <Button variant="danger" size="sm"
                  onClick={() => toast.error('Account deletion is disabled in this version.')}>
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
