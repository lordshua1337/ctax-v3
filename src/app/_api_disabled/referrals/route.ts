import { createServerSupabase, requireUser } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ReferralSchema = z.object({
  clientName: z.string().min(2).max(100),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().min(10).max(20).optional(),
  clientCity: z.string().max(100).optional(),
  clientState: z.string().max(2).optional(),
  taxDebtEstimate: z.number().min(0).max(10000000).optional(),
  issueType: z.string().max(100).optional(),
  yearsAffected: z.number().int().min(0).max(50).optional(),
  irsNotices: z.boolean().optional(),
  caseNotes: z.string().max(2000).optional(),
})

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

    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ referrals: referrals || [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load referrals'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const supabase = await createServerSupabase()

    const { data: partner } = await supabase
      .from('partners')
      .select('id, tier')
      .eq('user_id', user.id)
      .single()

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    const body = await request.json()
    const validated = ReferralSchema.parse(body)

    // Determine commission rate from tier
    const rateMap: Record<string, number> = {
      starter: 8.0,
      connector: 10.0,
      builder: 13.0,
      rainmaker: 18.0,
      admin: 18.0,
    }
    const commissionRate = rateMap[partner.tier] || 8.0

    const { data: referral, error } = await supabase
      .from('referrals')
      .insert({
        partner_id: partner.id,
        client_name: validated.clientName,
        client_email: validated.clientEmail || null,
        client_phone: validated.clientPhone || null,
        client_city: validated.clientCity || null,
        client_state: validated.clientState || null,
        tax_debt_estimate: validated.taxDebtEstimate || null,
        issue_type: validated.issueType || null,
        years_affected: validated.yearsAffected || null,
        irs_notices: validated.irsNotices || false,
        case_notes: validated.caseNotes || null,
        commission_rate: commissionRate,
        stage: 'SUBMITTED',
      })
      .select()
      .single()

    if (error) {
      console.error('Referral insert error:', error)
      return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 })
    }

    return NextResponse.json({ referral }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Failed to create referral'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
