import { createServerSupabase, requireAdmin } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createServerSupabase()

    const { data: partners } = await supabase.from('partners').select('id, status')
    const { data: referrals } = await supabase.from('referrals').select('id, stage')
    const { data: earnings } = await supabase.from('earnings').select('amount, status')
    const { data: logs } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    const allPartners = partners || []
    const allReferrals = referrals || []
    const allEarnings = earnings || []

    const referralsByStage: Record<string, number> = {}
    for (const r of allReferrals) {
      referralsByStage[r.stage] = (referralsByStage[r.stage] || 0) + 1
    }

    return NextResponse.json({
      totalPartners: allPartners.length,
      activePartners: allPartners.filter(p => p.status === 'active').length,
      totalReferrals: allReferrals.length,
      referralsByStage,
      totalEarnings: allEarnings.reduce((sum, e) => sum + Number(e.amount), 0),
      pendingPayouts: allEarnings
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + Number(e.amount), 0),
      recentActivity: logs || [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load admin dashboard'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
