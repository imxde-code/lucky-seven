import { useState, useCallback } from 'react'

const STORAGE_KEY = 'lucky7_layout'
export type LayoutMode = 'classic' | 'table'

function getStoredLayout(): LayoutMode {
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'table') return 'table'
  return 'classic'
}

export function useLayout() {
  const [layout, setLayoutState] = useState<LayoutMode>(getStoredLayout)

  const setLayout = useCallback((mode: LayoutMode) => {
    localStorage.setItem(STORAGE_KEY, mode)
    setLayoutState(mode)
  }, [])

  const toggle = useCallback(() => {
    setLayout(layout === 'classic' ? 'table' : 'classic')
  }, [layout, setLayout])

  return { layout, setLayout, toggle }
}
