import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PortalFormDialog } from './PortalFormDialog'
import { PortalIcon } from '@/lib/portalStyles'

function getInitials(name) {
  return (name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusClass(status) {
  if (status === 'active')
    return 'border-transparent bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300'
  if (status === 'deprecated')
    return 'border-transparent bg-stone-100 text-stone-500 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400'
  return 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
}

function RowActions({ portal, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <div className="flex items-center gap-0.5 justify-end" onClick={e => e.stopPropagation()}>
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

const columnHelper = createColumnHelper()

function buildColumns(profileMap, instanceCounts, onUpdate, onDelete) {
  return [
    columnHelper.accessor('label', {
      header: 'Portal',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <PortalIcon name={getValue()} size="sm" />
          <span className="font-medium">{getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue()
        return <Badge className={cn('capitalize', statusClass(s))}>{s}</Badge>
      },
    }),
    columnHelper.display({
      id: 'instances',
      header: 'Instances',
      cell: ({ row }) => {
        const count = instanceCounts[row.original.label] ?? 0
        return <span className="text-sm text-muted-foreground">{count}</span>
      },
    }),
    columnHelper.display({
      id: 'created_by',
      header: 'Created by',
      cell: ({ row }) => {
        const name = row.original.created_by_name || 'Unknown'
        const avatarUrl = profileMap[row.original.user_id]?.avatar_url
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6 rounded-full shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="rounded-full text-[10px] bg-muted text-muted-foreground">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{name}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions portal={row.original} onUpdate={onUpdate} onDelete={onDelete} />
      ),
    }),
  ]
}

export function PortalsTable({ portals, profileMap = {}, instanceCounts, onUpdate, onDelete }) {
  const columns = useMemo(
    () => buildColumns(profileMap, instanceCounts, onUpdate, onDelete),
    [profileMap, instanceCounts, onUpdate, onDelete],
  )

  const table = useReactTable({
    data: portals,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(hg => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map(header => (
                <TableHead key={header.id} className="text-xs font-medium text-muted-foreground px-5 py-3">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} className="px-5 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
