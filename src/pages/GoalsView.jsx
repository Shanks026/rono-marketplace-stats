import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TaskInputBar } from '@/components/tasks/TaskInputBar'
import { TaskCard } from '@/components/tasks/TaskCard'
import { useGoals } from '@/hooks/useGoals'
import { useTasks } from '@/hooks/useTasks'
import { getCurrentQuarter } from '@/lib/quarter'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const QUARTERS = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']

export default function GoalsView() {
  const [quarter, setQuarter] = useState(getCurrentQuarter())
  const [expanded, setExpanded] = useState({})

  const { goals, isLoading: goalsLoading } = useGoals(quarter)
  const { tasks, isLoading: tasksLoading } = useTasks({ quarter })

  function toggle(id) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }))
  }

  function tasksForGoal(goalId) {
    return tasks.filter((t) =>
      t.task_goals?.some((tg) => tg.goal?.id === goalId)
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground mt-1">Tasks mapped to each quarterly goal.</p>
        </div>
        <Select value={quarter} onValueChange={setQuarter}>
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUARTERS.map((q) => (
              <SelectItem key={q} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TaskInputBar />

      {goalsLoading || tasksLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, idx) => {
            const goalTasks = tasksForGoal(goal.id)
            const totalHours = goalTasks.reduce((s, t) => s + (t.effort_hours || 0), 0)
            const open = expanded[goal.id]

            return (
              <div key={goal.id} className="rounded-xl border">
                <button
                  className="flex w-full items-start gap-3 px-4 py-4 text-left"
                  onClick={() => toggle(goal.id)}
                >
                  <span className="mt-0.5 text-xs text-muted-foreground font-medium w-4 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{goal.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{goalTasks.length} {goalTasks.length === 1 ? 'task' : 'tasks'}</span>
                      {totalHours > 0 && <span>{totalHours}h total</span>}
                    </div>
                  </div>
                  {open
                    ? <ChevronDown className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    : <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  }
                </button>

                {open && (
                  <div className="border-t px-4">
                    {goalTasks.length === 0 ? (
                      <p className="py-4 text-xs text-muted-foreground">No tasks logged for this goal yet.</p>
                    ) : (
                      <div className="divide-y">
                        {goalTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
