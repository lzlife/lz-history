import { useCallback } from 'react'

export function useTabNavigation<T extends { id: string }>({
  tabs,
  activeTab,
  onTabChange,
  disabled = false,
}: {
  tabs: T[]
  activeTab: string
  onTabChange: (id: string) => void
  disabled?: boolean
}) {
  return useCallback((e: React.KeyboardEvent) => {
    if (disabled || tabs.length <= 1) return
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return

    const idx = tabs.findIndex(t => t.id === activeTab)
    if (idx < 0) return
    if (e.key === 'ArrowLeft' && idx === 0) return
    if (e.key === 'ArrowRight' && idx === tabs.length - 1) return

    e.preventDefault()
    const dir = e.key === 'ArrowLeft' ? -1 : 1
    onTabChange(tabs[idx + dir].id)
  }, [tabs, activeTab, onTabChange, disabled])
}
