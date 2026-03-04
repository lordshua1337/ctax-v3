'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardStats {
  totalReferrals: number
  activeReferrals: number
  resolvedReferrals: number
  totalEarnings: number
  pendingEarnings: number
  recentReferrals: Array<{
    id: string
    client_name: string
    stage: string
    tax_debt_estimate: number
    created_at: string
  }>
}

interface Partner {
  first_name: string
  last_name: string
  company_name: string
  tier: string
  email: string
}

const STAGE_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CONTACTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  INVESTIGATING: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  RESOLVING: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  RESOLVED: 'bg-green-500/10 text-green-400 border-green-500/20',
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setPartner(data.partner)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const displayName = partner?.first_name || partner?.company_name || partner?.email?.split('@')[0] || 'Partner'

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            CTAX Portal
          </h1>
          <div className="flex gap-1">
            {[
              { href: '/portal/dashboard', label: 'Dashboard', active: true },
              { href: '/portal/referrals', label: 'Referrals' },
              { href: '/portal/earnings', label: 'Earnings' },
              { href: '/portal/settings', label: 'Settings' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  link.active
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 uppercase font-semibold">
            {partner?.tier || 'Starter'}
          </span>
          <span className="text-sm text-zinc-400">{displayName}</span>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Welcome back, {displayName}</h2>
          <p className="text-zinc-500 text-sm mt-1">Here is your referral pipeline overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Referrals', value: stats?.totalReferrals || 0, color: 'text-white' },
            { label: 'Active Pipeline', value: stats?.activeReferrals || 0, color: 'text-yellow-400' },
            { label: 'Resolved', value: stats?.resolvedReferrals || 0, color: 'text-green-400' },
            { label: 'Total Earned', value: `$${(stats?.totalEarnings || 0).toLocaleString()}`, color: 'text-cyan-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link
            href="/portal/referrals"
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-500/40 transition-colors group"
          >
            <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">Submit New Referral</div>
            <div className="text-xs text-zinc-500 mt-1">Add a client to your pipeline</div>
          </Link>
          <Link
            href="/portal/earnings"
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group"
          >
            <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">View Earnings</div>
            <div className="text-xs text-zinc-500 mt-1">Track commissions and payouts</div>
          </Link>
          <Link
            href="/portal/settings"
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group"
          >
            <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">Profile Settings</div>
            <div className="text-xs text-zinc-500 mt-1">Update your information</div>
          </Link>
        </div>

        {/* Recent Referrals */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Referrals</h3>
            <Link href="/portal/referrals" className="text-xs text-cyan-400 hover:text-cyan-300">
              View All
            </Link>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {stats?.recentReferrals && stats.recentReferrals.length > 0 ? (
              stats.recentReferrals.map(ref => (
                <div key={ref.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">{ref.client_name}</div>
                    <div className="text-xs text-zinc-500">
                      {ref.tax_debt_estimate ? `$${Number(ref.tax_debt_estimate).toLocaleString()} est. debt` : 'Debt TBD'} -- {new Date(ref.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${STAGE_COLORS[ref.stage] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    {ref.stage}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-500 text-sm">No referrals yet. Submit your first referral to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Earnings Banner */}
        {stats && stats.pendingEarnings > 0 && (
          <div className="mt-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-emerald-400">Pending Earnings</div>
              <div className="text-xs text-zinc-400">Commissions awaiting payout</div>
            </div>
            <div className="text-xl font-bold text-emerald-400">
              ${stats.pendingEarnings.toLocaleString()}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
