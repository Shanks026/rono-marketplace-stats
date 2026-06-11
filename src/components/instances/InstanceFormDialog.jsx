import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function InstanceFormDialog({ open, onOpenChange, onSave, instance }) {
  const isEdit = !!instance
  const [name, setName] = useState(instance?.name ?? '')
  const [domain, setDomain] = useState(instance?.domain ?? '')
  const [status, setStatus] = useState(instance?.status ?? 'active')
  const [version, setVersion] = useState(instance?.version?.replace(/^v/, '') ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(instance?.name ?? '')
      setDomain(instance?.domain ?? '')
      setStatus(instance?.status ?? 'active')
      setVersion(instance?.version?.replace(/^v/, '') ?? '')
    }
  }, [open, instance])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        domain: domain.trim() || null,
        status,
        version: version.trim() ? `v${version.trim()}` : '',
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            {isEdit ? 'Edit instance' : 'Add instance'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Instance name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. mp303"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Domain <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. admin.mp303.example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-full">
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
              <Label>Version</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground select-none pointer-events-none">
                  v
                </span>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="3.6.2"
                  className="pl-6 h-9"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
