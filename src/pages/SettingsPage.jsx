import { useState, useEffect, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, isLoading, updateProfile, uploadAvatar, isSaving } = useProfile()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ full_name: '', role: '', bio: '' })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const initialized = useRef(false)

  // Only sync form from profile on first load — not on every refetch
  useEffect(() => {
    if (profile && !initialized.current) {
      initialized.current = true
      setForm({
        full_name: profile.full_name || '',
        role:      profile.role      || '',
        bio:       profile.bio       || '',
      })
    }
  }, [profile])

  function setField(field) {
    return (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  async function handleSave() {
    await updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Show immediately via local blob URL
    const local = URL.createObjectURL(file)
    setPreviewUrl(local)

    setUploading(true)
    try {
      await uploadAvatar(file)
      setPreviewUrl(null) // profile refetch will supply the real URL
    } catch {
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      e.target.value = ''
      URL.revokeObjectURL(local)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const displayName = form.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="mx-auto max-w-xl px-8 py-10 space-y-8">

      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div
          className="relative group cursor-pointer shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="size-20 rounded-full overflow-hidden bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold select-none">
            {(previewUrl || profile?.avatar_url) ? (
              <img src={previewUrl || profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              getInitials(displayName)
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading
              ? <Loader2 className="size-5 text-white animate-spin" />
              : <Camera className="size-5 text-white" />
            }
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <button
            type="button"
            className="text-xs text-primary hover:underline mt-1"
            onClick={() => fileInputRef.current?.click()}
          >
            Change photo
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={form.full_name} onChange={setField('full_name')} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label>Role <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input value={form.role} onChange={setField('role')} placeholder="e.g. Developer" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email ?? ''} disabled className="text-muted-foreground" />
        </div>

        <div className="space-y-1.5">
          <Label>Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            value={form.bio}
            onChange={setField('bio')}
            rows={3}
            className="resize-none"
            placeholder="A brief description about yourself…"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
        </Button>
      </div>

    </div>
  )
}
