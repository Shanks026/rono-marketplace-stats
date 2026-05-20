import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { InstanceCard } from '@/components/instances/InstanceCard'
import { InstanceFormDialog } from '@/components/instances/InstanceFormDialog'
import { useInstances } from '@/hooks/useInstances'

export default function InstancesPage() {
  const [addingInstance, setAddingInstance] = useState(false)
  const { instances, isLoading, createInstance, updateInstance, deleteInstance } =
    useInstances()

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Instances</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AWS server instances and their portal credentials.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setAddingInstance(true)}
        >
          <Plus className="size-3.5" />
          Add instance
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : instances.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No instances yet. Click &ldquo;Add instance&rdquo; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {instances.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              onUpdate={updateInstance}
              onDelete={deleteInstance}
            />
          ))}
        </div>
      )}

      {/* Add instance dialog */}
      <InstanceFormDialog
        open={addingInstance}
        onOpenChange={setAddingInstance}
        onSave={createInstance}
      />
    </div>
  )
}
