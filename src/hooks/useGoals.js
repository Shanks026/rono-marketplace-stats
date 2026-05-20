import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentQuarter } from '@/lib/quarter'

export function useGoals(quarter = getCurrentQuarter()) {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', user?.id, quarter],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('quarter', quarter)
        .order('order_index')
      if (error) throw error
      return data
    },
  })

  const createGoal = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('goals').insert({ ...data, user_id: user.id })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase.from('goals').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const deleteGoal = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  return {
    goals,
    isLoading,
    createGoal: (data) => createGoal.mutateAsync(data),
    updateGoal: (id, data) => updateGoal.mutateAsync({ id, ...data }),
    deleteGoal: (id) => deleteGoal.mutateAsync(id),
  }
}
