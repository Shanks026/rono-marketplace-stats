import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/context/AuthContext'

export function useAuth() {
  const ctx = useAuthContext()

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password, fullName) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return { ...ctx, signIn, signUp, resetPassword }
}
