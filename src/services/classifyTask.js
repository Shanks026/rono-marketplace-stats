import { supabase } from '@/lib/supabase'

/**
 * Calls the classify-task edge function via supabase.functions.invoke
 * which automatically handles JWT auth.
 */
export async function classifyTask(rawInput, goals, portals) {
  const { data, error } = await supabase.functions.invoke('classify-task', {
    body: { raw_input: rawInput, goals, portals },
  })

  if (error) throw new Error(error.message || 'Classification failed')

  return data
}
