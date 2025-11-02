'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function updateUserAction(updateData: {
  id: string
  display_name?: string
  role?: string
}) {
  try {
    const cookieStore = await cookies()

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

    // 🧠 Sanity check
    if (!updateData.id) {
      return { success: false, error: 'User ID is required.' }
    }

    // ⚙️ Perform update
    const { error } = await supabase
      .from('users')
      .update({
        display_name: updateData.display_name || null,
        role: updateData.role || undefined,
      })
      .eq('id', updateData.id)

    if (error) {
      console.error('❌ Update error:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ User updated: ID=${updateData.id}`)
    return { success: true }
  } catch (err: any) {
    console.error('🔥 Unexpected server error:', err)
    return { success: false, error: err.message || 'Unknown server error' }
  }
}
