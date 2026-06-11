import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { PortalCredentialRow } from './PortalCredentialRow'
import { PortalFormDialog } from './PortalFormDialog'
import { useInstancePortals } from '@/hooks/useInstancePortals'

export function InstanceSheet({ open, onOpenChange, instance }) {
  const [addingPortal, setAddingPortal] = useState(false)

  const { portals, isLoading, createPortal, updatePortal, deletePortal } =
    useInstancePortals(instance.id)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-130 sm:max-w-130 p-0 flex flex-col gap-0"
        >
          {/* Header */}
          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <div className="flex items-center justify-between pr-6">
              <div className="space-y-0.5">
                <SheetTitle className="text-base">{instance.name}</SheetTitle>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
                    instance.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : instance.status === 'deprecated'
                        ? 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  )}>
                    {instance.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {portals.length} {portals.length === 1 ? 'portal' : 'portals'}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs shrink-0"
                onClick={() => setAddingPortal(true)}
              >
                <Plus className="size-3.5" />
                Add portal
              </Button>
            </div>
          </SheetHeader>

          {/* Portal list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner className="size-5" />
              </div>
            ) : portals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-sm text-muted-foreground">No portals yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs mt-1"
                  onClick={() => setAddingPortal(true)}
                >
                  <Plus className="size-3.5" />
                  Add first portal
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {portals.map((portal) => (
                  <PortalCredentialRow
                    key={portal.id}
                    portal={portal}
                    onUpdate={updatePortal}
                    onDelete={deletePortal}
                  />
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <PortalFormDialog
        open={addingPortal}
        onOpenChange={setAddingPortal}
        onSave={createPortal}
      />
    </>
  )
}
