'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AdminReferral {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  client_city: string
  client_state: string
  tax_debt_estimate: number
  issue_type: string
  stage: string
  commission_rate: number
  resolved_amount: number | null
  internal_notes: string
  case_notes: string
  created_at: string
  partner: {
    first_name: string
    last_name: string
    company_name: string
    email: string
    tier: string
  }
}

const STAGES = ['SUBMITTED', 'CONTACTED', 'INVESTIGATING', 'RESOLVING', 'RESOLVED', 'PAID', 'REJECTED']

const STAGE_COLORS: Record<string, string> = {
  SUBMITTED: 'border-blue-500 bg-blue-500/5',
  CONTACTED: 'border-yellow-500 bg-yellow-500/5',
  INVESTIGATING: 'border-orange-500 bg-orange-500/5',
  RESOLVING: 'border-purple-500 bg-purple-500/5',
  RESOLVED: 'border-green-500 bg-green-500/5',
  PAID: 'border-emerald-500 bg-emerald-500/5',
  REJECTED: 'border-red-500 bg-red-500/5',
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<AdminReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReferrals()
  }, [])

  async function loadReferrals() {
    try {
      const res = await fetch('/api/admin/referrals')
      if (res.status === 403) throw new Error('Access denied')
      const data = await res.json()
      setReferrals(data.referrals || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  async function updateStage(referralId: string, newStage: string) {
    setUpdating(referralId)
    try {
      const res = await fetch(`/api/admin/referrals/${referralId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, stage: newStage } : r))
    } catch {
      setError('Failed to update stage')
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

  // Group by stage for Kanban
  const byStage = STAGES.reduce((acc, stage) => {
    acc[stage] = referrals.filter(r => r.stage === stage)
    return acc
  }, {} as Record<string, AdminReferral[]>)

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
              { href: '/admin/referrals', label: 'Referrals', active: true },
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
      </nav>

      <main className="max-w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Referral Pipeline</h2>
          <div className="text-sm text-zinc-500">{referrals.length} total</div>
        </div>

        {error && error !== 'Access denied' && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <div key={stage} className={`flex-shrink-0 w-72 border-t-2 ${STAGE_COLORS[stage]} rounded-xl`}>
              <div className="px-4 py-3 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{stage}</span>
                  <span className="text-xs text-zinc-500">{byStage[stage]?.length || 0}</span>
                </div>
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {byStage[stage]?.map(ref => (
                  <div key={ref.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-white mb-1">{ref.client_name}</div>
                    <div className="text-xs text-zinc-500 mb-2">
                      {ref.partner?.company_name || ref.partner?.email || 'Unknown partner'}
                    </div>
                    {ref.tax_debt_estimate && (
                      <div className="text-xs text-cyan-400 mb-2">
                        ${Number(ref.tax_debt_estimate).toLocaleString()} est.
                      </div>
                    )}
                    {ref.issue_type && (
                      <div className="text-xs text-zinc-600 mb-2">{ref.issue_type}</div>
                    )}
                    <div className="text-xs text-zinc-600 mb-3">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </div>
                    <select
                      value={ref.stage}
                      onChange={e => updateStage(ref.id, e.target.value)}
                      disabled={updating === ref.id}
                      className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
