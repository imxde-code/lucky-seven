export const CURRENT_VERSION = 'v1.1'

export interface ReleaseNote {
  version: string
  title: string
  date: string
  changes: string[]
}

export const RELEASES: ReleaseNote[] = [
  {
    version: 'v1.1',
    title: 'Signal & Flow Update',
    date: '9 March 2026',
    changes: [
      'Player colors: each seat gets a unique color for card backs, panels, and log names',
      'Flying card animations: see cards move between piles and players',
      'Turn queue: compact display showing who plays next',
      'Power guide: ? button shows this game\'s power assignments',
      'Cancel flow fix: power modal "Back" returns to drawn card without consuming it',
      'Pile draw lock: cards drawn from the pile cannot be undone',
      'Improved log messages with colored player name chips',
      'Action highlights: temporary glow on player panels after actions',
      '5-8 player support with deck multiplier (1×, 1.5×, 2×)',
      'In-game chat with emoji and player-colored bubbles',
      'Feedback form with email notifications',
      'Firestore quota optimizations: bounded logs, throttled presence, lazy subscriptions',
      'Game-end analytics summary for win tracking',
    ],
  },
  {
    version: 'v1.0',
    title: 'Lucky Seven — Launch',
    date: '7 March 2026',
    changes: [
      'Core gameplay: draw, swap, discard, end game, reveal hands',
      '6 customizable power cards: Peek, Peek All, Swap, Lock, Unlock, Rearrange',
      'Real-time multiplayer via Firebase Firestore with anonymous auth',
      'Mobile-friendly responsive UI with touch-friendly buttons',
      'Theme system: Blue, Dark, and Light themes',
      'Sound effects (WebAudio) and haptic vibration',
      'Reduced motion support (system/on/off)',
      'Lobby system with 6-character join codes',
      'Lock mechanics with metadata (who locked which card)',
      'Results screen with multi-winner tie handling',
      'GitHub Pages deployment via GitHub Actions CI/CD',
    ],
  },
]
