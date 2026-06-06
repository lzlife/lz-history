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
import { FolderOpenIcon, SearchXIcon } from 'lucide-react'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useListNavigation } from '../hooks/useListNavigation'
import { useTabNavigation } from '../hooks/useTabNavigation'

interface IdeProps {
  enterAction: any
  onGoToSetting: () => void
}

const IDE_NAMES: Record<string, string> = {
  vscode: 'VS Code',
  zed: 'Zed'
}

export default function Ide({ enterAction, onGoToSetting }: IdeProps) {
  const [projects, setProjects] = useState<VscProject[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [ides, setIdes] = useState<{ id: string; name: string }[]>([])
  const [activeIde, setActiveIde] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = window.ztools.dbStorage.getItem('ideOrder')
    const defaultOrder = Object.keys(IDE_NAMES)
    const order = stored ? JSON.parse(stored) : defaultOrder
    // 合并所有已注册 IDE，确保新添加的 IDE 不会因旧存储数据被遗漏
    const merged = [...new Set([...order, ...defaultOrder])]
    const configured = merged.filter((id: string) => window.ztools.dbStorage.getItem(`${id}ProjectsPath`))
    if (configured.length === 0) {
      setError('请先在设置中配置 IDE 项目文件路径')
      setLoading(false)
      return
    }
    const list = configured.map((id: string) => ({
      id,
      name: IDE_NAMES[id] || id
    }))
    setIdes(list)
    setActiveIde(list[0].id)
  }, [])

  useEffect(() => {
    if (!activeIde) return
    reset()
    const projectsPath = window.ztools.dbStorage.getItem(`${activeIde}ProjectsPath`)
    if (!projectsPath) {
      setError('请先在设置中配置项目文件路径')
      setLoading(false)
      return
    }
    setSearch('')
    try {
      const ideReaders: Record<string, (path: string) => VscProject[]> = {
        vscode: (p) => window.services.readProjects(p),
        zed: (p) => window.services.readZedProjects(p),
      }
      const reader = ideReaders[activeIde]
      if (!reader) throw new Error(`不支持的 IDE: ${activeIde}`)
      const result = reader(projectsPath)
      setProjects(result)
      setError('')
    } catch (err: any) {
      setError(err.message || '读取失败')
    }
    setLoading(false)
  }, [activeIde]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.ztools.setSubInput(
      (input) => setSearch(input.text),
      '搜索最近项目...'
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

  const filtered = useMemo(() => {
    if (!search) return projects
    const kw = search.toLowerCase()
    return projects.filter(
      (p) => p.name.toLowerCase().includes(kw) || p.path.toLowerCase().includes(kw)
    )
  }, [projects, search])

  const { displayItems, hasMore, reset } = useInfiniteScroll(filtered, scrollRef)

  useEffect(() => {
    reset()
  }, [search, reset])

  const handleOpenProject = useCallback((project: VscProject) => {
    const exePath = window.ztools.dbStorage.getItem(`${activeIde}ExePath`)
    if (!exePath) {
      setError('请先在设置中配置程序文件路径')
      return
    }
    window.services.openWithExe(exePath, project.path)
    window.ztools.outPlugin()
  }, [activeIde])

  const { selectedIndex, handleItemClick } = useListNavigation({
    items: displayItems,
    onSelect: handleOpenProject,
    containerRef
  })

  const handleTabKeys = useTabNavigation({
    tabs: ides,
    activeTab: activeIde,
    onTabChange: setActiveIde,
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
            <FolderOpenIcon className="h-6 w-6" />
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
          <EmptyTitle>{search ? '未找到匹配的项目' : '暂无最近项目'}</EmptyTitle>
          <EmptyDescription>
            {search ? '尝试其他关键词搜索' : '在 IDE 中打开过项目后会出现在这里'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div ref={containerRef} tabIndex={-1} className="h-screen flex flex-col outline-none" onKeyDown={handleTabKeys}>
      {ides.length > 1 && (
        <div className="flex gap-2 px-4 py-3 border-b border-border">
          {ides.map(ide => (
            <button
              key={ide.id}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeIde === ide.id
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent/50'
              }`}
              onClick={() => setActiveIde(ide.id)}
            >
              {ide.name}
            </button>
          ))}
        </div>
      )}
      <div className="px-4 py-3 text-sm text-muted-foreground border-b border-border">
        显示 {displayItems.length} 条，共 {filtered.length} 条结果
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <ItemGroup>
          {displayItems.map((project, i) => (
            <Item
              key={`${project.path}-${i}`}
              data-index={i}
              className={`cursor-pointer ${selectedIndex === i ? 'bg-accent' : 'hover:bg-accent'}`}
              onClick={() => handleItemClick(i)}
            >
              <ItemContent>
                <ItemTitle>{project.name}</ItemTitle>
                <ItemDescription>{project.path}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    </div>
  )
}
