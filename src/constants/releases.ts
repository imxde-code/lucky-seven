export const CURRENT_VERSION = 'v1.3'

export interface ReleaseNote {
  version: string
  title: string
  date: string
  sections: { heading: string; items: string[] }[]
}

export const RELEASES: ReleaseNote[] = [
  {
    version: 'v1.3',
    title: 'Table & Effects Update',
    date: '10 March 2026',
    sections: [
      {
        heading: 'Table Layout',
        items: [
          'New poker-table layout: toggle between Classic and Table views during gameplay',
          'Players arranged in a circular formation around the table with your hand at the bottom',
          'Draw and discard piles centered on the table surface',
          'Flying card animations travel accurately to seat positions in both layouts',
        ],
      },
      {
        heading: 'Visual Effects',
        items: [
          'Card back shimmer now uses the card owner\'s seat color',
          'Active player panels glow softly with their assigned color during their turn',
          'Slot-level effect overlays: swapped, locked, and unlocked cards pulse briefly with the actor\'s color',
          'Discarded/swapped cards animate face-up to the discard pile for all viewers',
        ],
      },
      {
        heading: 'Gameplay',
        items: [
          'Pile draws can now be dismissed — minimize the modal and resume via the banner',
          'Discard draws show an explicit "Cancel Take" button to return the card',
          'Chat opens by default on desktop; preference saved in localStorage',
          'Chat rate limit enforced at 1 message per 2 seconds',
        ],
      },
      {
        heading: 'Quality of Life',
        items: [
          'Layout preference persists across sessions via localStorage',
          'Chat text limit aligned to 300 characters (matching security rules)',
          'All new animations respect reduced motion preferences',
        ],
      },
    ],
  },
  {
    version: 'v1.2',
    title: 'Polish & Presence Update',
    date: '10 March 2026',
    sections: [
      {
        heading: 'Animations',
        items: [
          'Flying cards now travel along smooth curved arcs with drop shadows',
          'Enhanced action highlights: stronger glow with expanding pulse ring effect',
          'All motion effects respect reduced motion preferences',
        ],
      },
      {
        heading: 'Chat & Social',
        items: [
          'Chat bubbles: see other players\' latest messages floating above their panels',
          'Bubbles auto-fade after 4 seconds — no extra database usage',
          'Hardened chat security: messages validated server-side (userId + text length)',
        ],
      },
      {
        heading: 'Gameplay Clarity',
        items: [
          'Queue numbers (#1, #2, #3...) now shown beside each player\'s name',
          '"Pile draw — no undo" label on drawn card modal for pile draws',
          'Resume banner: tap to return to your drawn card after using a power',
        ],
      },
      {
        heading: 'Quality of Life',
        items: [
          'Feedback form now available on the Home screen (was lobby only)',
          '5-second cooldown between feedback submissions to prevent spam',
          'Strengthened Firestore security rules across all collections',
        ],
      },
    ],
  },
  {
    version: 'v1.1',
    title: 'Signal & Flow Update',
    date: '10 March 2026',
    sections: [
      {
        heading: 'Gameplay',
        items: [
          'Support for 5-8 players with deck multiplier (1x, 1.5x, 2x decks)',
          'Cards drawn from the pile can no longer be undone — commit to your draw!',
          'Power guide: tap the ? button to see what each power card does this game',
          'Cancel flow fix: pressing "Back" on a power modal returns to your drawn card without wasting it',
        ],
      },
      {
        heading: 'Visuals & Animations',
        items: [
          'Player colors: each seat gets a unique color shown on card backs, panels, and log names',
          'Flying card animations: watch cards move between piles and players in real time',
          'Action highlights: a temporary glow appears on player panels after they take an action',
          'Improved game log with colored player name chips for easy scanning',
        ],
      },
      {
        heading: 'Social',
        items: [
          'In-game chat with quick emoji buttons and player-colored message bubbles',
          'Chat available in both the lobby and during gameplay',
          'Unread message badge on the chat button',
          'Turn queue: see the full turn order and who\'s up next at a glance',
        ],
      },
      {
        heading: 'Quality of Life',
        items: [
          'Feedback form: send feedback directly from the lobby with star ratings',
          'Patch notes viewer: tap the version label to see what\'s new',
          'Performance improvements: bounded logs, throttled presence writes, lazy chat subscription',
          'Game-end analytics for win tracking',
        ],
      },
    ],
  },
  {
    version: 'v1.0',
    title: 'Lucky Seven \u2014 Launch',
    date: '9 March 2026',
    sections: [
      {
        heading: 'Core Game',
        items: [
          'Draw from the pile or discard, swap with your hand, or discard to end your turn',
          'Call "End Game" to trigger the final round \u2014 every other player gets one more turn',
          'Lowest total score wins, with bonus recognition for holding 7s',
        ],
      },
      {
        heading: 'Power Cards',
        items: [
          '6 customizable powers assigned to 10, J, Q, K, and Joker',
          'Peek: look at one of your face-down cards',
          'Peek All: reveal all three of your cards to yourself',
          'Swap: exchange any two players\' unlocked cards',
          'Lock: protect any card from being swapped',
          'Unlock: free a locked card',
          'Rearrange: randomly shuffle another player\'s unlocked cards',
        ],
      },
      {
        heading: 'Multiplayer',
        items: [
          'Real-time multiplayer powered by Firebase',
          'Lobby system with 6-character join codes \u2014 share and play instantly',
          '2-8 players per game',
        ],
      },
      {
        heading: 'Interface',
        items: [
          'Mobile-first responsive design with touch-friendly tap targets',
          'Three themes: Blue, Dark, and Light',
          'Sound effects and haptic vibration feedback',
          'Reduced motion support (follows system preference, or toggle manually)',
          'Results screen with podium display and multi-winner tie handling',
        ],
      },
      {
        heading: 'Credits',
        items: [
          'Created by Kamal Hazriq',
          'Idea by Imaduddin',
          'Deployed on GitHub Pages with automated CI/CD',
          'Anonymous authentication \u2014 no sign-up required',
        ],
      },
    ],
  },
]
