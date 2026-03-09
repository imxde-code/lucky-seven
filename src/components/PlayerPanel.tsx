import { motion } from 'framer-motion'
import CardView from './CardView'
import type { Card, PrivatePlayerDoc } from '../lib/types'

interface PlayerPanelProps {
  displayName: string
  isCurrentTurn: boolean
  isLocalPlayer: boolean
  privateState?: PrivatePlayerDoc | null
  seatIndex: number
  connected: boolean
  onSlotClick?: (slotIndex: number) => void
  slotClickable?: boolean
}

export default function PlayerPanel({
  displayName,
  isCurrentTurn,
  isLocalPlayer,
  privateState,
  connected,
  onSlotClick,
  slotClickable = false,
}: PlayerPanelProps) {
  const hand = privateState?.hand ?? []
  const known = privateState?.known ?? {}

  return (
    <motion.div
      layout
      className={`
        relative rounded-2xl p-4 backdrop-blur-sm
        ${isCurrentTurn
          ? 'bg-emerald-900/40 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
          : 'bg-slate-800/40 border border-slate-700/50'
        }
        ${isLocalPlayer ? 'ring-1 ring-amber-500/30' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
        <span className={`font-semibold text-sm ${isLocalPlayer ? 'text-amber-300' : 'text-slate-200'}`}>
          {displayName}
          {isLocalPlayer && <span className="text-xs text-amber-500/70 ml-1">(You)</span>}
        </span>
        {isCurrentTurn && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-auto text-xs font-medium text-emerald-400"
          >
            Playing...
          </motion.span>
        )}
      </div>

      <div className="flex gap-2 justify-center">
        {[0, 1, 2].map((i) => {
          const card = hand[i] as Card | undefined
          const knownCard = known[String(i)]
          const isKnown = !!knownCard

          if (isLocalPlayer && isKnown) {
            return (
              <CardView
                key={i}
                card={knownCard}
                faceUp
                known
                size="md"
                onClick={slotClickable ? () => onSlotClick?.(i) : undefined}
                highlight={slotClickable}
                label={`#${i + 1}`}
              />
            )
          }

          return (
            <CardView
              key={i}
              card={card}
              faceUp={false}
              size={isLocalPlayer ? 'md' : 'sm'}
              onClick={slotClickable && isLocalPlayer ? () => onSlotClick?.(i) : undefined}
              highlight={slotClickable && isLocalPlayer}
              label={isLocalPlayer ? `#${i + 1}` : undefined}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
