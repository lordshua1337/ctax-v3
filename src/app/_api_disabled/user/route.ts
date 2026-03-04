import { createServerSupabase } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: partner } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ user, partner })
  } catch {
    return NextResponse.json({ error: 'Failed to load user' }, { status: 500 })
  }
}
