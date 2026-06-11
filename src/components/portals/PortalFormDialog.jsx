import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PORTAL_NAMES } from '@/lib/portalStyles'

export function PortalFormDialog({ open, onOpenChange, onSave, portal }) {
  const isEdit = !!portal
  const [label, setLabel] = useState(portal?.label ?? '')
  const [status, setStatus] = useState(portal?.status ?? 'active')
  const [description, setDescription] = useState(portal?.description ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLabel(portal?.label ?? '')
      setStatus(portal?.status ?? 'active')
      setDescription(portal?.description ?? '')
    }
  }, [open, portal])

  async function handleSave() {
    if (!label) return
    setSaving(true)
    try {
      await onSave({
        label,
        status,
        description: description.trim() || null,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            {isEdit ? 'Edit portal' : 'Add portal'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Portal</Label>
            <Select value={label} onValueChange={setLabel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select portal type…" />
              </SelectTrigger>
              <SelectContent>
                {PORTAL_NAMES.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this portal used for?"
              className="resize-none text-sm"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !label}>
            {saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
