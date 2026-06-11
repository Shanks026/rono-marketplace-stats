import { useState, useMemo } from 'react'
import { Plus, LayoutGrid, Table2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { InstanceCardTile } from '@/components/instances/InstanceCardTile'
import { InstancesTable } from '@/components/instances/InstancesTable'
import { InstanceFormDialog } from '@/components/instances/InstanceFormDialog'
import { useInstances } from '@/hooks/useInstances'
import { useAuth } from '@/hooks/useAuth'
import { useAllProfiles } from '@/hooks/useProfile'

const STATUS_FILTERS = ['all', 'active', 'inactive', 'deprecated']

function viewKey(userId) {
  return `instances_view:${userId ?? 'anon'}`
}

export default function InstancesPage() {
  const { user } = useAuth()
  const [addingInstance, setAddingInstance] = useState(false)
  const [statusFilter, setStatusFilter] = useState('active')
  const [search, setSearch] = useState('')
  const [view, setView] = useState(() => localStorage.getItem(viewKey(user?.id)) ?? 'grid')
  const { instances, isLoading, createInstance, updateInstance, deleteInstance } = useInstances()
  const profileMap = useAllProfiles()

  function handleViewChange(v) {
    setView(v)
    localStorage.setItem(viewKey(user?.id), v)
  }

  const counts = useMemo(() => ({
    all: instances.length,
    active: instances.filter(i => i.status === 'active').length,
    inactive: instances.filter(i => i.status === 'inactive').length,
    deprecated: instances.filter(i => i.status === 'deprecated').length,
  }), [instances])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return instances
      .filter(i => statusFilter === 'all' || i.status === statusFilter)
      .filter(i => !q || (
        i.name.toLowerCase().includes(q) ||
        (i.version || '').toLowerCase().includes(q) ||
        (i.created_by_name || '').toLowerCase().includes(q) ||
        (i.updated_by_name || '').toLowerCase().includes(q)
      ))
  }, [instances, statusFilter, search])

  return (
    <Tabs value={view} onValueChange={handleViewChange} className="mx-auto max-w-360 px-12 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Instances</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AWS server instances and their portal credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="size-3.5" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <Table2 className="size-3.5" />
              Table
            </TabsTrigger>
          </TabsList>
          <Button size="sm" className="gap-1.5" onClick={() => setAddingInstance(true)}>
            <Plus className="size-3.5" />
            Add instance
          </Button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'text-sm capitalize pb-2 border-b-2 transition-colors',
                statusFilter === s
                  ? 'border-foreground text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {s}
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs font-normal">
                {counts[s]}
              </Badge>
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search instances…"
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {instances.length === 0
              ? 'No instances yet. Click "Add instance" to get started.'
              : 'No instances match your search.'}
          </p>
        </div>
      ) : (
        <>
          <TabsContent value="grid" className="mt-0">
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(calc(100%),360px),1fr))]">
              {filtered.map(instance => (
                <InstanceCardTile
                  key={instance.id}
                  instance={instance}
                  profileMap={profileMap}
                  onUpdate={updateInstance}
                  onDelete={deleteInstance}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <InstancesTable
              instances={filtered}
              profileMap={profileMap}
              onUpdate={updateInstance}
              onDelete={deleteInstance}
            />
          </TabsContent>
        </>
      )}

      <InstanceFormDialog
        open={addingInstance}
        onOpenChange={setAddingInstance}
        onSave={createInstance}
      />
    </Tabs>
  )
}
