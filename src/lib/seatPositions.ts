/**
 * getSeatPositions — returns { left, top } (%) for each seat around a poker-table ellipse.
 *
 * v1.4.1: Improved geometry — hand-tuned positions for 1–7 opponents,
 * min distance guarantees, clamping to avoid header/pile/local-player overlap.
 *
 * Local player is always fixed at bottom-center (not returned here).
 *
 * @param otherCount  Number of OTHER players (excluding local player)
 * @returns Array of { left, top } percentage positions for otherPlayers[0..N-1]
 */
export interface SeatPosition {
  left: number  // percentage (0–100)
  top: number   // percentage (0–100)
}

// Safe bounds — reserve header, sides, and local player zone
const MIN_TOP = 8
const MAX_TOP = 78
const MIN_LEFT = 8
const MAX_LEFT = 92

const CX = 50
const CY = 46

/** Clamp a seat position to safe bounds */
function clamp(pos: SeatPosition): SeatPosition {
  return {
    left: Math.max(MIN_LEFT, Math.min(MAX_LEFT, pos.left)),
    top: Math.max(MIN_TOP, Math.min(MAX_TOP, pos.top)),
  }
}

export function getSeatPositions(otherCount: number): SeatPosition[] {
  if (otherCount === 0) return []

  // ─── Hand-tuned layouts for common player counts ───

  if (otherCount === 1) {
    return [clamp({ left: CX, top: 10 })]
  }

  if (otherCount === 2) {
    return [
      clamp({ left: 22, top: 22 }),
      clamp({ left: 78, top: 22 }),
    ]
  }

  if (otherCount === 3) {
    return [
      clamp({ left: 15, top: 28 }),
      clamp({ left: CX, top: 10 }),
      clamp({ left: 85, top: 28 }),
    ]
  }

  if (otherCount === 4) {
    return [
      clamp({ left: 10, top: 38 }),
      clamp({ left: 28, top: 14 }),
      clamp({ left: 72, top: 14 }),
      clamp({ left: 90, top: 38 }),
    ]
  }

  if (otherCount === 5) {
    return [
      clamp({ left: 8, top: 42 }),
      clamp({ left: 22, top: 14 }),
      clamp({ left: CX, top: 9 }),
      clamp({ left: 78, top: 14 }),
      clamp({ left: 92, top: 42 }),
    ]
  }

  if (otherCount === 6) {
    return [
      clamp({ left: 8, top: 46 }),
      clamp({ left: 14, top: 22 }),
      clamp({ left: 38, top: 9 }),
      clamp({ left: 62, top: 9 }),
      clamp({ left: 86, top: 22 }),
      clamp({ left: 92, top: 46 }),
    ]
  }

  if (otherCount === 7) {
    return [
      clamp({ left: 8, top: 50 }),
      clamp({ left: 10, top: 26 }),
      clamp({ left: 30, top: 9 }),
      clamp({ left: CX, top: 8 }),
      clamp({ left: 70, top: 9 }),
      clamp({ left: 90, top: 26 }),
      clamp({ left: 92, top: 50 }),
    ]
  }

  // ─── Fallback: parametric elliptical distribution ───
  const positions: SeatPosition[] = []
  const rx = 42
  const ry = 36
  const padAngle = Math.max(0.06, 0.15 - otherCount * 0.01)
  const startAngle = Math.PI - padAngle
  const endAngle = padAngle

  for (let i = 0; i < otherCount; i++) {
    const t = i / (otherCount - 1)
    const angle = startAngle - t * (startAngle - endAngle)
    const left = CX + rx * Math.cos(angle)
    const top = CY - ry * Math.sin(angle)
    positions.push(clamp({ left, top }))
  }

  return positions
}

/** Local player fixed position — bottom center */
export const LOCAL_SEAT: SeatPosition = { left: 50, top: 94 }
