import { useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LogEntry, PlayerDoc } from '../lib/types'
import { renderLogMessage } from '../lib/logRenderer'
import type { LogPosition } from '../hooks/useLogPosition'

interface GameLogProps {
  log: LogEntry[]
  players: Record<string, PlayerDoc>
  /** Display mode — 'bottom' (default) or 'left' (sidebar) */
  position?: LogPosition
}

export default function GameLog({ log, players, position = 'bottom' }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  // Build player info list for name matching
  const playerInfos = useMemo(() =>
    Object.values(players).map((p) => ({
      displayName: p.displayName,
      seatIndex: p.seatIndex,
    })),
    [players],
  )

  const isLeft = position === 'left'

  return (
    <div
      className={`bg-slate-900/60 rounded-xl border border-slate-700/50 p-3 overflow-y-auto ${
        isLeft ? 'h-full' : 'max-h-48'
      }`}
    >
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Game Log</h3>
      <AnimatePresence initial={false}>
        {log.slice(-30).map((entry, i) => (
          <motion.div
            key={`${entry.ts}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-slate-400 py-1 border-b border-slate-800/50 last:border-0 leading-relaxed"
          >
            {renderLogMessage(entry.msg, playerInfos)}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}
