import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { subscribeChat, sendChatMessage } from '../lib/gameService'
import type { ChatMessage } from '../lib/types'

const STORAGE_KEY = 'lucky7_chat_open'

function getIsMobile(): boolean {
  return window.innerWidth < 768
}

function getStoredPref(): boolean | null {
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'true') return true
  if (v === 'false') return false
  return null
}

/**
 * Chat hook with lazy/eager subscription and localStorage-persisted open state.
 * - Desktop: open by default (subscribes immediately)
 * - Mobile: closed by default (subscribes only on first open)
 * - User preference persists in localStorage
 */
export function useChat(
  gameId: string | undefined,
  displayName: string,
  seatIndex: number,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Determine initial open state: localStorage pref > responsive default
  const [isOpen, setIsOpen] = useState(() => {
    const stored = getStoredPref()
    if (stored !== null) return stored
    return !getIsMobile() // desktop = open, mobile = closed
  })
  const [subscribed, setSubscribed] = useState(isOpen) // if open by default, subscribe immediately
  const isOpenRef = useRef(isOpen)
  const prevMsgCountRef = useRef(0)

  // Keep ref in sync
  isOpenRef.current = isOpen

  // Subscribe to chat (lazy: only after subscribed flag set, or immediately if desktop default)
  useEffect(() => {
    if (!gameId || !subscribed) return
    const unsub = subscribeChat(gameId, (msgs) => {
      setMessages(msgs)
      // Track unread when chat is closed
      if (!isOpenRef.current && msgs.length > prevMsgCountRef.current) {
        setUnreadCount((c) => c + (msgs.length - prevMsgCountRef.current))
      }
      prevMsgCountRef.current = msgs.length
    })
    return unsub
  }, [gameId, subscribed])

  const openChat = useCallback(() => {
    setSubscribed(true)
    setIsOpen(true)
    setUnreadCount(0)
    localStorage.setItem(STORAGE_KEY, 'true')
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
    localStorage.setItem(STORAGE_KEY, 'false')
  }, [])

  const toggleChat = useCallback(() => {
    if (isOpenRef.current) {
      closeChat()
    } else {
      openChat()
    }
  }, [openChat, closeChat])

  const send = useCallback(
    (text: string) => {
      if (!gameId || !text.trim()) return
      sendChatMessage(gameId, text.trim(), displayName, seatIndex).catch((e) => {
        toast.error(`Chat failed: ${(e as Error).message}`)
      })
    },
    [gameId, displayName, seatIndex],
  )

  return {
    messages,
    unreadCount,
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    send,
  }
}
