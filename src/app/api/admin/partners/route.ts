import { createServerSupabase, requireAdmin } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createServerSupabase()

    const { data: partners } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false })

    const allPartners = partners || []

    // Get referral counts and earnings per partner
    const enriched = await Promise.all(
      allPartners.map(async (p) => {
        const { count: referralCount } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', p.id)

        const { data: earnings } = await supabase
          .from('earnings')
          .select('amount')
          .eq('partner_id', p.id)

        const totalEarnings = (earnings || []).reduce(
          (sum: number, e: { amount: number }) => sum + Number(e.amount), 0
        )

        return {
          ...p,
          referral_count: referralCount || 0,
          total_earnings: totalEarnings,
        }
      })
    )

    return NextResponse.json({ partners: enriched })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load partners'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
