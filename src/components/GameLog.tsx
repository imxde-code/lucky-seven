import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LogEntry } from '../lib/types'

interface GameLogProps {
  log: LogEntry[]
}

export default function GameLog({ log }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 p-3 max-h-48 overflow-y-auto">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Game Log</h3>
      <AnimatePresence initial={false}>
        {log.slice(-20).map((entry, i) => (
          <motion.div
            key={`${entry.ts}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-slate-400 py-0.5 border-b border-slate-800/50 last:border-0"
          >
            {entry.msg}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}
