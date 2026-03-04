import { createServerSupabase } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createServerSupabase()
    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }
}
