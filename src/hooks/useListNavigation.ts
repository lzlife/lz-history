import { useCallback, useEffect, useRef, useState } from 'react'

export function useListNavigation<T>({
  items,
  onSelect,
  containerRef
}: {
  items: T[]
  onSelect: (item: T) => void
  containerRef?: React.RefObject<HTMLElement | null>
}) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const itemsRef = useRef(items)
  const selectedIndexRef = useRef(selectedIndex)
  const prevLengthRef = useRef(items.length)
  itemsRef.current = items
  selectedIndexRef.current = selectedIndex

  useEffect(() => {
    const prevLength = prevLengthRef.current
    prevLengthRef.current = items.length

    if (items.length === 0) {
      setSelectedIndex(-1)
    } else if (prevLength > 0 && items.length > prevLength) {
      // 触底加载（列表变长）→ 保持当前选中位置
      setSelectedIndex((prev) => Math.min(prev, items.length - 1))
    } else {
      // 首次加载或搜索过滤 → 选中第一项
      setSelectedIndex(0)
    }
  }, [items])

  useEffect(() => {
    if (selectedIndex < 0 || selectedIndex >= items.length) return
    const el = containerRef?.current
    if (!el) return
    const target = el.querySelector(`[data-index="${selectedIndex}"]`)
    if (target) target.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex, containerRef])

  useEffect(() => {
    const el = containerRef?.current
    if (!el) return

    const handler = (e: KeyboardEvent) => {
      if (itemsRef.current.length === 0) return
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, itemsRef.current.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          const idx = selectedIndexRef.current
          if (idx >= 0 && idx < itemsRef.current.length) {
            onSelect(itemsRef.current[idx])
          }
          break
      }
    }

    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [onSelect, containerRef, items.length])

  const handleItemClick = useCallback((index: number) => {
    setSelectedIndex(index)
    if (index >= 0 && index < itemsRef.current.length) {
      onSelect(itemsRef.current[index])
    }
  }, [onSelect])

  return { selectedIndex, handleItemClick }
}
