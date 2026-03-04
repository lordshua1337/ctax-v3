'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Referral {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  client_city: string
  client_state: string
  tax_debt_estimate: number
  issue_type: string
  years_affected: number
  irs_notices: boolean
  stage: string
  case_notes: string
  commission_rate: number
  created_at: string
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

const ISSUE_TYPES = [
  'Back Taxes',
  'IRS Wage Levy',
  'Offer in Compromise',
  'Tax Lien',
  'Unfiled Returns',
  'Audit Representation',
  'Penalty Abatement',
  'Other',
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('ALL')

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCity: '',
    clientState: '',
    taxDebtEstimate: '',
    issueType: '',
    yearsAffected: '',
    irsNotices: false,
    caseNotes: '',
  })

  useEffect(() => {
    loadReferrals()
  }, [])

  async function loadReferrals() {
    try {
      const res = await fetch('/api/referrals')
      const data = await res.json()
      setReferrals(data.referrals || [])
    } catch {
      setError('Failed to load referrals')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName,
          clientEmail: form.clientEmail || undefined,
          clientPhone: form.clientPhone || undefined,
          clientCity: form.clientCity || undefined,
          clientState: form.clientState || undefined,
          taxDebtEstimate: form.taxDebtEstimate ? Number(form.taxDebtEstimate) : undefined,
          issueType: form.issueType || undefined,
          yearsAffected: form.yearsAffected ? Number(form.yearsAffected) : undefined,
          irsNotices: form.irsNotices,
          caseNotes: form.caseNotes || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit referral')
      }

      setSuccess('Referral submitted successfully')
      setShowForm(false)
      setForm({
        clientName: '', clientEmail: '', clientPhone: '', clientCity: '',
        clientState: '', taxDebtEstimate: '', issueType: '', yearsAffected: '',
        irsNotices: false, caseNotes: '',
      })
      loadReferrals()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit referral')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filter === 'ALL' ? referrals : referrals.filter(r => r.stage === filter)

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
              { href: '/portal/referrals', label: 'Referrals', active: true },
              { href: '/portal/earnings', label: 'Earnings' },
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Referrals</h2>
            <p className="text-zinc-500 text-sm mt-1">{referrals.length} total referrals</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-colors"
          >
            {showForm ? 'Cancel' : 'New Referral'}
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Submit New Referral</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={form.clientName}
                  onChange={e => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.clientPhone}
                  onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">City</label>
                <input
                  type="text"
                  value={form.clientCity}
                  onChange={e => setForm({ ...form, clientCity: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">State</label>
                <select
                  value={form.clientState}
                  onChange={e => setForm({ ...form, clientState: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Estimated Tax Debt</label>
                <input
                  type="number"
                  value={form.taxDebtEstimate}
                  onChange={e => setForm({ ...form, taxDebtEstimate: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="$0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Issue Type</label>
                <select
                  value={form.issueType}
                  onChange={e => setForm({ ...form, issueType: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Select type</option>
                  {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Years Affected</label>
                <input
                  type="number"
                  value={form.yearsAffected}
                  onChange={e => setForm({ ...form, yearsAffected: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="0"
                  min="0"
                  max="50"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="irsNotices"
                  checked={form.irsNotices}
                  onChange={e => setForm({ ...form, irsNotices: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500"
                />
                <label htmlFor="irsNotices" className="text-sm text-zinc-400">Client has received IRS notices</label>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Case Notes</label>
                <textarea
                  value={form.caseNotes}
                  onChange={e => setForm({ ...form, caseNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none h-24 resize-none"
                  placeholder="Additional context about this referral..."
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Referral'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['ALL', 'SUBMITTED', 'CONTACTED', 'INVESTIGATING', 'RESOLVING', 'RESOLVED', 'PAID', 'REJECTED'].map(stage => (
            <button
              key={stage}
              onClick={() => setFilter(stage)}
              className={`px-3 py-1.5 text-xs rounded-md border whitespace-nowrap transition-colors ${
                filter === stage
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {stage} {stage === 'ALL' ? `(${referrals.length})` : `(${referrals.filter(r => r.stage === stage).length})`}
            </button>
          ))}
        </div>

        {/* Referral List */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <div className="divide-y divide-zinc-800/50">
            {filtered.length > 0 ? (
              filtered.map(ref => (
                <div key={ref.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-white">{ref.client_name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded border ${STAGE_COLORS[ref.stage] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                        {ref.stage}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {ref.tax_debt_estimate && (
                        <span className="text-xs text-zinc-500">${Number(ref.tax_debt_estimate).toLocaleString()} est. debt</span>
                      )}
                      {ref.issue_type && (
                        <span className="text-xs text-zinc-500">{ref.issue_type}</span>
                      )}
                      {ref.client_city && ref.client_state && (
                        <span className="text-xs text-zinc-500">{ref.client_city}, {ref.client_state}</span>
                      )}
                      <span className="text-xs text-zinc-600">{new Date(ref.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-600">{ref.commission_rate}% rate</div>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-zinc-500 text-sm">
                  {filter === 'ALL' ? 'No referrals yet. Submit your first referral to get started.' : `No referrals with stage "${filter}".`}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
