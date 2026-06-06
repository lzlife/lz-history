/// <reference types="vite/client" />
/// <reference types="@ztools-center/ztools-api-types" />

declare global {
  interface VscProject {
    name: string
    path: string
  }

  interface BookmarkItem {
    name: string
    url: string
  }

  interface HistoryItem {
    url: string
    title: string
    lastVisitTime: number
  }

  interface Services {
    getHomeDir: () => string
    readProjects: (filePath: string) => VscProject[]
    readZedProjects: (filePath: string) => VscProject[]
    readEdgeBookmarks: (filePath: string) => BookmarkItem[]
    readEdgeHistory: (filePath: string) => HistoryItem[]
    readBookmarks: (filePath: string) => BookmarkItem[]
    readHistory: (filePath: string) => HistoryItem[]
    openWithExe: (exePath: string, projectPath: string) => void
    openWithEdge: (url: string) => void
    openWithUrl: (exePath: string, url: string) => void
    getEdgePath: () => string
  }

  interface Window {
    services: Services
  }
}

export {}
