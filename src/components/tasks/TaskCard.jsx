import { useState } from 'react'
import { format } from 'date-fns'
import { MoreHorizontal, ExternalLink, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
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
import { useTasks } from '@/hooks/useTasks'
import { TaskTypeBadge } from '@/lib/taskTypes.jsx'
import { TASK_STATUSES, TASK_STATUS_MAP } from '@/lib/taskStatus.jsx'
import TaskEditDialog from './TaskEditDialog'

export function TaskCard({ task }) {
  const { deleteTask, updateTask } = useTasks()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const portal = task.portal
  const goals = task.task_goals?.map((tg) => tg.goal).filter(Boolean) ?? []
  const firstGoal = goals[0]
  const extraGoals = goals.length - 1
  const statusDef = TASK_STATUS_MAP[task.status] ?? TASK_STATUS_MAP['todo']

  async function handleStatusChange(value) {
    setStatusOpen(false)
    await updateTask(task.id, { status: value })
  }

  return (
    <>
      <div className="group py-6 flex items-start gap-4">
        {/* Date column */}
        <span className="shrink-0 w-16 pt-0.5 text-xs tabular-nums text-muted-foreground border-r pr-3">
          {format(new Date(task.logged_date + 'T00:00:00'), 'MMM d')}
        </span>

        {/* Content column */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Row 1: status (left) + portal, type, menu (right) */}
          <div className="flex items-center justify-between gap-2">
            {/* Status badge */}
            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
              <PopoverTrigger asChild>
                <button className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${statusDef.badge}`}>
                  <span className={`size-1.5 rounded-full ${statusDef.dot}`} />
                  {statusDef.label}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-44 p-1">
                {TASK_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleStatusChange(s.value)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                  >
                    <span className={`size-2 rounded-full shrink-0 ${s.dot}`} />
                    {s.label}
                    {s.value === task.status && <Check className="ml-auto size-3 text-muted-foreground" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Portal + Type + menu */}
            <div className="flex items-center gap-1.5 shrink-0">
              {portal && <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-secondary text-muted-foreground">{portal.label}</span>}
              {task.task_type && <TaskTypeBadge type={task.task_type} />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 flex size-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100">
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => setEditing(true)}>Edit</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setConfirming(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Row 2: summary */}
          <p className="text-sm leading-relaxed text-foreground">{task.summary}</p>

          {/* Dashed separator */}
          <div className="border-t border-dashed" />

          {/* Row 3: goal, effort, jira */}
          <div className="flex items-center gap-2 flex-wrap">
            {firstGoal && (
              <Tag muted>{firstGoal.title.split(' ').slice(0, 4).join(' ')}…</Tag>
            )}
            {extraGoals > 0 && (
              <Tag muted>+{extraGoals}</Tag>
            )}
            {task.effort_hours > 0 && <Tag muted>{task.effort_hours}h</Tag>}
            {task.jira_ref && (
              <a
                href={`https://thbs.atlassian.net/browse/${task.jira_ref}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {task.jira_ref}
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>

        </div>
      </div>

      {editing && (
        <TaskEditDialog task={task} onClose={() => setEditing(false)} />
      )}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This task will be removed from your log. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTask(task.id)}
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

function Tag({ children, muted }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${
      muted ? 'border-border text-muted-foreground' : 'border-foreground/20 text-foreground'
    }`}>
      {children}
    </span>
  )
}
