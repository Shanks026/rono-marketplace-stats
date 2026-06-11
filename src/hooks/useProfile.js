import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

async function upsertProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { user_id: userId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  if (error) throw error
}

export function useProfile() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data ?? null
    },
  })

  // Mutation for saving profile fields (full_name, role, bio)
  const saveMutation = useMutation({
    mutationFn: async (updates) => {
      await upsertProfile(user.id, updates)
      if (updates.full_name) {
        await supabase.auth.updateUser({ data: { full_name: updates.full_name } })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', user?.id] }),
  })

  // Separate mutation for avatar — does NOT affect isSaving
  const avatarMutation = useMutation({
    mutationFn: (avatarUrl) => upsertProfile(user.id, { avatar_url: avatarUrl }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', user?.id] }),
  })

  async function uploadAvatar(file) {
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('profile-image')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data: { publicUrl } } = supabase.storage
      .from('profile-image')
      .getPublicUrl(path)
    await avatarMutation.mutateAsync(`${publicUrl}?t=${Date.now()}`)
  }

  return {
    profile,
    isLoading,
    updateProfile: (data) => saveMutation.mutateAsync(data),
    uploadAvatar,
    isSaving: saveMutation.isPending,
  }
}

export function useAllProfiles() {
  const { user } = useAuth()
  const { data = [] } = useQuery({
    queryKey: ['all-profiles', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
      if (error) throw error
      return data
    },
  })
  return Object.fromEntries(data.map(p => [p.user_id, p]))
}
