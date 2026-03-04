import { createServerSupabase, requireUser } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await requireUser()
    const supabase = await createServerSupabase()

    const { data: partner } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    const { data: earnings } = await supabase
      .from('earnings')
      .select('*, referral:referrals(client_name, stage)')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    const { data: payouts } = await supabase
      .from('payouts')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    const allEarnings = earnings || []
    const allPayouts = payouts || []

    const summary = {
      totalEarned: allEarnings.reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0),
      pendingAmount: allEarnings
        .filter((e: { status: string }) => e.status === 'pending')
        .reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0),
      paidAmount: allPayouts
        .filter((p: { status: string }) => p.status === 'sent')
        .reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0),
    }

    return NextResponse.json({ earnings: allEarnings, payouts: allPayouts, summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load earnings'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
