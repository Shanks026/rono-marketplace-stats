import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function usePortals() {
  const { user } = useAuth()
  const qc = useQueryClient()

  function getUserName() {
    return user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Unknown'
  }

  const { data: portals = [], isLoading } = useQuery({
    queryKey: ['portals'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portals')
        .select('*')
        .order('order_index')
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('portals-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portals' },
        () => qc.invalidateQueries({ queryKey: ['portals'] }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, qc])

  const { data: instanceCounts = {} } = useQuery({
    queryKey: ['portal-instance-counts'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instance_portals')
        .select('name, instance_id')
      if (error) throw error
      const sets = {}
      data.forEach(({ name, instance_id }) => {
        if (!sets[name]) sets[name] = new Set()
        sets[name].add(instance_id)
      })
      const counts = {}
      Object.keys(sets).forEach(name => { counts[name] = sets[name].size })
      return counts
    },
  })

  const createPortal = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('portals').insert({
        ...data,
        user_id: user.id,
        created_by_name: getUserName(),
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portals'] }),
  })

  const updatePortal = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase.from('portals').update({
        ...data,
        updated_by_name: getUserName(),
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portals'] }),
  })

  const deletePortal = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('portals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portals'] }),
  })

  return {
    portals,
    instanceCounts,
    isLoading,
    createPortal: (data) => createPortal.mutateAsync(data),
    updatePortal: (id, data) => updatePortal.mutateAsync({ id, ...data }),
    deletePortal: (id) => deletePortal.mutateAsync(id),
  }
}
