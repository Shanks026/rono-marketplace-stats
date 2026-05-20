import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useGoals } from '@/hooks/useGoals'
import { usePortals } from '@/hooks/usePortals'
import { getCurrentQuarter } from '@/lib/quarter'

export default function SettingsPage() {
  const [goalQuarter, setGoalQuarter] = useState(getCurrentQuarter())
  const { goals, createGoal, updateGoal, deleteGoal } = useGoals(goalQuarter)
  const { portals, createPortal, updatePortal, deletePortal } = usePortals()

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your goals and portals.</p>
      </div>

      <div className="grid grid-cols-2 gap-10 items-start">
        {/* Goals */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Goals</h2>
            <Input
              value={goalQuarter}
              onChange={(e) => setGoalQuarter(e.target.value)}
              className="h-7 w-24 text-xs"
              placeholder="2026-Q4"
            />
          </div>

          <div className="divide-y rounded-xl border">
            {goals.map((g) => (
              <GoalRow key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />
            ))}
            {goals.length === 0 && (
              <p className="px-4 py-6 text-xs text-muted-foreground">No goals for {goalQuarter}.</p>
            )}
          </div>

          <AddGoalButton quarter={goalQuarter} onCreate={createGoal} />
        </section>

        {/* Portals */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Portals</h2>

          <div className="divide-y rounded-xl border">
            {portals.map((p) => (
              <PortalRow key={p.id} portal={p} onUpdate={updatePortal} onDelete={deletePortal} />
            ))}
            {portals.length === 0 && (
              <p className="px-4 py-6 text-xs text-muted-foreground">No portals configured.</p>
            )}
          </div>

          <AddPortalButton onCreate={createPortal} />
        </section>
      </div>
    </div>
  )
}

function GoalRow({ goal, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [title, setTitle] = useState(goal.title)
  const [description, setDescription] = useState(goal.description || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onUpdate(goal.id, { title, description })
    setSaving(false)
    setEditing(false)
  }

  return (
    <>
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm">{goal.title}</p>
          {goal.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => setConfirming(true)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <Dialog open={editing} onOpenChange={(open) => !open && setEditing(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Edit goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the goal and unlink all associated tasks.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(goal.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function PortalRow({ portal, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [label, setLabel] = useState(portal.label)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onUpdate(portal.id, { label })
    setSaving(false)
    setEditing(false)
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3">
        <p className="flex-1 text-sm">{portal.label}</p>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => setConfirming(true)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <Dialog open={editing} onOpenChange={(open) => !open && setEditing(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Edit portal</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete portal?</AlertDialogTitle>
            <AlertDialogDescription>Tasks linked to this portal will have their portal unset.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(portal.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function AddGoalButton({ quarter, onCreate }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!title.trim()) return
    setSaving(true)
    await onCreate({ quarter, title, description })
    setSaving(false)
    setOpen(false)
    setTitle('')
    setDescription('')
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" /> Add goal
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Add goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Quarter</Label>
              <Input value={quarter} disabled className="text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional description"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !title.trim()}>{saving ? 'Creating…' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AddPortalButton({ onCreate }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!label.trim()) return
    setSaving(true)
    await onCreate({ label, color_token: 'gray' })
    setSaving(false)
    setOpen(false)
    setLabel('')
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" /> Add portal
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Add portal</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Portal name" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !label.trim()}>{saving ? 'Creating…' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
