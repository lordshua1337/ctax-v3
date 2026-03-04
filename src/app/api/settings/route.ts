import { createServerSupabase, requireUser } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const SettingsSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  companyName: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(2000).optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser()
    const supabase = await createServerSupabase()

    const body = await request.json()
    const validated = SettingsSchema.parse(body)

    const { error } = await supabase
      .from('partners')
      .update({
        first_name: validated.firstName || null,
        last_name: validated.lastName || null,
        company_name: validated.companyName || null,
        phone: validated.phone || null,
        bio: validated.bio || null,
        profile_complete: Boolean(validated.firstName && validated.lastName),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Settings update error:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Failed to update settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
