import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useInstances() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: instances = [], isLoading } = useQuery({
    queryKey: ['instances'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instances')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('instances-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'instances' },
        () => qc.invalidateQueries({ queryKey: ['instances'] }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, qc])

  function getUserName() {
    return user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Unknown'
  }

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const createdByName = getUserName()
      const { error } = await supabase
        .from('instances')
        .insert({ ...data, user_id: user.id, created_by_name: createdByName })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instances'] }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase
        .from('instances')
        .update({ ...data, updated_at: new Date().toISOString(), updated_by_name: getUserName() })
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
