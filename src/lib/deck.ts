import seedrandom from 'seedrandom'
import type { Card, Suit, Rank, DeckSize } from './types'

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

/**
 * Build a single standard deck of 52 cards with a deckIndex prefix for unique IDs.
 */
function buildSingleDeck(deckIndex: number): Card[] {
  const prefix = deckIndex === 0 ? '' : `d${deckIndex}_`
  const cards: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ id: `${prefix}${rank}_${suit}`, suit, rank })
    }
  }
  return cards
}

/**
 * Build a deck supporting multiplier:
 * - 1 deck = 52 cards + jokers
 * - 1.5 decks = 1 full deck + 27 deterministic cards from a 2nd deck
 * - 2 decks = 2 full decks with unique IDs
 *
 * Jokers are added per jokerCount (scaled by deckSize for 2-deck).
 */
export function buildDeck(jokerCount: number = 2, deckSize: DeckSize = 1, seed?: string): Card[] {
  const cards: Card[] = []

  if (deckSize === 1) {
    cards.push(...buildSingleDeck(0))
  } else if (deckSize === 2) {
    cards.push(...buildSingleDeck(0))
    cards.push(...buildSingleDeck(1))
  } else {
    // 1.5 decks: 1 full deck + 27 deterministic cards from 2nd deck
    cards.push(...buildSingleDeck(0))
    const secondDeck = buildSingleDeck(1)
    // Use seed to deterministically pick 27 cards from 2nd deck
    const rng = seedrandom(seed ?? 'half-deck')
    const shuffled = [...secondDeck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    cards.push(...shuffled.slice(0, 27))
  }

  // Add jokers (scale for double deck)
  const clampedCount = Math.max(1, Math.min(4, jokerCount))
  const jokerTotal = deckSize === 2 ? clampedCount * 2 : clampedCount
  for (let i = 1; i <= jokerTotal; i++) {
    cards.push({ id: `Joker_${i}`, suit: 'hearts', rank: 'A', isJoker: true })
  }

  return cards
}

export function shuffleDeck(cards: Card[], seed: string): Card[] {
  const rng = seedrandom(seed)
  const shuffled = [...cards]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function cardValue(card: Card): number {
  if (card.isJoker) return 10
  switch (card.rank) {
    case 'A': return 1
    case '7': return 0
    case 'J': case 'Q': case 'K': return 10
    default: return parseInt(card.rank, 10)
  }
}

export function scoreHand(hand: Card[]): { total: number; sevens: number } {
  let total = 0
  let sevens = 0
  for (const card of hand) {
    total += cardValue(card)
    if (card.rank === '7' && !card.isJoker) sevens++
  }
  return { total, sevens }
}

export function cardDisplay(card: Card): string {
  if (card.isJoker) return 'Joker'
  const suitSymbols: Record<Suit, string> = {
    hearts: '\u2665',
    diamonds: '\u2666',
    clubs: '\u2663',
    spades: '\u2660',
  }
  return `${card.rank}${suitSymbols[card.suit]}`
}

export function suitColor(card: Card): string {
  if (card.isJoker) return '#a855f7'
  return card.suit === 'hearts' || card.suit === 'diamonds' ? '#ef4444' : '#1e293b'
}
