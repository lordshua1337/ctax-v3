'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Earning {
  id: string
  referral_id: string
  amount: number
  currency: string
  status: string
  created_at: string
  referral?: {
    client_name: string
    stage: string
  }
}

interface Payout {
  id: string
  amount: number
  status: string
  payment_method: string
  period_start: string
  period_end: string
  created_at: string
  sent_at: string | null
}

interface EarningsData {
  earnings: Earning[]
  payouts: Payout[]
  summary: {
    totalEarned: number
    pendingAmount: number
    paidAmount: number
  }
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'earnings' | 'payouts'>('earnings')

  useEffect(() => {
    fetch('/api/earnings')
      .then(r => r.json())
      .then(d => {
        setData(d)
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
              { href: '/portal/earnings', label: 'Earnings', active: true },
              { href: '/portal/settings', label: 'Settings' },
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
        <h2 className="text-2xl font-bold text-white mb-6">Earnings</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Earned</div>
            <div className="text-2xl font-bold text-cyan-400">${(data?.summary.totalEarned || 0).toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">${(data?.summary.pendingAmount || 0).toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Paid Out</div>
            <div className="text-2xl font-bold text-green-400">${(data?.summary.paidAmount || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('earnings')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              tab === 'earnings' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Commission History
          </button>
          <button
            onClick={() => setTab('payouts')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              tab === 'payouts' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Payouts
          </button>
        </div>

        {tab === 'earnings' && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <div className="divide-y divide-zinc-800/50">
              {data?.earnings && data.earnings.length > 0 ? (
                data.earnings.map(e => (
                  <div key={e.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">{e.referral?.client_name || 'Referral'}</div>
                      <div className="text-xs text-zinc-500">{new Date(e.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        e.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        e.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {e.status}
                      </span>
                      <span className="text-sm font-semibold text-white">${Number(e.amount).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-12 text-center">
                  <p className="text-zinc-500 text-sm">No earnings yet. Commissions are generated when referrals are resolved.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'payouts' && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <div className="divide-y divide-zinc-800/50">
              {data?.payouts && data.payouts.length > 0 ? (
                data.payouts.map(p => (
                  <div key={p.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">
                        Payout {p.period_start && p.period_end
                          ? `${new Date(p.period_start).toLocaleDateString()} - ${new Date(p.period_end).toLocaleDateString()}`
                          : new Date(p.created_at).toLocaleDateString()
                        }
                      </div>
                      <div className="text-xs text-zinc-500">
                        {p.payment_method || 'N/A'} {p.sent_at ? `-- Sent ${new Date(p.sent_at).toLocaleDateString()}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        p.status === 'sent' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {p.status}
                      </span>
                      <span className="text-sm font-semibold text-white">${Number(p.amount).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-12 text-center">
                  <p className="text-zinc-500 text-sm">No payouts yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
