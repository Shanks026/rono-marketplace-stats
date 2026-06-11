import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PortalFormDialog as PortalMetaFormDialog } from '@/components/portals/PortalFormDialog'
import { PortalCredentialRow } from '@/components/instances/PortalCredentialRow'
import { PortalFormDialog as CredentialFormDialog } from '@/components/instances/PortalFormDialog'

function statusClass(status) {
  if (status === 'active')
    return 'border-transparent bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
  if (status === 'deprecated')
    return 'border-transparent bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
  return 'border-transparent bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
}

export default function PortalDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [addingCred, setAddingCred] = useState(false)
  const [selectedInstanceId, setSelectedInstanceId] = useState(null)

  // Portal metadata
  const { data: portal, isLoading } = useQuery({
    queryKey: ['portal', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portals').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    if (!user || !id) return
    const channel = supabase
      .channel(`portal-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portals', filter: `id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ['portal', id] }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, id, qc])

  // All instances (for tabs)
  const { data: allInstances = [], isLoading: instancesLoading } = useQuery({
    queryKey: ['instances'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instances').select('*').order('name')
      if (error) throw error
      return data
    },
  })

  // All credentials for this portal type across all instances
  const { data: allCredentials = [], isLoading: credLoading } = useQuery({
    queryKey: ['portal-credentials', portal?.label],
    enabled: !!user && !!portal?.label,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instance_portals')
        .select('*')
        .eq('name', portal.label)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data
    },
  })

  // Auto-select first instance when instances load
  useEffect(() => {
    if (allInstances.length > 0 && !selectedInstanceId) {
      setSelectedInstanceId(allInstances[0].id)
    }
  }, [allInstances, selectedInstanceId])

  function getUserName() {
    return user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Unknown'
  }

  const updatePortalMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('portals')
        .update({ ...data, updated_by_name: getUserName(), updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', id] })
      qc.invalidateQueries({ queryKey: ['portals'] })
    },
  })

  const deletePortalMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('portals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portals'] })
      navigate('/portals')
    },
  })

  const createCredMutation = useMutation({
    mutationFn: async (data) => {
      const existingCount = allCredentials.filter(c => c.instance_id === selectedInstanceId).length
      const { error } = await supabase.from('instance_portals').insert({
        ...data,
        instance_id: selectedInstanceId,
        name: portal.label,
        user_id: user.id,
        order_index: existingCount,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-credentials', portal?.label] })
      qc.invalidateQueries({ queryKey: ['instance-portals', selectedInstanceId] })
    },
  })

  const updateCredMutation = useMutation({
    mutationFn: async ({ credId, data }) => {
      const { error } = await supabase.from('instance_portals')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', credId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-credentials', portal?.label] })
      qc.invalidateQueries({ queryKey: ['instance-portals', selectedInstanceId] })
    },
  })

  const deleteCredMutation = useMutation({
    mutationFn: async (credId) => {
      const { error } = await supabase.from('instance_portals').delete().eq('id', credId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-credentials', portal?.label] })
      qc.invalidateQueries({ queryKey: ['instance-portals', selectedInstanceId] })
    },
  })

  if (isLoading) {
    return <div className="flex justify-center items-center py-24"><Spinner /></div>
  }

  if (!portal) {
    return (
      <div className="mx-auto max-w-5xl px-12 py-10 text-center">
        <p className="text-sm text-muted-foreground">Portal not found.</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/portals')}>
          ← Back to Portals
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] overflow-hidden">

      {/* ── Section 1: Portal header ── */}
      <div className="shrink-0 px-12 pt-7 pb-5 border-b space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2"
            onClick={() => navigate('/portals')}>
            <ArrowLeft className="size-3.5" />
            Portals
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirming(true)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Portal info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{portal.label}</h1>
            <Badge className={cn('capitalize', statusClass(portal.status))}>
              {portal.status}
            </Badge>
          </div>
          {portal.description && (
            <p className="text-sm text-muted-foreground">{portal.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Created {new Date(portal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{' · '}
            {new Date(portal.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </p>
        </div>
      </div>

      {/* ── Section 2: Instances + credentials ── */}
      {instancesLoading ? (
        <div className="flex-1 flex justify-center items-center"><Spinner /></div>
      ) : allInstances.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No instances available.</p>
        </div>
      ) : (
        <Tabs
          value={selectedInstanceId ?? allInstances[0]?.id}
          onValueChange={setSelectedInstanceId}
          orientation="vertical"
          className="flex-1 min-h-0 flex flex-row gap-0"
        >
          {/* Left: credential cards — scrolls independently */}
          <div className="w-[70%] min-w-0 overflow-y-auto no-scrollbar px-12 py-6">
            {allInstances.map(instance => {
              const instanceCreds = allCredentials.filter(c => c.instance_id === instance.id)
              return (
                <TabsContent key={instance.id} value={instance.id} className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{instance.name}</h3>
                      {instance.version && (
                        <span className="text-xs text-muted-foreground">{instance.version}</span>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => { setSelectedInstanceId(instance.id); setAddingCred(true) }}>
                      <Plus className="size-3.5" />
                      Add credentials
                    </Button>
                  </div>

                  {credLoading ? (
                    <div className="flex justify-center py-10"><Spinner /></div>
                  ) : instanceCreds.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6">
                      No {portal.label} credentials yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {instanceCreds.map(cred => (
                        <PortalCredentialRow
                          key={cred.id}
                          portal={cred}
                          onUpdate={(credId, data) => updateCredMutation.mutateAsync({ credId, data })}
                          onDelete={credId => deleteCredMutation.mutateAsync(credId)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </div>

          {/* Right: vertical instance list — static */}
          <TabsList className="w-[30%] shrink-0 flex-col h-auto bg-transparent p-0 py-6 pr-12 pl-8 items-stretch justify-start rounded-none border-l">
            {allInstances.map(instance => {
              const count = allCredentials.filter(c => c.instance_id === instance.id).length
              return (
                <TabsTrigger
                  key={instance.id}
                  value={instance.id}
                  className="h-auto flex-none justify-start rounded-none border-0 px-0 py-1.5 text-sm font-normal text-muted-foreground shadow-none bg-transparent data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                >
                  <span className="flex-1 text-left truncate">{instance.name}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-xs font-normal shrink-0 ml-1.5">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      )}

      {/* Dialogs */}
      <PortalMetaFormDialog
        open={editing}
        onOpenChange={setEditing}
        portal={portal}
        onSave={data => updatePortalMutation.mutateAsync(data)}
      />

      <CredentialFormDialog
        open={addingCred}
        onOpenChange={setAddingCred}
        lockedName={portal.label}
        onSave={data => createCredMutation.mutateAsync(data)}
      />

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{portal.label}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This portal will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePortalMutation.mutateAsync()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
