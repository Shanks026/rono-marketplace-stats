import { useGoals } from '@/hooks/useGoals'
import { Spinner } from '@/components/ui/spinner'

export default function GoalsView() {
  const { goals, isLoading } = useGoals()

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Goals</h1>
        <p className="text-sm text-muted-foreground mt-1">Quarterly goals and objectives.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : goals.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No goals yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, idx) => (
            <div key={goal.id} className="rounded-xl border px-4 py-4 flex items-start gap-3">
              <span className="mt-0.5 text-xs text-muted-foreground font-medium w-4 shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug">{goal.title}</p>
                {goal.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{goal.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
