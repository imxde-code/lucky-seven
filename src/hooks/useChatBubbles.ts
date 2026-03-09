import { useState, useEffect, useRef } from 'react'
import type { ChatMessage } from '../lib/types'

const BUBBLE_DURATION_MS = 4000

/**
 * Derives per-player latest chat bubble from chat messages.
 * UI-only — auto-clears after 4 seconds. No Firestore writes.
 */
export function useChatBubbles(
  messages: ChatMessage[],
  localUserId: string,
): Record<string, string | null> {
  const [bubbles, setBubbles] = useState<Record<string, string | null>>({})
  const prevCountRef = useRef(messages.length)
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    if (messages.length <= prevCountRef.current) {
      prevCountRef.current = messages.length
      return
    }

    // Only process new messages
    const newMsgs = messages.slice(prevCountRef.current)
    prevCountRef.current = messages.length

    for (const msg of newMsgs) {
      // Don't show bubbles for local user (they see their own in the chat panel)
      if (msg.userId === localUserId) continue

      const uid = msg.userId
      const text = msg.text.length > 40 ? msg.text.slice(0, 38) + '…' : msg.text

      // Clear existing timer for this user
      if (timersRef.current[uid]) clearTimeout(timersRef.current[uid])

      setBubbles((prev) => ({ ...prev, [uid]: text }))

      // Auto-clear after duration
      timersRef.current[uid] = setTimeout(() => {
        setBubbles((prev) => ({ ...prev, [uid]: null }))
      }, BUBBLE_DURATION_MS)
    }

    return () => {
      // Don't clear timers on re-render — only on unmount
    }
  }, [messages.length, messages, localUserId])

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout)
    }
  }, [])

  return bubbles
}
