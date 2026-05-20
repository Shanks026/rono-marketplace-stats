import { useState } from 'react'
import { format } from 'date-fns'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGoals } from '@/hooks/useGoals'
import { useTasks } from '@/hooks/useTasks'
import { getCurrentQuarter } from '@/lib/quarter'
import { Spinner } from '@/components/ui/spinner'

const QUARTERS = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']

function buildReport(quarter, goals, tasks) {
  const lines = []
  lines.push(`QUARTERLY PERFORMANCE REPORT — ${quarter.replace('-', ' ')}`)
  lines.push(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`)
  lines.push('')

  for (const goal of goals) {
    const goalTasks = tasks.filter((t) =>
      t.task_goals?.some((tg) => tg.goal?.id === goal.id)
    )
    const totalHours = goalTasks.reduce((s, t) => s + (t.effort_hours || 0), 0)

    lines.push('─'.repeat(50))
    lines.push(`GOAL ${goal.order_index}: ${goal.title}`)
    lines.push('─'.repeat(50))
    lines.push(`Total tasks: ${goalTasks.length}  |  Total effort: ${totalHours}h`)
    lines.push('')

    for (const task of goalTasks) {
      const date = format(new Date(task.logged_date + 'T00:00:00'), 'yyyy-MM-dd')
      const jira = task.jira_ref ? ` — ${task.jira_ref}` : ''
      const effort = task.effort_hours ? ` (${task.effort_hours}h` : ' ('
      const type = task.task_type ? `, ${task.task_type})` : ')'
      lines.push(`• [${date}] ${task.summary}${jira}${effort}${type}`)
    }

    if (goalTasks.length === 0) {
      lines.push('• No tasks logged for this goal.')
    }

    lines.push('')
  }

  return lines.join('\n')
}

export default function ReportView() {
  const [quarter, setQuarter] = useState(getCurrentQuarter())
  const [copied, setCopied] = useState(false)

  const { goals, isLoading: goalsLoading } = useGoals(quarter)
  const { tasks, isLoading: tasksLoading } = useTasks({ quarter })

  const report = buildReport(quarter, goals, tasks)

  async function handleCopy() {
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Quarterly Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Copy and paste into your performance review.</p>
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

      <Button onClick={handleCopy} variant="outline" className="gap-2">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? 'Copied!' : 'Copy report'}
      </Button>

      {goalsLoading || tasksLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="space-y-8">
          {goals.map((goal) => {
            const goalTasks = tasks.filter((t) =>
              t.task_goals?.some((tg) => tg.goal?.id === goal.id)
            )
            const totalHours = goalTasks.reduce((s, t) => s + (t.effort_hours || 0), 0)

            return (
              <section key={goal.id} className="space-y-3">
                <div className="border-b pb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                    Goal {goal.order_index}
                  </p>
                  <h2 className="text-sm font-semibold">{goal.title}</h2>
                  <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                    <span>{goalTasks.length} tasks</span>
                    <span>{totalHours}h effort</span>
                  </div>
                </div>

                {goalTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks logged.</p>
                ) : (
                  <ul className="space-y-2">
                    {goalTasks.map((task) => (
                      <li key={task.id} className="flex gap-3 text-sm">
                        <span className="w-20 shrink-0 text-xs tabular-nums text-muted-foreground pt-0.5">
                          {format(new Date(task.logged_date + 'T00:00:00'), 'MMM d')}
                        </span>
                        <span className="flex-1">
                          {task.summary}
                          {task.jira_ref && (
                            <span className="ml-2 text-xs text-muted-foreground">{task.jira_ref}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {task.effort_hours && `${task.effort_hours}h`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
