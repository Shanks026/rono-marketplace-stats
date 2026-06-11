import { useState, useMemo } from 'react'
import { Plus, LayoutGrid, Table2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { usePortals } from '@/hooks/usePortals'
import { useAuth } from '@/hooks/useAuth'
import { useAllProfiles } from '@/hooks/useProfile'
import { PortalCardTile } from '@/components/portals/PortalCardTile'
import { PortalsTable } from '@/components/portals/PortalsTable'
import { PortalFormDialog } from '@/components/portals/PortalFormDialog'

const STATUS_FILTERS = ['all', 'active', 'inactive', 'deprecated']

function viewKey(userId) {
  return `portals_view:${userId ?? 'anon'}`
}

export default function PortalView() {
  const { user } = useAuth()
  const [adding, setAdding] = useState(false)
  const [statusFilter, setStatusFilter] = useState('active')
  const [search, setSearch] = useState('')
  const [view, setView] = useState(() => localStorage.getItem(viewKey(user?.id)) ?? 'grid')

  const { portals, instanceCounts, isLoading, createPortal, updatePortal, deletePortal } = usePortals()
  const profileMap = useAllProfiles()

  function handleViewChange(v) {
    setView(v)
    localStorage.setItem(viewKey(user?.id), v)
  }

  const counts = useMemo(() => ({
    all:        portals.length,
    active:     portals.filter(p => p.status === 'active').length,
    inactive:   portals.filter(p => p.status === 'inactive').length,
    deprecated: portals.filter(p => p.status === 'deprecated').length,
  }), [portals])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return portals
      .filter(p => statusFilter === 'all' || p.status === statusFilter)
      .filter(p => !q || (
        p.label.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.created_by_name || '').toLowerCase().includes(q) ||
        (p.updated_by_name || '').toLowerCase().includes(q)
      ))
  }, [portals, statusFilter, search])

  return (
    <Tabs value={view} onValueChange={handleViewChange} className="mx-auto max-w-360 px-12 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Portal types and their presence across instances.
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
          <Button size="sm" className="gap-1.5" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" />
            Add portal
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
            placeholder="Search portals…"
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {portals.length === 0
              ? 'No portals yet. Click "Add portal" to get started.'
              : 'No portals match your search.'}
          </p>
        </div>
      ) : (
        <>
          <TabsContent value="grid" className="mt-0">
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(calc(100%),360px),1fr))]">
              {filtered.map(portal => (
                <PortalCardTile
                  key={portal.id}
                  portal={portal}
                  instanceCount={instanceCounts[portal.label] ?? 0}
                  onUpdate={updatePortal}
                  onDelete={deletePortal}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <PortalsTable
              portals={filtered}
              profileMap={profileMap}
              instanceCounts={instanceCounts}
              onUpdate={updatePortal}
              onDelete={deletePortal}
            />
          </TabsContent>
        </>
      )}

      <PortalFormDialog
        open={adding}
        onOpenChange={setAdding}
        onSave={createPortal}
      />
    </Tabs>
  )
}
