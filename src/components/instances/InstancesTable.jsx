import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

function getInitials(name) {
  return (name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function RowActions({ instance, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <div className="flex items-center gap-0.5 justify-end" onClick={e => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirming(true)}>
              <Trash2 className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>

      <InstanceFormDialog
        open={editing}
        onOpenChange={setEditing}
        instance={instance}
        onSave={(data) => onUpdate(instance.id, data)}
      />

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{instance.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the instance and all its portal credentials.
              This cannot be undone.
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

const columnHelper = createColumnHelper()

function buildColumns(profileMap, onUpdate, onDelete) {
  return [
    columnHelper.accessor('name', {
      header: 'Instance',
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue()}</span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue()
        return (
          <Badge className={cn(
            'capitalize',
            status === 'active'
              ? 'border-transparent bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300'
              : status === 'deprecated'
                ? 'border-transparent bg-stone-100 text-stone-500 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400'
                : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
          )}>
            {status}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('version', {
      header: 'Version',
      cell: ({ getValue }) => {
        const v = getValue()
        return v
          ? <Badge variant="outline" className="text-muted-foreground">{v}</Badge>
          : <span className="text-xs text-muted-foreground/40">—</span>
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
        <RowActions instance={row.original} onUpdate={onUpdate} onDelete={onDelete} />
      ),
    }),
  ]
}

export function InstancesTable({ instances, profileMap = {}, onUpdate, onDelete }) {
  const navigate = useNavigate()
  const columns = useMemo(() => buildColumns(profileMap, onUpdate, onDelete), [profileMap, onUpdate, onDelete])

  const table = useReactTable({
    data: instances,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className="text-xs font-medium text-muted-foreground px-5 py-3">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              onClick={() => navigate(`/instances/${row.original.id}`)}
            >
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
