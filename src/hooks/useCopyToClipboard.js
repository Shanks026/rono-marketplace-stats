import { useState, useCallback } from 'react'

export function useCopyToClipboard(resetMs = 1500) {
  const [copiedKey, setCopiedKey] = useState(null)

  const copy = useCallback(
    async (text, key) => {
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(
          () => setCopiedKey((prev) => (prev === key ? null : prev)),
          resetMs
        )
      } catch {
        // Fallback for non-HTTPS or unsupported browsers
        const el = document.createElement('textarea')
        el.value = text
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.focus()
        el.select()
        try {
          document.execCommand('copy')
          setCopiedKey(key)
          setTimeout(
            () => setCopiedKey((prev) => (prev === key ? null : prev)),
            resetMs
          )
        } finally {
          document.body.removeChild(el)
        }
      }
    },
    [resetMs]
  )

  return { copy, copiedKey }
}
