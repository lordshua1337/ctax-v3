import { createServerSupabase, requireAdmin } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createServerSupabase()

    const { data: referrals } = await supabase
      .from('referrals')
      .select('*, partner:partners(first_name, last_name, company_name, email, tier)')
      .order('created_at', { ascending: false })

    return NextResponse.json({ referrals: referrals || [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load referrals'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
