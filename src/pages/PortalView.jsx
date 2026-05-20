import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TaskInputBar } from '@/components/tasks/TaskInputBar'
import { TaskCard } from '@/components/tasks/TaskCard'
import { usePortals } from '@/hooks/usePortals'
import { useTasks } from '@/hooks/useTasks'
import { Spinner } from '@/components/ui/spinner'

export default function PortalView() {
  const [expanded, setExpanded] = useState({})
  const { portals, isLoading: portalsLoading } = usePortals()
  const { tasks, isLoading: tasksLoading } = useTasks()

  function toggle(id) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }))
  }

  function tasksForPortal(portalId) {
    return tasks.filter((t) => t.portal_id === portalId)
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Portals</h1>
        <p className="text-sm text-muted-foreground mt-1">Tasks grouped by portal.</p>
      </div>

      <TaskInputBar />

      {portalsLoading || tasksLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="space-y-3">
          {portals.map((portal) => {
            const portalTasks = tasksForPortal(portal.id)
            const totalHours = portalTasks.reduce((s, t) => s + (t.effort_hours || 0), 0)
            const open = expanded[portal.id]

            return (
              <div key={portal.id} className="rounded-xl border">
                <button
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                  onClick={() => toggle(portal.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{portal.label}</p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{portalTasks.length} {portalTasks.length === 1 ? 'task' : 'tasks'}</span>
                      {totalHours > 0 && <span>{totalHours}h total</span>}
                    </div>
                  </div>
                  {open
                    ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  }
                </button>

                {open && (
                  <div className="border-t px-4">
                    {portalTasks.length === 0 ? (
                      <p className="py-4 text-xs text-muted-foreground">No tasks for this portal yet.</p>
                    ) : (
                      <div className="divide-y">
                        {portalTasks.map((task) => (
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
