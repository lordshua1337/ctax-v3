import { createServerSupabase, requireUser } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await requireUser()
    const supabase = await createServerSupabase()

    const { data: partner } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Fetch referrals
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    // Fetch earnings
    const { data: earnings } = await supabase
      .from('earnings')
      .select('*')
      .eq('partner_id', partner.id)

    // Calculate stats
    const allReferrals = referrals || []
    const allEarnings = earnings || []

    const stats = {
      totalReferrals: allReferrals.length,
      activeReferrals: allReferrals.filter(r => !['RESOLVED', 'PAID', 'REJECTED'].includes(r.stage)).length,
      resolvedReferrals: allReferrals.filter(r => r.stage === 'RESOLVED' || r.stage === 'PAID').length,
      totalEarnings: allEarnings.reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0),
      pendingEarnings: allEarnings.filter((e: { status: string }) => e.status === 'pending').reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0),
      recentReferrals: allReferrals.slice(0, 5),
    }

    return NextResponse.json({ partner, stats })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load dashboard'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
