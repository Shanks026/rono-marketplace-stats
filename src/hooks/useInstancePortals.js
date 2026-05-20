import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useInstancePortals(instanceId) {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: portals = [], isLoading } = useQuery({
    queryKey: ['instance-portals', user?.id, instanceId],
    enabled: !!user && !!instanceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instance_portals')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['instance-portals', user?.id, instanceId] })

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const maxIndex = portals.reduce((m, p) => Math.max(m, p.order_index), -1)
      const { error } = await supabase.from('instance_portals').insert({
        ...data,
        instance_id: instanceId,
        user_id: user.id,
        order_index: maxIndex + 1,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase
        .from('instance_portals')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('instance_portals')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return {
    portals,
    isLoading,
    createPortal: (data) => createMutation.mutateAsync(data),
    updatePortal: (id, data) => updateMutation.mutateAsync({ id, ...data }),
    deletePortal: (id) => deleteMutation.mutateAsync(id),
  }
}
