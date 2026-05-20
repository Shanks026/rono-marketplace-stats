import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentQuarter } from '@/lib/quarter'

export function useTasks(filters = {}) {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id, filters],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          portal:portals(id, label, color_token),
          task_goals(
            confidence,
            goal:goals(id, title, quarter)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('logged_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters.quarter)   query = query.eq('quarter', filters.quarter)
      if (filters.portal_id) query = query.eq('portal_id', filters.portal_id)
      if (filters.task_type) query = query.eq('task_type', filters.task_type)
      if (filters.status)    query = query.eq('status', filters.status)
      if (filters.date_from) query = query.gte('logged_date', filters.date_from)
      if (filters.date_to)   query = query.lte('logged_date', filters.date_to)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })

  const createTask = useMutation({
    mutationFn: async ({ goal_ids, confidence, ...taskData }) => {
      const quarter = taskData.quarter || getCurrentQuarter()
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, quarter, user_id: user.id })
        .select()
        .single()
      if (error) throw error

      if (goal_ids?.length) {
        const junctions = goal_ids.map((goal_id, i) => ({
          task_id: task.id,
          goal_id,
          confidence: confidence?.[i] ?? 1.0,
        }))
        const { error: jErr } = await supabase.from('task_goals').insert(junctions)
        if (jErr) throw jErr
      }

      return task
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const updateTask = useMutation({
    mutationFn: async ({ id, goal_ids, confidence, ...taskData }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ ...taskData, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error

      if (goal_ids !== undefined) {
        await supabase.from('task_goals').delete().eq('task_id', id)
        if (goal_ids.length) {
          const junctions = goal_ids.map((goal_id, i) => ({
            task_id: id,
            goal_id,
            confidence: confidence?.[i] ?? 1.0,
          }))
          await supabase.from('task_goals').insert(junctions)
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteTask = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('tasks')
        .update({ is_deleted: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  return {
    tasks,
    isLoading,
    createTask: (data) => createTask.mutateAsync(data),
    updateTask: (id, data) => updateTask.mutateAsync({ id, ...data }),
    deleteTask: (id) => deleteTask.mutateAsync(id),
  }
}
