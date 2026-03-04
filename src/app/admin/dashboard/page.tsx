'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AdminStats {
  totalPartners: number
  activePartners: number
  totalReferrals: number
  referralsByStage: Record<string, number>
  totalEarnings: number
  pendingPayouts: number
  recentActivity: Array<{
    id: string
    action: string
    target_type: string
    details: Record<string, unknown>
    created_at: string
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => {
        if (r.status === 403) throw new Error('Access denied')
        return r.json()
      })
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">{error}</div>
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
              { href: '/admin/dashboard', label: 'Overview', active: true },
              { href: '/admin/referrals', label: 'Referrals' },
              { href: '/admin/partners', label: 'Partners' },
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
        <Link href="/portal/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300">
          Partner Portal
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Overview</h2>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Partners</div>
            <div className="text-2xl font-bold text-white">{stats?.totalPartners || 0}</div>
            <div className="text-xs text-zinc-600 mt-1">{stats?.activePartners || 0} active</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Referrals</div>
            <div className="text-2xl font-bold text-cyan-400">{stats?.totalReferrals || 0}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Earnings</div>
            <div className="text-2xl font-bold text-green-400">${(stats?.totalEarnings || 0).toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Pending Payouts</div>
            <div className="text-2xl font-bold text-yellow-400">${(stats?.pendingPayouts || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Pipeline Breakdown */}
        {stats?.referralsByStage && Object.keys(stats.referralsByStage).length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 mb-8">
            <h3 className="text-sm font-semibold text-white mb-4">Pipeline Breakdown</h3>
            <div className="flex gap-4">
              {Object.entries(stats.referralsByStage).map(([stage, count]) => (
                <div key={stage} className="flex-1 text-center">
                  <div className="text-lg font-bold text-white">{count}</div>
                  <div className="text-xs text-zinc-500">{stage}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Recent Admin Activity</h3>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map(log => (
                <div key={log.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">{log.action}</div>
                    <div className="text-xs text-zinc-500">{log.target_type}</div>
                  </div>
                  <div className="text-xs text-zinc-600">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
