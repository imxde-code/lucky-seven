import { motion, AnimatePresence } from 'framer-motion'
import CardView from './CardView'
import type { Card } from '../lib/types'

interface DrawnCardModalProps {
  card: Card | null
  onSwap: (slotIndex: number) => void
  onDiscard: () => void
  onUsePower: () => void
  isJack: boolean
}

export default function DrawnCardModal({
  card,
  onSwap,
  onDiscard,
  onUsePower,
  isJack,
}: DrawnCardModalProps) {
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-center text-lg font-semibold text-slate-200 mb-4">
              You drew:
            </h3>

            <div className="flex justify-center mb-6">
              <CardView card={card} faceUp size="lg" />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 text-center mb-3">
                Choose: swap with one of your cards, or discard this card.
              </p>

              <div className="flex gap-2 justify-center mb-3">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => onSwap(i)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Swap #{i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={onDiscard}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Discard
              </button>

              {isJack && (
                <button
                  onClick={onUsePower}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Use Jack Power: Peek at one of your cards
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
