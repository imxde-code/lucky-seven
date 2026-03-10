import { type ReactNode } from 'react'
import { getSeatColor } from './playerColors'

interface PlayerInfo {
  displayName: string
  seatIndex: number
}

// ─── Power label map (Section 4) ────────────────────────────
const POWER_KEYWORDS: Record<string, string> = {
  'peek all': 'PEEK ALL',
  'peek_all_three_of_your_cards': 'PEEK ALL',
  'peek_all': 'PEEK ALL',
  'as peek all': 'PEEK ALL',
  'peek 1': 'PEEK',
  'peek_one_of_your_cards': 'PEEK',
  'peek_one': 'PEEK',
  'as peek': 'PEEK',
  'as swap': 'SWAP',
  'swap_one_to_one': 'SWAP',
  'as lock': 'LOCK',
  'lock_one_card': 'LOCK',
  'as unlock': 'UNLOCK',
  'unlock_one_locked_card': 'UNLOCK',
  'as rearrange': 'CHAOS',
  'rearrange_cards': 'CHAOS',
}

// Build a regex for power keywords — match longest first
const powerKeywordsSorted = Object.keys(POWER_KEYWORDS).sort((a, b) => b.length - a.length)
const powerPattern = new RegExp(
  `(${powerKeywordsSorted.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'gi',
)

/** Power label chip component */
function PowerChip({ label }: { label: string }) {
  return (
    <span className="inline-block px-1.5 py-0 rounded text-[10px] font-extrabold uppercase tracking-wide leading-relaxed bg-violet-900/40 text-violet-300 border border-violet-700/40">
      {label}
    </span>
  )
}

/**
 * Renders a log message with:
 * 1. Player names highlighted as colored chips (word-boundary safe)
 * 2. Power keywords rendered as bold uppercase badges
 *
 * v1.4.1: Uses word boundaries for short name safety, power keyword formatting.
 */
export function renderLogMessage(
  msg: string,
  playerMap: PlayerInfo[],
): ReactNode {
  if (playerMap.length === 0 && !powerPattern.test(msg)) return msg
  // Reset regex lastIndex since we use 'g' flag
  powerPattern.lastIndex = 0

  // Sort by name length descending so longer names match first
  const sorted = [...playerMap].sort(
    (a, b) => b.displayName.length - a.displayName.length,
  )

  // Build a name → seatIndex lookup
  const nameToSeat: Record<string, number> = {}
  for (const p of sorted) {
    nameToSeat[p.displayName] = p.seatIndex
  }

  // ─── Step 1: Split on player names using word boundaries ───
  // Use word boundaries (\b) to prevent matching "a" inside "swapped"
  const escaped = sorted.map((p) =>
    p.displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  )

  // For short names (≤2 chars), require word boundary on both sides
  // For longer names, the existing approach is fine but we add boundaries for safety
  const namePatternStr = escaped
    .map((name) => `\\b${name}\\b`)
    .join('|')

  let parts: string[]
  if (sorted.length > 0 && namePatternStr) {
    const namePattern = new RegExp(`(${namePatternStr})`, 'g')
    parts = msg.split(namePattern)
  } else {
    parts = [msg]
  }

  // ─── Step 2: For each part, check if it's a name or contains power keywords ───
  const result: ReactNode[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue

    // Check if this part is a player name
    const seat = nameToSeat[part]
    if (seat !== undefined) {
      const color = getSeatColor(seat)
      result.push(
        <span
          key={`name-${i}`}
          className="inline-block px-1.5 py-0 rounded text-[10px] font-bold leading-relaxed"
          style={{
            backgroundColor: color.bg,
            color: color.text,
            minWidth: '1.2em',
            textAlign: 'center',
          }}
        >
          {part}
        </span>,
      )
      continue
    }

    // Not a name — check for power keywords within this text segment
    powerPattern.lastIndex = 0
    const powerParts = part.split(powerPattern)

    if (powerParts.length === 1) {
      // No power keywords found
      result.push(<span key={`text-${i}`}>{part}</span>)
    } else {
      // Has power keywords — render them as chips
      for (let j = 0; j < powerParts.length; j++) {
        const pp = powerParts[j]
        if (!pp) continue
        const normalized = pp.toLowerCase()
        const powerLabel = POWER_KEYWORDS[normalized]
        if (powerLabel) {
          result.push(<PowerChip key={`power-${i}-${j}`} label={powerLabel} />)
        } else {
          result.push(<span key={`text-${i}-${j}`}>{pp}</span>)
        }
      }
    }
  }

  return result.length > 0 ? result : msg
}
