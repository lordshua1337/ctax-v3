'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AdminPartner {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name: string
  tier: string
  status: string
  profile_complete: boolean
  created_at: string
  referral_count: number
  total_earnings: number
}

const TIERS = ['starter', 'connector', 'builder', 'rainmaker', 'admin']

const TIER_COLORS: Record<string, string> = {
  starter: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  connector: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  builder: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  rainmaker: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  admin: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<AdminPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPartners()
  }, [])

  async function loadPartners() {
    try {
      const res = await fetch('/api/admin/partners')
      if (res.status === 403) throw new Error('Access denied')
      const data = await res.json()
      setPartners(data.partners || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  async function updateTier(partnerId: string, newTier: string) {
    setUpdating(partnerId)
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, tier: newTier } : p))
    } catch {
      setError('Failed to update tier')
      setTimeout(() => setError(''), 3000)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error === 'Access denied') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Access denied. Admin only.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            CTAX Admin
          </h1>
          <div className="flex gap-1">
            {[
              { href: '/admin/dashboard', label: 'Overview' },
              { href: '/admin/referrals', label: 'Referrals' },
              { href: '/admin/partners', label: 'Partners', active: true },
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Partners</h2>
          <div className="text-sm text-zinc-500">{partners.length} total</div>
        </div>

        {error && error !== 'Access denied' && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-3 text-left text-xs text-zinc-500 uppercase tracking-wider">Partner</th>
                <th className="px-5 py-3 text-left text-xs text-zinc-500 uppercase tracking-wider">Tier</th>
                <th className="px-5 py-3 text-left text-xs text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs text-zinc-500 uppercase tracking-wider">Referrals</th>
                <th className="px-5 py-3 text-left text-xs text-zinc-500 uppercase tracking-wider">Earnings</th>
                <th className="px-5 py-3 text-left text-xs text-zinc-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {partners.map(p => (
                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="text-sm text-white">
                      {p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.email}
                    </div>
                    {p.company_name && <div className="text-xs text-zinc-500">{p.company_name}</div>}
                    <div className="text-xs text-zinc-600">{p.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={p.tier}
                      onChange={e => updateTier(p.id, e.target.value)}
                      disabled={updating === p.id}
                      className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                    >
                      {TIERS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      p.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{p.referral_count}</td>
                  <td className="px-5 py-4 text-sm text-cyan-400">${(p.total_earnings || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs text-zinc-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
