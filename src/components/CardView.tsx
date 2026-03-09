import { motion } from 'framer-motion'
import type { Card } from '../lib/types'
import { cardDisplay, suitColor } from '../lib/deck'

interface CardViewProps {
  card?: Card | null
  faceUp?: boolean
  known?: boolean
  onClick?: () => void
  disabled?: boolean
  highlight?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizes = {
  sm: 'w-14 h-20 text-xs',
  md: 'w-20 h-28 text-sm',
  lg: 'w-24 h-34 text-base',
}

export default function CardView({
  card,
  faceUp = false,
  known = false,
  onClick,
  disabled = false,
  highlight = false,
  size = 'md',
  label,
}: CardViewProps) {
  const showFace = faceUp && card

  return (
    <motion.div
      whileHover={onClick && !disabled ? { scale: 1.08, y: -4 } : undefined}
      whileTap={onClick && !disabled ? { scale: 0.95 } : undefined}
      onClick={!disabled ? onClick : undefined}
      className={`
        ${sizes[size]}
        relative rounded-xl select-none
        flex flex-col items-center justify-center
        shadow-lg transition-shadow duration-200
        ${onClick && !disabled ? 'cursor-pointer' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${highlight ? 'ring-2 ring-gold ring-offset-2 ring-offset-transparent shadow-gold/30 shadow-xl' : ''}
        ${showFace
          ? 'bg-white border border-slate-200'
          : 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 border border-blue-700'
        }
      `}
    >
      {showFace ? (
        <>
          <span
            className="font-bold leading-tight"
            style={{ color: suitColor(card) }}
          >
            {cardDisplay(card)}
          </span>
          {card.rank === '7' && !card.isJoker && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          )}
        </>
      ) : (
        <div className="card-shimmer absolute inset-0 rounded-xl">
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-2 border-blue-400/30 flex items-center justify-center">
              <span className="text-blue-400/50 font-bold text-lg">7</span>
            </div>
          </div>
        </div>
      )}

      {known && !faceUp && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
          Known
        </span>
      )}

      {label && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 whitespace-nowrap">
          {label}
        </span>
      )}
    </motion.div>
  )
}
