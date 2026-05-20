import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useInstances() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: instances = [], isLoading } = useQuery({
    queryKey: ['instances', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('instances')
        .insert({ ...data, user_id: user.id })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instances'] }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase
        .from('instances')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instances'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('instances').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instances'] }),
  })

  return {
    instances,
    isLoading,
    createInstance: (data) => createMutation.mutateAsync(data),
    updateInstance: (id, data) => updateMutation.mutateAsync({ id, ...data }),
    deleteInstance: (id) => deleteMutation.mutateAsync(id),
  }
}
