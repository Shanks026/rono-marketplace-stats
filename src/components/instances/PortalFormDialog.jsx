import { useState, useEffect } from 'react'
import { Eye, EyeOff, Plus, X, FileCode } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PORTAL_NAMES } from '@/lib/portalStyles'

const NEEDS_STORE  = ['Store Management Portal', 'Vendor Portal', 'Onboarding Portal', 'Signup Portal', 'Buyer/Procurement']
const NEEDS_VENDOR = ['Vendor Portal', 'Buyer/Procurement']

const EMPTY = {
  name: '', url: '', email: '', username: '', password: '', store: '', vendor: '',
}

function FieldGroup({ label, optional, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}
        {optional && <span className="text-muted-foreground font-normal ml-1">(optional)</span>}
      </Label>
      {children}
    </div>
  )
}

export function PortalFormDialog({ open, onOpenChange, onSave, portal, lockedName }) {
  const isEdit = !!portal
  const [form, setForm] = useState({
    ...EMPTY,
    ...(portal ?? {}),
    name:   lockedName ?? portal?.name ?? '',
    email:  portal?.email ?? '',
    store:  portal?.store ?? '',
    vendor: portal?.vendor ?? '',
  })
  const [files, setFiles] = useState(portal?.files ?? [])
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY,
        ...(portal ?? {}),
        name:   lockedName ?? portal?.name ?? '',
        email:  portal?.email ?? '',
        store:  portal?.store ?? '',
        vendor: portal?.vendor ?? '',
      })
      setFiles(portal?.files ?? [])
      setShowPassword(false)
    }
  }, [open, portal, lockedName])

  function setField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function addFile() {
    setFiles(prev => [...prev, { name: '', content: '' }])
  }

  function updateFile(index, field, value) {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f))
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const showStore  = NEEDS_STORE.includes(form.name)
  const showVendor = NEEDS_VENDOR.includes(form.name)
  const isValid    = form.name.trim() && form.url.trim() && form.username.trim()

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    try {
      await onSave({
        name:     form.name,
        url:      form.url.trim(),
        email:    form.email.trim() || null,
        username: form.username.trim(),
        password: form.password,
        store:    showStore  ? (form.store.trim()  || null) : null,
        vendor:   showVendor ? (form.vendor.trim() || null) : null,
        files:    files.filter(f => f.name.trim() && f.content.trim()),
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl flex flex-col max-h-[88vh] p-0 gap-0">

        {/* Sticky header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-base font-semibold">
            {isEdit ? 'Edit credentials' : 'Add credentials'}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* — Portal context — */}
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Portal</p>

            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Type">
                {lockedName ? (
                  <div className="h-9 flex items-center px-3 rounded-md border bg-muted text-sm text-muted-foreground">
                    {lockedName}
                  </div>
                ) : (
                  <Select value={form.name} onValueChange={(v) => setForm((p) => ({ ...p, name: v }))}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PORTAL_NAMES.map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FieldGroup>

              {showStore && (
                <FieldGroup label="Store" optional>
                  <Input value={form.store} onChange={setField('store')} placeholder="e.g. deltastore" />
                </FieldGroup>
              )}
            </div>

            {showVendor && (
              <FieldGroup label="Vendor" optional>
                <Input value={form.vendor} onChange={setField('vendor')} placeholder="e.g. acme-supplier" />
              </FieldGroup>
            )}
          </div>

          {/* — Access — */}
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Access</p>

            <FieldGroup label="URL">
              <Input value={form.url} onChange={setField('url')} placeholder="https://mp303.example.com/admin" type="url" />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Username">
                <Input value={form.username} onChange={setField('username')} placeholder="admin_user" />
              </FieldGroup>

              <FieldGroup label="Email" optional>
                <Input value={form.email} onChange={setField('email')} placeholder="admin@example.com" type="email" />
              </FieldGroup>
            </div>

            <FieldGroup label="Password">
              <div className="relative">
                <Input
                  value={form.password}
                  onChange={setField('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="pr-9 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide' : 'Show'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </FieldGroup>
          </div>

          {/* — Files — */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</p>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={addFile}>
                <Plus className="size-3" />
                Add file
              </Button>
            </div>

            {files.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-5 text-center">
                <p className="text-xs text-muted-foreground">No files — add .env, config.js, or any config file.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file, i) => (
                  <div key={i} className="rounded-lg border bg-muted/20 overflow-hidden">
                    {/* File name bar */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b">
                      <FileCode className="size-3.5 shrink-0 text-muted-foreground" />
                      <input
                        value={file.name}
                        onChange={e => updateFile(i, 'name', e.target.value)}
                        placeholder=".env"
                        spellCheck={false}
                        className="flex-1 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    {/* Content */}
                    <textarea
                      value={file.content}
                      onChange={e => updateFile(i, 'content', e.target.value)}
                      placeholder={'VITE_API_URL=https://api.example.com\nVITE_SECRET_KEY=your_key_here'}
                      rows={6}
                      spellCheck={false}
                      className="w-full bg-background text-foreground font-mono text-xs px-3 py-3 resize-y focus:outline-none placeholder:text-muted-foreground/60 leading-relaxed block"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sticky footer */}
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !isValid}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add credentials'}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}
