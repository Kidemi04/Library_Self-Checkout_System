'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function deleteUserAction(id: string) {
  try {
    // 🧩 Access the cookies (required for SSR auth)
    const cookieStore = await cookies()

    // 🧠 Create Supabase client with cookie-based session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    )

    // 🗑️ Perform delete
    const { error } = await supabase.from('users').delete().eq('id', id)

    if (error) {
      console.error('❌ Server delete error:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ User deleted successfully: ID = ${id}`)
    return { success: true }
  } catch (err: any) {
    console.error('🔥 Unexpected server error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}
