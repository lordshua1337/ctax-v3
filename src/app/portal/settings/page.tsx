'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Partner {
  first_name: string
  last_name: string
  company_name: string
  phone: string
  bio: string
  tier: string
  email: string
  created_at: string
}

export default function SettingsPage() {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    bio: '',
  })

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        if (data.partner) {
          setPartner(data.partner)
          setForm({
            firstName: data.partner.first_name || '',
            lastName: data.partner.last_name || '',
            companyName: data.partner.company_name || '',
            phone: data.partner.phone || '',
            bio: data.partner.bio || '',
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setMessage('Settings saved successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/auth'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            CTAX Portal
          </h1>
          <div className="flex gap-1">
            {[
              { href: '/portal/dashboard', label: 'Dashboard' },
              { href: '/portal/referrals', label: 'Referrals' },
              { href: '/portal/earnings', label: 'Earnings' },
              { href: '/portal/settings', label: 'Settings', active: true },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  link.active ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${
            message.includes('success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Account Info */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</div>
              <div className="text-zinc-300">{partner?.email}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Tier</div>
              <span className="text-xs px-2 py-1 rounded border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 uppercase font-semibold">
                {partner?.tier || 'starter'}
              </span>
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Member Since</div>
              <div className="text-zinc-300">{partner?.created_at ? new Date(partner.created_at).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Profile</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none h-24 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Sign Out */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-2">Session</h3>
          <p className="text-xs text-zinc-500 mb-4">Sign out of your account</p>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  )
}
