import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RELEASES, CURRENT_VERSION } from '../constants/releases'

interface PatchNotesModalProps {
  open: boolean
  onClose: () => void
}

export default function PatchNotesModal({ open, onClose }: PatchNotesModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            className="bg-slate-800 border border-slate-600 rounded-2xl p-5 max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-amber-300">Patch Notes</h3>
                <p className="text-[10px] text-slate-500">Lucky Seven {CURRENT_VERSION}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/80 hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-sm"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Version tabs */}
            <div className="flex gap-1.5 mb-3 shrink-0">
              {RELEASES.map((r, i) => (
                <button
                  key={r.version}
                  onClick={() => setSelectedIdx(i)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedIdx === i
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {r.version}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {RELEASES[selectedIdx] && (
                <div>
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-slate-200">
                      {RELEASES[selectedIdx].title}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {RELEASES[selectedIdx].date}
                    </p>
                  </div>
                  {RELEASES[selectedIdx].sections.map((section, si) => (
                    <div key={si} className="mb-3">
                      <h5 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-1.5">
                        {section.heading}
                      </h5>
                      <ul className="space-y-1.5 mb-2">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-slate-300">
                            <span className="text-amber-400 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — credits + trademark */}
            <div className="mt-4 pt-3 border-t border-slate-700/50 shrink-0">
              <p className="text-[10px] text-slate-500 text-center">
                Created by Kamal Hazriq &middot; Idea by Imaduddin
              </p>
              <p className="text-[9px] text-slate-600 text-center mt-1">
                Lucky Seven&trade; is a fan-made game implementation.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
