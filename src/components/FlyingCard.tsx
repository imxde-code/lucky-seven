import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { cardDisplay, suitColor } from '../lib/deck'
import type { Card } from '../lib/types'

/** Convert hex/rgba color string to rgba with custom alpha */
function hexToRgba(color: string, alpha: number): string {
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`
  }
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

interface FlyingCardProps {
  from: DOMRect
  to: DOMRect
  faceUp: boolean
  card?: Card | null
  ownerColor?: string
  onComplete: () => void
  duration?: number
  /** If true, use a simple fade+slide instead of arc (reduced motion) */
  reduced?: boolean
}

/**
 * Renders an animated card that flies from one position to another
 * along a smooth curved arc path. Renders via portal into document.body.
 *
 * v1.4.1: Premium motion — higher-res bezier (16 steps), GPU-accelerated
 * via translate3d, subtle overshoot settle, enhanced shadow during flight.
 * Reduced motion: simple fade + short slide (250ms).
 */
export default function FlyingCard({
  from,
  to,
  faceUp,
  card,
  ownerColor,
  onComplete,
  duration = 1.4,
  reduced = false,
}: FlyingCardProps) {
  const width = 56  // sm card width
  const height = 80 // sm card height

  // Compute start/end centers
  const sx = from.x + from.width / 2 - width / 2
  const sy = from.y + from.height / 2 - height / 2
  const ex = to.x + to.width / 2 - width / 2
  const ey = to.y + to.height / 2 - height / 2

  // Midpoint with upward arc offset — proportional to distance
  const mx = (sx + ex) / 2
  const dist = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2)
  const arcHeight = Math.min(dist * 0.4, 100)
  const my = Math.min(sy, ey) - arcHeight

  // Generate high-res keyframe positions along quadratic bezier (16 steps)
  const keyframes = useMemo(() => {
    if (reduced) {
      return { xs: [sx, ex], ys: [sy, ey] }
    }
    const steps = 16
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      // Quadratic bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
      const x = (1 - t) ** 2 * sx + 2 * (1 - t) * t * mx + t ** 2 * ex
      const y = (1 - t) ** 2 * sy + 2 * (1 - t) * t * my + t ** 2 * ey
      xs.push(x)
      ys.push(y)
    }
    return { xs, ys }
  }, [sx, sy, mx, my, ex, ey, reduced])

  // Scale keyframes — subtle lift in middle, tiny overshoot at end
  const scaleFrames = reduced
    ? [1, 1]
    : [1, 1.03, 1.06, 1.1, 1.12, 1.13, 1.12, 1.1, 1.08, 1.05, 1.03, 1.01, 1, 0.98, 1.01, 1, 1]

  // Opacity — stay fully visible, subtle settle at end
  const opacityFrames = reduced
    ? [0.7, 1]
    : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.97, 0.9]

  const reducedDuration = 0.25

  return createPortal(
    <motion.div
      initial={{
        position: 'fixed',
        left: keyframes.xs[0],
        top: keyframes.ys[0],
        width,
        height,
        opacity: reduced ? 0.7 : 1,
        scale: 1,
        zIndex: 9999,
      }}
      animate={{
        left: keyframes.xs,
        top: keyframes.ys,
        scale: scaleFrames,
        opacity: opacityFrames,
      }}
      transition={reduced
        ? { duration: reducedDuration, ease: 'easeOut' }
        : { duration, ease: [0.16, 1, 0.3, 1] } // custom cubic — fast start, gentle settle
      }
      onAnimationComplete={onComplete}
      className="pointer-events-none"
      style={{
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.45)) drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
        willChange: 'transform, left, top',
      }}
    >
      <div
        className={`w-full h-full rounded-xl shadow-xl flex items-center justify-center ${
          faceUp && card
            ? 'bg-white border border-slate-200'
            : ownerColor
              ? 'border border-white/15'
              : 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 border-2 border-blue-700'
        }`}
        style={{
          ...(!faceUp && ownerColor ? {
            background: `linear-gradient(145deg, ${hexToRgba(ownerColor, 0.75)} 0%, ${hexToRgba(ownerColor, 0.5)} 40%, ${hexToRgba(ownerColor, 0.6)} 100%)`,
          } : {}),
        }}
      >
        {faceUp && card ? (
          <span
            className="font-bold text-xs"
            style={{ color: suitColor(card) }}
          >
            {cardDisplay(card)}
          </span>
        ) : (
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: ownerColor ? 'rgba(255,255,255,0.35)' : 'rgba(96,165,250,0.3)' }}
          >
            <span
              className="font-bold text-sm"
              style={{ color: ownerColor ? 'rgba(255,255,255,0.6)' : 'rgba(96,165,250,0.5)' }}
            >
              7
            </span>
          </div>
        )}
      </div>
    </motion.div>,
    document.body,
  )
}
