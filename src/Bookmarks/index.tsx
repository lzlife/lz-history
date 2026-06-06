import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription
} from '../components/ui/item'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../components/ui/empty'
import { Button } from '../components/ui/button'
import { BookmarkIcon, SearchXIcon } from 'lucide-react'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useListNavigation } from '../hooks/useListNavigation'
import { useTabNavigation } from '../hooks/useTabNavigation'

interface BookmarksProps {
  enterAction: any
  onGoToSetting: () => void
}

const BROWSER_NAMES: Record<string, string> = {
  edge: 'Edge',
  tabbit: 'Tabbit'
}

export default function Bookmarks({ enterAction, onGoToSetting }: BookmarksProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [browsers, setBrowsers] = useState<{ id: string; name: string }[]>([])
  const [activeBrowser, setActiveBrowser] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const order = JSON.parse(window.ztools.dbStorage.getItem('bookmarkOrder') || '["edge","tabbit"]')
    const configured = order.filter((id: string) => window.ztools.dbStorage.getItem(`${id}BookmarksPath`))
    if (configured.length === 0) {
      setError('请先在设置中配置书签文件路径')
      setLoading(false)
      return
    }
    const list = configured.map((id: string) => ({
      id,
      name: BROWSER_NAMES[id] || id
    }))
    setBrowsers(list)
    setActiveBrowser(list[0].id)
  }, [])

  const filtered = useMemo(() => {
    if (!search) return bookmarks
    const kw = search.toLowerCase()
    return bookmarks.filter(
      (b) => b.name.toLowerCase().includes(kw) || b.url.toLowerCase().includes(kw)
    )
  }, [bookmarks, search])

  const { displayItems, hasMore, reset } = useInfiniteScroll(filtered, scrollRef)

  useEffect(() => {
    if (!activeBrowser) return
    reset()
    const bookmarksPath = window.ztools.dbStorage.getItem(`${activeBrowser}BookmarksPath`)
    if (!bookmarksPath) {
      setError('请先在设置中配置书签文件路径')
      setLoading(false)
      return
    }
    setSearch('')
    try {
      const result = window.services.readBookmarks(bookmarksPath)
      setBookmarks(result)
      setError('')
    } catch (err: any) {
      setError(err.message || '读取失败')
    }
    setLoading(false)
  }, [activeBrowser, reset])

  useEffect(() => {
    window.ztools.setSubInput(
      (input) => setSearch(input.text),
      '搜索书签...'
    )
    return () => {
      window.ztools.removeSubInput()
    }
  }, [])

  useEffect(() => {
    if (!loading && !error) {
      containerRef.current?.focus()
    }
  }, [loading, error])

  useEffect(() => {
    reset()
  }, [search, reset])

  const handleOpenBookmark = useCallback((item: BookmarkItem) => {
    const exePath = window.ztools.dbStorage.getItem(`${activeBrowser}ExePath`)
    if (!exePath) {
      setError('请先在设置中配置程序文件路径')
      return
    }
    window.services.openWithUrl(exePath, item.url)
    window.ztools.outPlugin()
  }, [activeBrowser])

  const { selectedIndex, handleItemClick } = useListNavigation({
    items: displayItems,
    onSelect: handleOpenBookmark,
    containerRef
  })

  const handleTabKeys = useTabNavigation({
    tabs: browsers,
    activeTab: activeBrowser,
    onTabChange: setActiveBrowser,
    disabled: !!search,
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-base text-muted-foreground">
        加载中...
      </div>
    )
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookmarkIcon className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>配置未完成</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
          <Button variant="outline" size="sm" onClick={onGoToSetting} className="mt-3">
            前往设置
          </Button>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!filtered.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>{search ? '未找到匹配的书签' : '暂无书签'}</EmptyTitle>
          <EmptyDescription>
            {search ? '尝试其他关键词搜索' : '在浏览器中添加书签后会出现在这里'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div ref={containerRef} tabIndex={-1} className="h-screen flex flex-col outline-none" onKeyDown={handleTabKeys}>
      {browsers.length > 1 && (
        <div className="flex gap-2 px-4 py-3 border-b border-border">
          {browsers.map(b => (
            <button
              key={b.id}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeBrowser === b.id
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent/50'
              }`}
              onClick={() => setActiveBrowser(b.id)}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}
      <div className="px-4 py-3 text-sm text-muted-foreground border-b border-border">
        显示 {displayItems.length} 条，共 {filtered.length} 条结果
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <ItemGroup>
          {displayItems.map((item, i) => (
            <Item
              key={`${item.url}-${i}`}
              data-index={i}
              className={`cursor-pointer ${selectedIndex === i ? 'bg-accent' : 'hover:bg-accent'}`}
              onClick={() => handleItemClick(i)}
            >
              <ItemContent>
                <ItemTitle>{item.name}</ItemTitle>
                <ItemDescription>{item.url}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    </div>
  )
}
