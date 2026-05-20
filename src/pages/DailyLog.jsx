import { useSearchParams } from 'react-router'
import { isToday, isYesterday, format } from 'date-fns'
import { Search } from 'lucide-react'
import { TaskInputBar } from '@/components/tasks/TaskInputBar'
import { TaskCard } from '@/components/tasks/TaskCard'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { useTasks } from '@/hooks/useTasks'
import { useBootstrap } from '@/hooks/useBootstrap'
import { usePortals } from '@/hooks/usePortals'
import { useGoals } from '@/hooks/useGoals'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { TASK_TYPES } from '@/lib/taskTypes.jsx'
import { TASK_STATUSES } from '@/lib/taskStatus.jsx'
import { useState } from 'react'

function dateHeading(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMMM d, yyyy')
}

export default function DailyLog() {
  useBootstrap()

  const [searchParams, setSearchParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  const portalId = searchParams.get('portal') || ''
  const taskType = searchParams.get('type') || ''
  const activeStatus = searchParams.get('status') || 'all'
  const search = searchParams.get('q') || ''

  function setParam(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  const { tasks, isLoading } = useTasks({
    portal_id: portalId || undefined,
    task_type: taskType || undefined,
  })
  const { portals } = usePortals()
  const { goals } = useGoals()

  const statusCounts = TASK_STATUSES.reduce((acc, s) => {
    acc[s.value] = tasks.filter((t) => t.status === s.value).length
    return acc
  }, {})

  const statusFiltered = activeStatus === 'all' ? tasks : tasks.filter((t) => t.status === activeStatus)

  const filtered = search.trim()
    ? statusFiltered.filter((t) => t.summary?.toLowerCase().includes(search.toLowerCase()))
    : statusFiltered

  // Group by logged_date
  const grouped = filtered.reduce((acc, task) => {
    const key = task.logged_date
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {})

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Daily Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Log what you worked on today.</p>
      </div>

      {/* AI Input */}
      <TaskInputBar />

      {/* Toolbar: search + filters + new task */}
      <div className="flex items-center gap-2">
        <div className="relative w-72 mr-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Search tasks…"
            className="h-9 w-full rounded-md border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
          />
        </div>

        <Select
          value={portalId || 'all'}
          onValueChange={(v) => setParam('portal', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue placeholder="All portals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All portals</SelectItem>
            {portals.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={taskType || 'all'}
          onValueChange={(v) => setParam('type', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TASK_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" className="h-9 shrink-0 px-4" onClick={() => setCreateOpen(true)}>
          + New task
        </Button>
      </div>

      <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b">
        <button
          onClick={() => setParam('status', '')}
          className={`px-3 pb-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeStatus === 'all'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All
          <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-normal">
            {tasks.length}
          </span>
        </button>
        {TASK_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setParam('status', s.value)}
            className={`px-3 pb-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeStatus === s.value
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.label}
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-normal">
              {statusCounts[s.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : dates.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No tasks yet. Log your first one above.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {dates.map((date) => {
            const dayTasks = grouped[date]
            const totalHours = dayTasks.reduce((s, t) => s + (t.effort_hours || 0), 0)
            return (
              <section key={date}>
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {dateHeading(date)}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    {totalHours > 0 && <> · {totalHours}h</>}
                  </span>
                </div>
                <div className="divide-y rounded-xl border px-4">
                  {dayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
