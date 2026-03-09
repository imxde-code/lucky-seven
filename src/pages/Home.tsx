import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { createGame, joinGame, findGameByCode } from '../lib/gameService'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [busy, setBusy] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Enter your name')
    if (!user) return toast.error('Authenticating...')
    setBusy(true)
    try {
      const gameId = await createGame(name.trim(), maxPlayers)
      navigate(`/lobby/${gameId}`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handleJoin = async () => {
    if (!name.trim()) return toast.error('Enter your name')
    if (!joinCode.trim()) return toast.error('Enter a join code')
    if (!user) return toast.error('Authenticating...')
    setBusy(true)
    try {
      const gameId = await findGameByCode(joinCode.trim().toUpperCase())
      if (!gameId) {
        toast.error('Game not found. Check the code and try again.')
        setBusy(false)
        return
      }
      await joinGame(gameId, name.trim())
      navigate(`/lobby/${gameId}`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-2"
          >
            Lucky Seven
          </motion.h1>
          <p className="text-slate-400 text-sm">The card game where 7 means zero</p>
        </div>

        {/* Card container */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          {mode === 'menu' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <button
                onClick={() => setMode('create')}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Create Game
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Join Game
              </button>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <button
                onClick={() => setMode('menu')}
                className="text-slate-400 hover:text-slate-200 text-sm cursor-pointer"
              >
                &larr; Back
              </button>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-2 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Max Players</label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMaxPlayers(n)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        maxPlayers === n
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={busy}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all cursor-pointer"
              >
                {busy ? 'Creating...' : 'Create Game'}
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <button
                onClick={() => setMode('menu')}
                className="text-slate-400 hover:text-slate-200 text-sm cursor-pointer"
              >
                &larr; Back
              </button>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-2 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Join Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  maxLength={6}
                  className="w-full px-4 py-2 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors uppercase tracking-widest text-center text-lg"
                />
              </div>

              <button
                onClick={handleJoin}
                disabled={busy}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all cursor-pointer"
              >
                {busy ? 'Joining...' : 'Join Game'}
              </button>
            </motion.div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          2-6 players &middot; Lowest score wins &middot; Sevens are worth zero!
        </p>
      </motion.div>
    </div>
  )
}
