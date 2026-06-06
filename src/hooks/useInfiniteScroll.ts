import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const PAGE_SIZE = 20

export function useInfiniteScroll<T>(items: T[], scrollRef?: React.RefObject<HTMLElement | null>) {
  const [page, setPage] = useState(1)

  const displayItems = useMemo(() => items.slice(0, page * PAGE_SIZE), [items, page])
  const hasMore = displayItems.length < items.length
  const hasMoreRef = useRef(hasMore)
  hasMoreRef.current = hasMore

  useEffect(() => {
    const el = scrollRef?.current
    if (!el) return

    const onScroll = () => {
      if (!hasMoreRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = el
      if (scrollHeight - scrollTop - clientHeight < 80) {
        setPage((p) => p + 1)
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRef, items.length])

  useEffect(() => {
    if (!hasMore) return
    const raf = requestAnimationFrame(() => {
      const el = scrollRef?.current
      if (!el) return
      const { scrollHeight, clientHeight } = el
      if (scrollHeight <= clientHeight) {
        setPage((p) => p + 1)
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [hasMore, scrollRef, displayItems.length])

  const reset = useCallback(() => {
    setPage(1)
  }, [])

  return { displayItems, hasMore, reset }
}
