import { useCallback, useEffect, useMemo, useState } from 'react'

import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Alert, AlertDescription } from '../components/ui/alert'
import { ScrollArea } from '../components/ui/scroll-area'
import { XIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react'

const ALL_IDES = [
  { id: 'vscode', name: 'VS Code' },
  { id: 'zed', name: 'Zed' }
]

const ALL_BROWSERS = [
  { id: 'edge', name: 'Edge' },
  { id: 'tabbit', name: 'Tabbit' }
]

const SIDEBAR_TABS = [
  { key: 'ide', label: 'IDE' },
  { key: 'bookmarks', label: '书签' },
  { key: 'history', label: '历史记录' }
] as const

type ActiveTab = (typeof SIDEBAR_TABS)[number]['key']

function getHome() {
  return window.services.getHomeDir()
}

function getPlatform() {
  return window.services.getPlatform()
}

interface SettingProps {
  enterAction: any
  initialTab?: ActiveTab
}

export default function Setting({ enterAction, initialTab }: SettingProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab || 'ide')
  const [values, setValues] = useState<Record<string, string>>({})
  const [ideOrder, setIdeOrder] = useState<string[]>(['vscode', 'zed'])
  const [bookmarkOrder, setBookmarkOrder] = useState<string[]>(['edge', 'tabbit'])
  const [historyOrder, setHistoryOrder] = useState<string[]>(['edge', 'tabbit'])
  const allKeys = useMemo(() => {
    const keys: string[] = []
    for (const ide of ALL_IDES) {
      keys.push(`${ide.id}ProjectsPath`, `${ide.id}ExePath`)
    }
    for (const b of ALL_BROWSERS) {
      keys.push(`${b.id}BookmarksPath`, `${b.id}HistoryPath`, `${b.id}ExePath`)
    }
    return keys
  }, [])

  useEffect(() => {
    const initial: Record<string, string> = {}
    for (const key of allKeys) {
      const val = window.ztools.dbStorage.getItem(key)
      if (val) initial[key] = val
    }
    setValues(initial)

    const ideOrd = window.ztools.dbStorage.getItem('ideOrder')
    if (ideOrd) {
      const parsed = JSON.parse(ideOrd)
      const allIdeIds = ALL_IDES.map(i => i.id)
      // 合并所有已注册 IDE，确保新添加的 IDE 出现在配置列表中
      const merged = [...new Set([...parsed, ...allIdeIds])]
      setIdeOrder(merged)
      if (merged.length !== parsed.length) {
        window.ztools.dbStorage.setItem('ideOrder', JSON.stringify(merged))
      }
    }

    const bmOrder = window.ztools.dbStorage.getItem('bookmarkOrder')
    if (bmOrder) setBookmarkOrder(JSON.parse(bmOrder))

    const histOrder = window.ztools.dbStorage.getItem('historyOrder')
    if (histOrder) setHistoryOrder(JSON.parse(histOrder))
  }, [allKeys])

  const handleSelect = useCallback((key: string) => {
    const files = window.ztools.showOpenDialog({
      title: '选择文件',
      properties: key.endsWith('ExePath') && getPlatform() === 'darwin' ? ['openFile', 'openDirectory'] : ['openFile']
    })
    if (!files?.length) return
    const filePath = files[0]
    setValues(prev => ({ ...prev, [key]: filePath }))
    window.ztools.dbStorage.setItem(key, filePath)
  }, [])

  const handleClear = useCallback((key: string) => {
    setValues(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    window.ztools.dbStorage.removeItem(key)
  }, [])

  const handleMove = useCallback((orderKey: string, index: number, direction: 'up' | 'down') => {
    const setter = orderKey === 'ideOrder' ? setIdeOrder
      : orderKey === 'bookmarkOrder' ? setBookmarkOrder
      : setHistoryOrder
    setter(prev => {
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev
      const next = [...prev]
      const swap = direction === 'up' ? index - 1 : index + 1
      ;[next[index], next[swap]] = [next[swap], next[index]]
      window.ztools.dbStorage.setItem(orderKey, JSON.stringify(next))
      return next
    })
  }, [])

  const renderField = (key: string, label: string, hint: string) => (
    <div key={key} className="space-y-2">
      <span className="text-base font-medium">{label}</span>
      {hint && (
        <Alert>
          <AlertDescription>{hint}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center gap-2">
        <Input
          readOnly
          value={values[key] || ''}
          placeholder="点击选择文件"
          className="flex-1 cursor-pointer text-base"
          onClick={() => handleSelect(key)}
        />
        {values[key] && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-10 w-10 hover:text-red-500 hover:bg-red-500/10"
            onClick={() => handleClear(key)}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )

  const renderIdeCard = (id: string, order: string[], index: number) => {
    const ide = ALL_IDES.find(i => i.id === id)
    if (!ide) return null
    const home = getHome()
    const platform = getPlatform()
    const projectsPathKey = `${id}ProjectsPath`
    const exePathKey = `${id}ExePath`
    const vscodeProjectHint = platform === 'darwin'
      ? `文件通常放在 ${home}/Library/Application Support/Code/User/globalStorage/state.vscdb`
      : `文件通常放在 ${home}\\.vscode-shared\\sharedStorage\\state.vscdb`
    const vscodeExeHint = platform === 'darwin'
      ? '程序通常为 /Applications/Visual Studio Code.app'
      : `文件通常放在 ${home}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe`
    const zedProjectHint = platform === 'darwin'
      ? `文件通常放在 ${home}/Library/Application Support/Zed/db/0-stable/db.sqlite（预览版为 0-preview）`
      : `文件通常放在 ${home}\\AppData\\Local\\Zed\\db\\0-stable\\db.sqlite（预览版为 0-preview）`
    const zedExeHint = platform === 'darwin'
      ? '程序通常为 /Applications/Zed.app'
      : `通常为 ${home}\\AppData\\Local\\Zed\\Zed.exe`

    return (
      <div key={`ide-${id}`} className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">{ide.name}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={index === 0}
              onClick={() => handleMove('ideOrder', index, 'up')}
            >
              <ChevronUpIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={index === order.length - 1}
              onClick={() => handleMove('ideOrder', index, 'down')}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {id === 'vscode' && renderField(projectsPathKey, '项目文件', vscodeProjectHint)}
        {id === 'vscode' && renderField(exePathKey, '程序文件', vscodeExeHint)}
        {id === 'zed' && renderField(projectsPathKey, '项目文件', zedProjectHint)}
        {id === 'zed' && renderField(exePathKey, '程序文件', zedExeHint)}
      </div>
    )
  }

  const renderBrowserCard = (
    id: string,
    order: string[],
    orderKey: string,
    index: number,
    pathSuffix: string,
    featureLabel: string
  ) => {
    const browser = ALL_BROWSERS.find(b => b.id === id)
    if (!browser) return null
    const home = getHome()
    const platform = getPlatform()
    const isEdge = id === 'edge'
    const dataPathKey = `${id}${pathSuffix}`
    const exePathKey = `${id}ExePath`

    const dataHint = isEdge
      ? platform === 'darwin'
        ? `文件通常放在 ${home}/Library/Application Support/Microsoft Edge/Default/${pathSuffix === 'BookmarksPath' ? 'Bookmarks' : 'History'}`
        : `文件通常放在 ${home}\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\${pathSuffix === 'BookmarksPath' ? 'Bookmarks' : 'History'}`
      : ''

    const exeHint = isEdge
      ? platform === 'darwin'
        ? '程序通常为 /Applications/Microsoft Edge.app'
        : '文件通常放在 C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
      : ''

    return (
      <div key={`${orderKey}-${id}`} className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">{browser.name}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={index === 0}
              onClick={() => handleMove(orderKey, index, 'up')}
            >
              <ChevronUpIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={index === order.length - 1}
              onClick={() => handleMove(orderKey, index, 'down')}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {renderField(dataPathKey, `${featureLabel}文件`, dataHint)}
        {renderField(exePathKey, '程序文件', exeHint)}
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <div className="w-52 flex-shrink-0 border-r border-border p-4 space-y-1">
        <h2 className="text-lg font-semibold px-3 pb-3">插件设置</h2>
        {SIDEBAR_TABS.map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'secondary' : 'ghost'}
            className="w-full justify-start text-base"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {activeTab === 'ide' && ideOrder.map((id, i) => renderIdeCard(id, ideOrder, i))}
          {activeTab === 'bookmarks' && bookmarkOrder.map((id, i) => renderBrowserCard(id, bookmarkOrder, 'bookmarkOrder', i, 'BookmarksPath', '书签'))}
          {activeTab === 'history' && historyOrder.map((id, i) => renderBrowserCard(id, historyOrder, 'historyOrder', i, 'HistoryPath', '历史记录'))}
        </div>
      </ScrollArea>
    </div>
  )
}
