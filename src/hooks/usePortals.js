import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function usePortals() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: portals = [], isLoading } = useQuery({
    queryKey: ['portals', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portals')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index')
      if (error) throw error
      return data
    },
  })

  const createPortal = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('portals').insert({ ...data, user_id: user.id })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portals'] }),
  })

  const updatePortal = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase.from('portals').update(data).eq('id', id)
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
    isLoading,
    createPortal: (data) => createPortal.mutateAsync(data),
    updatePortal: (id, data) => updatePortal.mutateAsync({ id, ...data }),
    deletePortal: (id) => deletePortal.mutateAsync(id),
  }
}
