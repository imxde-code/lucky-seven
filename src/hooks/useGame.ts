import { useState, useEffect } from 'react'
import type { GameDoc, PlayerDoc, PrivatePlayerDoc } from '../lib/types'
import { subscribeGame, subscribePlayers, subscribePrivate } from '../lib/gameService'

export function useGame(gameId: string | undefined, playerId: string | undefined) {
  const [game, setGame] = useState<GameDoc | null>(null)
  const [players, setPlayers] = useState<Record<string, PlayerDoc>>({})
  const [privateState, setPrivateState] = useState<PrivatePlayerDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) return

    let initialLoad = true
    const unsub1 = subscribeGame(gameId, (g) => {
      setGame(g)
      if (initialLoad) {
        setLoading(false)
        initialLoad = false
      }
    })

    const unsub2 = subscribePlayers(gameId, (p) => {
      setPlayers(p)
    })

    return () => {
      unsub1()
      unsub2()
    }
  }, [gameId])

  useEffect(() => {
    if (!gameId || !playerId) return
    const unsub = subscribePrivate(gameId, playerId, (p) => {
      setPrivateState(p)
    })
    return unsub
  }, [gameId, playerId])

  return { game, players, privateState, loading }
}
