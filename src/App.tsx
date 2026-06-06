import { useEffect, useState } from 'react'
import Ide from './Ide'
import Bookmarks from './Bookmarks'
import HistoryCmp from './History'
import Setting from './Setting'

export default function App() {
  const [enterAction, setEnterAction] = useState<any>({})
  const [route, setRoute] = useState('')
  const [targetTab, setTargetTab] = useState<'ide' | 'bookmarks' | 'history'>('ide')

  useEffect(() => {
    window.ztools.onPluginEnter((action) => {
      setRoute(action.code)
      setEnterAction(action)
    })
    window.ztools.onPluginOut(() => {
      setRoute('')
    })
  }, [])

  const goToSetting = (tab?: 'ide' | 'bookmarks' | 'history') => {
    setTargetTab(tab || 'ide')
    setRoute('setting')
  }

  if (route === 'ide') return <Ide enterAction={enterAction} onGoToSetting={() => goToSetting('ide')} />
  if (route === 'bookmarks') return <Bookmarks enterAction={enterAction} onGoToSetting={() => goToSetting('bookmarks')} />
  if (route === 'history') return <HistoryCmp enterAction={enterAction} onGoToSetting={() => goToSetting('history')} />
  if (route === 'setting') return <Setting enterAction={enterAction} initialTab={targetTab} />

  return null
}
