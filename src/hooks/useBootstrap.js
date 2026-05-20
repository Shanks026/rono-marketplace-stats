import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_PORTALS, DEFAULT_GOALS } from '@/lib/seedDefaults'

export function useBootstrap() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    async function seed() {
      // Check if portals already exist
      const { data: existing } = await supabase
        .from('portals')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (existing && existing.length > 0) return

      // Seed portals
      await supabase.from('portals').insert(
        DEFAULT_PORTALS.map((p) => ({ ...p, user_id: user.id }))
      )

      // Seed goals
      await supabase.from('goals').insert(
        DEFAULT_GOALS.map((g) => ({ ...g, user_id: user.id }))
      )
    }

    seed()
  }, [user])
}
