import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component - ignore
          }
        },
      },
    }
  )
}

export async function getUser() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function getPartner() {
  const supabase = await createServerSupabase()
  const user = await requireUser()
  const { data } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return data
}

export async function requireAdmin() {
  const partner = await getPartner()
  if (!partner || partner.tier !== 'admin') {
    throw new Error('Forbidden: admin access only')
  }
  return partner
}
