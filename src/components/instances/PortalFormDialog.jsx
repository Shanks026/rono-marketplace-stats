import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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

const PORTAL_NAMES = [
  'Admin Portal',
  'Store Management Portal',
  'Vendor Portal',
  'Onboarding Portal',
  'Signup Portal',
  'Storefront',
  'Buyer/Procurement',
]

const EMPTY = {
  name: '',
  url: '',
  email: '',
  username: '',
  password: '',
  store: '',
  env_content: '',
}

export function PortalFormDialog({ open, onOpenChange, onSave, portal }) {
  const isEdit = !!portal
  const [form, setForm] = useState({
    ...EMPTY,
    ...(portal ?? {}),
    email: portal?.email ?? '',
    store: portal?.store ?? '',
    env_content: portal?.env_content ?? '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY,
        ...(portal ?? {}),
        email: portal?.email ?? '',
        store: portal?.store ?? '',
        env_content: portal?.env_content ?? '',
      })
      setShowPassword(false)
    }
  }, [open, portal])

  function setField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const isAdmin = form.name === 'Admin Portal'
  const isValid = form.name.trim() && form.url.trim() && form.username.trim()

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    try {
      await onSave({
        name:        form.name,
        url:         form.url.trim(),
        email:       form.email.trim() || null,
        username:    form.username.trim(),
        password:    form.password,
        store:       isAdmin ? null : (form.store.trim() || null),
        env_content: form.env_content.trim() || null,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {isEdit ? 'Edit portal' : 'Add portal'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex gap-3 items-end">
            <div className="space-y-1.5 flex-1">
              <Label>Portal</Label>
              <Select
                value={form.name}
                onValueChange={(v) => setForm((p) => ({ ...p, name: v }))}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select a portal…" />
                </SelectTrigger>
                <SelectContent>
                  {PORTAL_NAMES.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isAdmin && (
              <div className="space-y-1.5 flex-1">
                <Label>
                  Store <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  value={form.store}
                  onChange={setField('store')}
                  placeholder="e.g. deltastore"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>URL</Label>
            <Input
              value={form.url}
              onChange={setField('url')}
              placeholder="https://mp303.example.com/admin"
              type="url"
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Email <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              value={form.email}
              onChange={setField('email')}
              placeholder="admin@example.com"
              type="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input
              value={form.username}
              onChange={setField('username')}
              placeholder="admin_user"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="relative">
              <Input
                value={form.password}
                onChange={setField('password')}
                type={showPassword ? 'text' : 'password'}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              .env <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <textarea
              value={form.env_content}
              onChange={setField('env_content')}
              placeholder={'VITE_API_URL=https://api.example.com\nVITE_SECRET_KEY=your_key_here'}
              rows={7}
              spellCheck={false}
              className="w-full rounded-md border bg-background text-foreground font-mono text-sm px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground leading-relaxed"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !isValid}>
            {saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
