import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { classifyTask } from '@/services/classifyTask'
import { useGoals } from '@/hooks/useGoals'
import { usePortals } from '@/hooks/usePortals'
import { supabase } from '@/lib/supabase'
import TaskPreviewCard from './TaskPreviewCard'

const JIRA_URL_RE = /(https?:\/\/[a-z0-9-]+\.atlassian\.net)\/browse\/([A-Z][A-Z0-9]*-\d+)/i

export function TaskInputBar() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingJira, setFetchingJira] = useState(false)
  const [preview, setPreview] = useState(null)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  const { goals } = useGoals()
  const { portals } = usePortals()

  const speechSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  async function handlePaste(e) {
    const pasted = e.clipboardData.getData('text')
    const match = pasted.match(JIRA_URL_RE)
    if (!match) return

    e.preventDefault()
    const baseUrl = match[1]
    const issueKey = match[2].toUpperCase()
    setFetchingJira(true)
    setError(null)
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('fetch-jira-issue', {
        body: { issueKey, baseUrl },
      })
      if (fnErr || data?.error) throw new Error(fnErr?.message || data?.error)
      setValue(`${data.summary} — ${issueKey}`)
    } catch (err) {
      // fallback: just insert the key
      setValue((prev) => (prev ? `${prev} ${issueKey}` : issueKey))
      setError(`Could not fetch Jira ticket: ${err.message}`)
    } finally {
      setFetchingJira(false)
    }
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e) => {
      setValue(e.results[0][0].transcript)
      setRecording(false)
    }
    recognition.onerror = () => setRecording(false)
    recognition.onend = () => setRecording(false)
    recognition.start()
    recognitionRef.current = recognition
    setRecording(true)
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setRecording(false)
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!value.trim() || loading) return

    setLoading(true)
    setError(null)
    try {
      const result = await classifyTask(value.trim(), goals, portals)
      setPreview({ ...result, raw_input: value.trim() })
    } catch (err) {
      setError(err.message || 'Classification failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const busy = loading || fetchingJira

  return (
    <>
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          disabled={busy}
          placeholder="What did you work on? (e.g. Fixed vendor portal login bug, ~2hrs, MP-456)"
          className={cn(
            'w-full rounded-xl border bg-background px-4 py-3 pr-24 text-sm outline-none',
            'placeholder:text-muted-foreground/60',
            'focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-all',
            busy && 'opacity-50'
          )}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {speechSupported && (
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg transition-colors',
                recording
                  ? 'text-destructive hover:bg-destructive/10'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {recording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
          )}

          <button
            type="submit"
            disabled={!value.trim() || busy}
            className={cn(
              'flex size-8 items-center justify-center rounded-lg transition-colors',
              'bg-primary text-primary-foreground',
              'disabled:opacity-30 hover:opacity-90'
            )}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </button>
        </div>
      </form>

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}

      {preview && (
        <TaskPreviewCard
          preview={preview}
          onClose={() => setPreview(null)}
          onSaved={() => {
            setPreview(null)
            setValue('')
          }}
        />
      )}
    </>
  )
}
