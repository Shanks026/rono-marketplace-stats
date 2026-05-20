import { useState } from 'react'
import { ChevronDown, ChevronRight, Server, Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InstanceFormDialog } from './InstanceFormDialog'
import { PortalFormDialog } from './PortalFormDialog'
import { PortalCredentialRow } from './PortalCredentialRow'
import { useInstancePortals } from '@/hooks/useInstancePortals'

export function InstanceCard({ instance, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [addingPortal, setAddingPortal] = useState(false)

  const { portals, isLoading, createPortal, updatePortal, deletePortal } =
    useInstancePortals(instance.id)

  const portalCount = portals.length

  function handleHeaderClick(e) {
    if (e.target.closest('button')) return
    setOpen((v) => !v)
  }

  return (
    <>
      <div className="rounded-xl border">
        {/* Always-visible header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
          onClick={handleHeaderClick}
          role="button"
          aria-expanded={open}
        >
          <Server className="size-4 text-muted-foreground shrink-0" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{instance.name}</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shrink-0 capitalize ${
              instance.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {instance.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {portalCount} {portalCount === 1 ? 'portal' : 'portals'}
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={(e) => { e.stopPropagation(); setEditing(true) }}
                  aria-label="Edit instance"
                >
                  <Pencil className="size-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setConfirming(true) }}
                  aria-label="Delete instance"
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>

            {open
              ? <ChevronDown className="size-4 text-muted-foreground" />
              : <ChevronRight className="size-4 text-muted-foreground" />
            }
          </div>
        </div>

        {/* Expanded body */}
        {open && (
          <div className="border-t">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Spinner className="size-4" />
              </div>
            ) : portals.length === 0 ? (
              <p className="px-4 py-4 text-xs text-muted-foreground">
                No portals yet. Add one below.
              </p>
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

            <Separator />

            <div className="px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setAddingPortal(true)}
              >
                <Plus className="size-3.5" />
                Add portal
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit instance dialog */}
      <InstanceFormDialog
        open={editing}
        onOpenChange={setEditing}
        instance={instance}
        onSave={(data) => onUpdate(instance.id, data)}
      />

      {/* Add portal dialog */}
      <PortalFormDialog
        open={addingPortal}
        onOpenChange={setAddingPortal}
        onSave={createPortal}
      />

      {/* Delete instance confirmation */}
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{instance.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the instance
              {portalCount > 0
                ? ` and all ${portalCount} portal${portalCount !== 1 ? 's' : ''} with their credentials`
                : ''
              }. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(instance.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
