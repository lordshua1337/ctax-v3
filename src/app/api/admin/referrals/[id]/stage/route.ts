import { createServerSupabase, requireAdmin, getPartner } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const StageSchema = z.object({
  stage: z.enum(['SUBMITTED', 'CONTACTED', 'INVESTIGATING', 'RESOLVING', 'RESOLVED', 'PAID', 'REJECTED']),
  resolvedAmount: z.number().min(0).optional(),
  internalNotes: z.string().max(2000).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createServerSupabase()
    const partner = await getPartner()
    const { id } = await params

    const body = await request.json()
    const validated = StageSchema.parse(body)

    const updateData: Record<string, unknown> = {
      stage: validated.stage,
      updated_at: new Date().toISOString(),
    }

    if (validated.resolvedAmount !== undefined) {
      updateData.resolved_amount = validated.resolvedAmount
    }
    if (validated.internalNotes !== undefined) {
      updateData.internal_notes = validated.internalNotes
    }
    if (validated.stage === 'RESOLVED') {
      updateData.resolved_at = new Date().toISOString()
    }
    if (validated.stage === 'PAID') {
      updateData.paid_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('referrals')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Stage update error:', error)
      return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 })
    }

    // Log admin action
    if (partner) {
      await supabase.from('admin_logs').insert({
        admin_id: partner.id,
        action: 'update_referral_stage',
        target_type: 'referral',
        target_id: id,
        details: { new_stage: validated.stage },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Failed to update stage'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
