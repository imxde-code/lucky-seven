import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  runTransaction,
  onSnapshot,
  arrayUnion,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db, ensureAuth } from './firebase'
import { buildDeck, shuffleDeck, scoreHand } from './deck'
import type { GameDoc, PlayerDoc, PrivatePlayerDoc, Card, LogEntry, PlayerScore } from './types'
import { nanoid } from 'nanoid'

function gameRef(gameId: string) {
  return doc(db, 'games', gameId)
}
function playerRef(gameId: string, playerId: string) {
  return doc(db, 'games', gameId, 'players', playerId)
}
function privateRef(gameId: string, playerId: string) {
  return doc(db, 'games', gameId, 'private', playerId)
}
function drawPileRef(gameId: string) {
  return doc(db, 'games', gameId, 'internal', 'drawPile')
}

function logEntry(msg: string): LogEntry {
  return { ts: Date.now(), msg }
}

// ─── Create Game ────────────────────────────────────────────────
export async function createGame(displayName: string, maxPlayers: number): Promise<string> {
  const user = await ensureAuth()
  const gameId = nanoid(8)
  const joinCode = nanoid(6).toUpperCase()
  const seed = nanoid(12)

  const gameData: GameDoc = {
    status: 'lobby',
    hostId: user.uid,
    createdAt: Date.now(),
    maxPlayers,
    currentTurnPlayerId: null,
    drawPileCount: 0,
    discardTop: null,
    seed,
    endCalledBy: null,
    log: [logEntry(`Game created by ${displayName}`)],
    turnPhase: null,
    playerOrder: [user.uid],
    joinCode,
  }

  const playerData: PlayerDoc = {
    displayName,
    seatIndex: 0,
    connected: true,
  }

  const privateData: PrivatePlayerDoc = {
    hand: [],
    drawnCard: null,
    known: {},
  }

  await setDoc(gameRef(gameId), gameData)
  await setDoc(playerRef(gameId, user.uid), playerData)
  await setDoc(privateRef(gameId, user.uid), privateData)

  return gameId
}

// ─── Join Game ──────────────────────────────────────────────────
export async function joinGame(gameId: string, displayName: string): Promise<void> {
  const user = await ensureAuth()

  await runTransaction(db, async (tx) => {
    const gameSnap = await tx.get(gameRef(gameId))
    if (!gameSnap.exists()) throw new Error('Game not found')
    const game = gameSnap.data() as GameDoc

    if (game.status !== 'lobby') throw new Error('Game already started')
    if (game.playerOrder.includes(user.uid)) return // Already joined
    if (game.playerOrder.length >= game.maxPlayers) throw new Error('Game is full')

    tx.update(gameRef(gameId), {
      playerOrder: [...game.playerOrder, user.uid],
      log: [...game.log, logEntry(`${displayName} joined`)].slice(-50),
    })

    tx.set(playerRef(gameId, user.uid), {
      displayName,
      seatIndex: game.playerOrder.length,
      connected: true,
    } satisfies PlayerDoc)

    tx.set(privateRef(gameId, user.uid), {
      hand: [],
      drawnCard: null,
      known: {},
    } satisfies PrivatePlayerDoc)
  })
}

// ─── Start Game ─────────────────────────────────────────────────
export async function startGame(gameId: string): Promise<void> {
  const user = await ensureAuth()

  await runTransaction(db, async (tx) => {
    const gameSnap = await tx.get(gameRef(gameId))
    if (!gameSnap.exists()) throw new Error('Game not found')
    const game = gameSnap.data() as GameDoc

    if (game.hostId !== user.uid) throw new Error('Only host can start')
    if (game.status !== 'lobby') throw new Error('Game already started')
    if (game.playerOrder.length < 2) throw new Error('Need at least 2 players')

    const deck = shuffleDeck(buildDeck(), game.seed)
    const playerCount = game.playerOrder.length
    const cardsNeeded = playerCount * 3

    // Deal 3 cards to each player
    for (let i = 0; i < playerCount; i++) {
      const pid = game.playerOrder[i]
      const hand = deck.slice(i * 3, i * 3 + 3)
      tx.update(privateRef(gameId, pid), { hand, drawnCard: null, known: {} })
    }

    // Remaining cards go to draw pile, first card goes to discard
    const remaining = deck.slice(cardsNeeded)
    const discardCard = remaining.shift()!

    // Store draw pile in a private internal doc
    tx.set(drawPileRef(gameId), { cards: remaining })

    tx.update(gameRef(gameId), {
      status: 'active',
      drawPileCount: remaining.length,
      discardTop: discardCard,
      currentTurnPlayerId: game.playerOrder[0],
      turnPhase: 'draw',
      log: [...game.log, logEntry('Game started! Cards dealt.')].slice(-50),
    })
  })
}

// ─── Draw from Pile ─────────────────────────────────────────────
export async function drawFromPile(gameId: string): Promise<void> {
  const user = await ensureAuth()

  await runTransaction(db, async (tx) => {
    const gameSnap = await tx.get(gameRef(gameId))
    const game = gameSnap.data() as GameDoc
    if (game.currentTurnPlayerId !== user.uid) throw new Error('Not your turn')
    if (game.turnPhase !== 'draw') throw new Error('Already drew a card')
    if (game.status !== 'active') throw new Error('Game not active')

    const pileSnap = await tx.get(drawPileRef(gameId))
    const pile = pileSnap.data()?.cards as Card[]
    if (!pile || pile.length === 0) throw new Error('Draw pile is empty')

    const drawn = pile[0]
    const newPile = pile.slice(1)

    tx.update(drawPileRef(gameId), { cards: newPile })
    tx.update(privateRef(gameId, user.uid), { drawnCard: drawn })

    // Read player name
    const playerSnap = await tx.get(playerRef(gameId, user.uid))
    const pName = (playerSnap.data() as PlayerDoc).displayName

    tx.update(gameRef(gameId), {
      drawPileCount: newPile.length,
      turnPhase: 'action',
      log: arrayUnion(logEntry(`${pName} drew from the pile`)),
    })
  })
}

// ─── Take from Discard ──────────────────────────────────────────
export async function takeFromDiscard(gameId: string): Promise<void> {
  const user = await ensureAuth()

  await runTransaction(db, async (tx) => {
    const gameSnap = await tx.get(gameRef(gameId))
    const game = gameSnap.data() as GameDoc
    if (game.currentTurnPlayerId !== user.uid) throw new Error('Not your turn')
    if (game.turnPhase !== 'draw') throw new Error('Already drew a card')
    if (game.status !== 'active') throw new Error('Game not active')
    if (!game.discardTop) throw new Error('No discard card')

    tx.update(privateRef(gameId, user.uid), { drawnCard: game.discardTop })

    const playerSnap = await tx.get(playerRef(gameId, user.uid))
    const pName = (playerSnap.data() as PlayerDoc).displayName

    tx.update(gameRef(gameId), {
      discardTop: null,
      turnPhase: 'action',
      log: arrayUnion(logEntry(`${pName} took from discard`)),
    })
  })
}

// ─── Swap with Slot ─────────────────────────────────────────────
export async function swapWithSlot(gameId: string, slotIndex: number): Promise<void> {
  const user = await ensureAuth()

  await runTransaction(db, async (tx) => {
    const gameSnap = await tx.get(gameRef(gameId))
    const game = gameSnap.data() as GameDoc
    if (game.currentTurnPlayerId !== user.uid) throw new Error('Not your turn')
    if (game.turnPhase !== 'action') throw new Error('Must draw first')

    const privSnap = await tx.get(privateRef(gameId, user.uid))
    const priv = privSnap.data() as PrivatePlayerDoc
    if (!priv.drawnCard) throw new Error('No drawn card')
    if (slotIndex < 0 || slotIndex >= priv.hand.length) throw new Error('Invalid slot')

    const oldCard = priv.hand[slotIndex]
    const newHand = [...priv.hand]
    newHand[slotIndex] = priv.drawnCard

    // Remove knowledge of swapped slot, add knowledge of new card in slot
    const newKnown = { ...priv.known }
    newKnown[String(slotIndex)] = priv.drawnCard
    // The player knows what they put there

    tx.update(privateRef(gameId, user.uid), {
      hand: newHand,
      drawnCard: null,
      known: newKnown,
    })

    const playerSnap = await tx.get(playerRef(gameId, user.uid))
    const pName = (playerSnap.data() as PlayerDoc).displayName

    // Advance turn
    const nextPlayer = getNextPlayer(game.playerOrder, user.uid)

    const updates: Record<string, unknown> = {
      discardTop: oldCard,
      currentTurnPlayerId: nextPlayer,
      turnPhase: 'draw',
      log: arrayUnion(logEntry(`${pName} swapped card #${slotIndex + 1}`)),
    }

    // Check if draw pile is empty -> end game
    if (game.drawPileCount === 0) {
      updates.status = 'finishing' as unknown
    }

    tx.update(gameRef(gameId), updates)

    // Check if the game should end after this turn
    await checkGameEnd(tx, gameId, game)
  })
}

// ─── Discard Drawn Card ─────────────────────────────────────────
export async function discardDrawn(gameId: string): Promise<void> {
  const user = await ensureAuth()

  await runTransaction(db, async (tx) => {
    const gameSnap = await tx.get(gameRef(gameId))
    const game = gameSnap.data() as GameDoc
    if (game.currentTurnPlayerId !== user.uid) throw new Error('Not your turn')
    if (game.turnPhase !== 'action') throw new Error('Must draw first')

    const privSnap = await tx.get(privateRef(gameId, user.uid))
    const priv = privSnap.data() as PrivatePlayerDoc
    if (!priv.drawnCard) throw new Error('No drawn card')

    tx.update(privateRef(gameId, user.uid), { drawnCard: null })

    const playerSnap = await tx.get(playerRef(gameId, user.uid))
    const pName = (playerSnap.data() as PlayerDoc).displayName

    const nextPlayer = getNextPlayer(game.playerOrder, user.uid)

    tx.update(gameRef(gameId), {
      discardTop: priv.drawnCard,
      currentTurnPlayerId: nextPlayer,
      turnPhase: 'draw',
      log: arrayUnion(logEntry(`${pName} discarded`)),
    })

    await checkGameEnd(tx, gameId, game)
  })
}

// ─── Use Jack Peek ──────────────────────────────────────────────
export async function useJackPeek(gameId: string, slotIndex: number): Promise<Card> {
  const user = await ensureAuth()
  let peekedCard: Card | null = null

  await runTransaction(db, async (tx) => {
    const gameSnap = await tx.get(gameRef(gameId))
    const game = gameSnap.data() as GameDoc
    if (game.currentTurnPlayerId !== user.uid) throw new Error('Not your turn')
    if (game.turnPhase !== 'action') throw new Error('Must draw first')

    const privSnap = await tx.get(privateRef(gameId, user.uid))
    const priv = privSnap.data() as PrivatePlayerDoc
    if (!priv.drawnCard) throw new Error('No drawn card')
    if (priv.drawnCard.rank !== 'J' || priv.drawnCard.isJoker) throw new Error('Drawn card is not a Jack')

    peekedCard = priv.hand[slotIndex]
    const newKnown = { ...priv.known }
    newKnown[String(slotIndex)] = peekedCard

    tx.update(privateRef(gameId, user.uid), {
      drawnCard: null,
      known: newKnown,
    })

    const playerSnap = await tx.get(playerRef(gameId, user.uid))
    const pName = (playerSnap.data() as PlayerDoc).displayName

    const nextPlayer = getNextPlayer(game.playerOrder, user.uid)

    tx.update(gameRef(gameId), {
      discardTop: priv.drawnCard,
      currentTurnPlayerId: nextPlayer,
      turnPhase: 'draw',
      log: arrayUnion(logEntry(`${pName} used Jack to peek at card #${slotIndex + 1}`)),
    })

    await checkGameEnd(tx, gameId, game)
  })

  return peekedCard!
}

// ─── Call End ────────────────────────────────────────────────────
export async function callEnd(gameId: string): Promise<void> {
  const user = await ensureAuth()

  await runTransaction(db, async (tx) => {
    const gameSnap = await tx.get(gameRef(gameId))
    const game = gameSnap.data() as GameDoc
    if (game.status !== 'active') throw new Error('Game not active')
    if (!game.playerOrder.includes(user.uid)) throw new Error('Not in game')

    const playerSnap = await tx.get(playerRef(gameId, user.uid))
    const pName = (playerSnap.data() as PlayerDoc).displayName

    // Calculate scores
    const scores = await calculateScores(tx, gameId, game.playerOrder)

    tx.update(gameRef(gameId), {
      status: 'finished',
      endCalledBy: user.uid,
      currentTurnPlayerId: null,
      turnPhase: null,
      log: arrayUnion(logEntry(`${pName} called END! Revealing all cards...`)),
    })

    // Store scores in results doc
    tx.set(doc(db, 'games', gameId, 'internal', 'results'), { scores })
  })
}

// ─── Helper: Calculate Scores ───────────────────────────────────
async function calculateScores(
  tx: Parameters<Parameters<typeof runTransaction>[1]>[0],
  gameId: string,
  playerOrder: string[]
): Promise<PlayerScore[]> {
  const scores: PlayerScore[] = []

  for (const pid of playerOrder) {
    const privSnap = await tx.get(privateRef(gameId, pid))
    const priv = privSnap.data() as PrivatePlayerDoc
    const playerSnap = await tx.get(playerRef(gameId, pid))
    const player = playerSnap.data() as PlayerDoc

    const { total, sevens } = scoreHand(priv.hand)
    scores.push({
      playerId: pid,
      displayName: player.displayName,
      hand: priv.hand,
      total,
      sevens,
    })
  }

  // Sort: lowest total first, then most sevens
  scores.sort((a, b) => {
    if (a.total !== b.total) return a.total - b.total
    return b.sevens - a.sevens
  })

  return scores
}

// ─── Helper: Check Game End ─────────────────────────────────────
async function checkGameEnd(
  tx: Parameters<Parameters<typeof runTransaction>[1]>[0],
  gameId: string,
  game: GameDoc
) {
  if (game.drawPileCount <= 0) {
    const scores = await calculateScores(tx, gameId, game.playerOrder)
    tx.update(gameRef(gameId), {
      status: 'finished',
      endCalledBy: null,
      currentTurnPlayerId: null,
      turnPhase: null,
    })
    tx.set(doc(db, 'games', gameId, 'internal', 'results'), { scores })
  }
}

// ─── Helper: Next Player ────────────────────────────────────────
function getNextPlayer(playerOrder: string[], currentId: string): string {
  const idx = playerOrder.indexOf(currentId)
  return playerOrder[(idx + 1) % playerOrder.length]
}

// ─── Subscriptions ──────────────────────────────────────────────
export function subscribeGame(gameId: string, cb: (game: GameDoc) => void): Unsubscribe {
  return onSnapshot(gameRef(gameId), (snap) => {
    if (snap.exists()) cb(snap.data() as GameDoc)
  })
}

export function subscribePlayers(
  gameId: string,
  cb: (players: Record<string, PlayerDoc>) => void
): Unsubscribe {
  return onSnapshot(collection(db, 'games', gameId, 'players'), (snap) => {
    const players: Record<string, PlayerDoc> = {}
    snap.forEach((d) => {
      players[d.id] = d.data() as PlayerDoc
    })
    cb(players)
  })
}

export function subscribePrivate(
  gameId: string,
  playerId: string,
  cb: (priv: PrivatePlayerDoc) => void
): Unsubscribe {
  return onSnapshot(privateRef(gameId, playerId), (snap) => {
    if (snap.exists()) cb(snap.data() as PrivatePlayerDoc)
  })
}

export async function getResults(gameId: string): Promise<PlayerScore[]> {
  const snap = await getDoc(doc(db, 'games', gameId, 'internal', 'results'))
  if (!snap.exists()) return []
  return snap.data().scores as PlayerScore[]
}

export async function findGameByCode(joinCode: string): Promise<string | null> {
  const q = query(
    collection(db, 'games'),
    where('joinCode', '==', joinCode),
    where('status', '==', 'lobby'),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs[0].id
}

export async function updatePresence(gameId: string, connected: boolean): Promise<void> {
  const user = await ensureAuth()
  await updateDoc(playerRef(gameId, user.uid), { connected })
}
