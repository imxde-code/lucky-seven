export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  id: string
  suit: Suit
  rank: Rank
  isJoker?: boolean
}

export type GameStatus = 'lobby' | 'active' | 'ending' | 'finishing' | 'finished'

export interface LogEntry {
  ts: number
  msg: string
}

export interface GameDoc {
  status: GameStatus
  hostId: string
  createdAt: number
  maxPlayers: number
  currentTurnPlayerId: string | null
  drawPileCount: number
  discardTop: Card | null
  seed: string
  endCalledBy: string | null
  log: LogEntry[]
  turnPhase: 'draw' | 'action' | null
  playerOrder: string[]
  joinCode: string
}

export interface PlayerDoc {
  displayName: string
  seatIndex: number
  connected: boolean
}

export interface PrivatePlayerDoc {
  hand: Card[]
  drawnCard: Card | null
  known: Record<string, Card>
}

export interface PlayerScore {
  playerId: string
  displayName: string
  hand: Card[]
  total: number
  sevens: number
}

export type DrawSource = 'pile' | 'discard'
