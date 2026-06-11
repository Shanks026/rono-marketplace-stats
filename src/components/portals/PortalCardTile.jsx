import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
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
import { PortalFormDialog } from './PortalFormDialog'

function statusClass(status) {
  if (status === 'active')
    return 'border-transparent bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300'
  if (status === 'deprecated')
    return 'border-transparent bg-stone-100 text-stone-500 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400'
  return 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
}

export function PortalCardTile({ portal, instanceCount, onUpdate, onDelete }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/portals/${portal.id}`)}
        onKeyDown={e => e.key === 'Enter' && navigate(`/portals/${portal.id}`)}
        className="rounded-xl border bg-card px-5 py-5 space-y-5 cursor-pointer hover:shadow-md transition-shadow select-none"
      >
        {/* Row 1 — icon + instance count (left) + status (right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-muted-foreground">
              {instanceCount} {instanceCount === 1 ? 'Instance' : 'Instances'}
            </Badge>
          </div>
          <Badge className={cn('capitalize', statusClass(portal.status))}>
            {portal.status}
          </Badge>
        </div>

        {/* Label + description */}
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight leading-none">
            {portal.label}
          </h3>
          {portal.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{portal.description}</p>
          )}
        </div>

        {/* Dashed separator */}
        <div className="border-t border-dashed" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Created {new Date(portal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{' '}
            {new Date(portal.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </p>

          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditing(true)}>
                  <Pencil className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirming(true)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <PortalFormDialog
        open={editing}
        onOpenChange={setEditing}
        portal={portal}
        onSave={data => onUpdate(portal.id, data)}
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
              onClick={() => onDelete(portal.id)}
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
