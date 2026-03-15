import React, { useState } from 'react'
import { User, Mail, Shield, Bell, Palette, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import Avatar from '../../components/common/Avatar'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'

const TABS = [
  { id: 'profile',   label: 'Profile',        icon: User },
  { id: 'account',   label: 'Account',        icon: Shield },
  { id: 'notifs',    label: 'Notifications',  icon: Bell },
]

const SettingsPage = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and account preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="card p-4">
            {/* Avatar section */}
            <div className="flex flex-col items-center text-center p-4 mb-2 border-b border-gray-100">
              <Avatar name={user?.name} size="xl" className="mb-3" />
              <p className="font-semibold text-ink text-sm">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
              <Badge variant="success" size="sm" className="mt-2">{user?.role}</Badge>
            </div>

            <nav className="space-y-0.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${tab === id ? 'bg-brand-50 text-brand-600' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'}`}
                >
                  <Icon size={16} />
                  {label}
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
              <form onSubmit={handleSave} className="space-y-5 max-w-lg">
                <Input
                  label="Full Name"
                  leftIcon={<User size={16} />}
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                />
                <Input
                  label="Email Address"
                  type="email"
                  leftIcon={<Mail size={16} />}
                  value={profileForm.email}
                  onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink-muted">Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us a bit about yourself…"
                    value={profileForm.bio}
                    onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-muted border border-gray-200 rounded-xl text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                  />
                </div>
                <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {tab === 'account' && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-ink mb-4">Change Password</h2>
                <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="Min. 8 characters" />
                  <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                  <Button type="submit" loading={saving}>Update Password</Button>
                </form>
              </div>

              <div className="card p-6 border border-red-100">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="danger" size="sm">Delete Account</Button>
              </div>
            </div>
          )}

          {tab === 'notifs' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-ink mb-6">Notification Preferences</h2>
              <div className="space-y-4 max-w-lg">
                {[
                  { label: 'Assignment deadlines',       desc: 'Get reminded before assignments are due.' },
                  { label: 'New course announcements',   desc: 'Hear about new courses in your interests.' },
                  { label: 'Grade notifications',        desc: 'Be notified when your work is graded.' },
                  { label: 'Weekly progress digest',     desc: 'A weekly summary of your learning activity.' },
                ].map(({ label, desc }) => (
                  <label key={label} className="flex items-center justify-between gap-4 cursor-pointer group">
                    <div>
                      <p className="text-sm font-medium text-ink">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-brand-500 transition-colors" />
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                    </div>
                  </label>
                ))}
                <Button onClick={() => toast.success('Notification preferences saved!')} className="mt-4">
                  <Save size={16} /> Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
