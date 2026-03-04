import { createServerSupabase, requireAdmin, getPartner } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const UpdatePartnerSchema = z.object({
  tier: z.enum(['starter', 'connector', 'builder', 'rainmaker', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createServerSupabase()
    const adminPartner = await getPartner()
    const { id } = await params

    const body = await request.json()
    const validated = UpdatePartnerSchema.parse(body)

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (validated.tier) updateData.tier = validated.tier
    if (validated.status) updateData.status = validated.status

    const { error } = await supabase
      .from('partners')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Partner update error:', error)
      return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 })
    }

    if (adminPartner) {
      await supabase.from('admin_logs').insert({
        admin_id: adminPartner.id,
        action: 'update_partner',
        target_type: 'partner',
        target_id: id,
        details: validated,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Failed to update partner'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
