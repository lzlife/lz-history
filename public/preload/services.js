const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { execFile } = require('node:child_process')

function copyToTemp(sourcePath) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ztools-'))
  const tmpFile = path.join(tmpDir, path.basename(sourcePath))
  fs.copyFileSync(sourcePath, tmpFile)
  return { tmpFile, tmpDir }
}

function cleanupTemp(tmpDir) {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  } catch {}
}

let SQL = null
const initSqlJs = require('sql.js')
initSqlJs({
  locateFile: (file) => path.join(__dirname, 'node_modules/sql.js/dist/', file)
}).then((sqlModule) => {
  SQL = sqlModule
})

function ensureSql() {
  if (!SQL) throw new Error('SQL.js 正在初始化，请稍后重试')
}

function findEdgePath() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  const localAppData = process.env.LOCALAPPDATA || ''
  const localPath = path.join(localAppData, 'Microsoft\\Edge\\Application\\msedge.exe')
  if (fs.existsSync(localPath)) return localPath
  throw new Error('未找到 Microsoft Edge，请确认已安装')
}

function findVscSharedPath() {
  const sharedPath = path.join(os.homedir(), '.vscode-shared', 'sharedStorage', 'state.vscdb')
  return fs.existsSync(sharedPath) ? sharedPath : null
}

window.services = {
  getHomeDir() {
    return os.homedir()
  },
  queryRecentOpened(sqlDb) {
    const result = sqlDb.exec(
      "SELECT [value] FROM ItemTable WHERE [key] = 'history.recentlyOpenedPathsList'"
    )
    if (!result.length || !result[0].values.length) return null
    const raw = JSON.parse(result[0].values[0][0])
    const projects = []
    for (const entry of raw.entries || raw) {
      const uri = entry.folderUri || ''
      if (!uri) continue
      const filePath2 = uri.replace(/^file:\/\/\//, '').replace(/^file:\/\//, '')
      const decodedPath = decodeURIComponent(filePath2).replace(/\//g, path.sep)
      const name = path.basename(decodedPath)
      projects.push({ name, path: decodedPath })
    }
    return projects
  },

  readFromDb(filePath) {
    const { tmpFile, tmpDir } = copyToTemp(filePath)
    try {
      const buffer = fs.readFileSync(tmpFile)
      const db = new SQL.Database(buffer)
      const result = this.queryRecentOpened(db)
      db.close()
      return result
    } finally {
      cleanupTemp(tmpDir)
    }
  },

  readProjects(filePath) {
    ensureSql()
    let result = this.readFromDb(filePath)
    if (result) return result
    const sharedPath = findVscSharedPath()
    if (sharedPath) {
      result = this.readFromDb(sharedPath)
      if (result) return result
    }
    return []
  },

  queryZedWorkspaces(sqlDb) {
    const result = sqlDb.exec(
      "SELECT paths, timestamp FROM workspaces WHERE remote_connection_id IS NULL ORDER BY timestamp DESC"
    )
    if (!result.length || !result[0].values.length) return []

    const projects = []
    const seen = new Set()
    for (const row of result[0].values) {
      const pathsBlob = row[0]
      if (!pathsBlob) continue

      const decodedPaths = this._decodeZedPaths(pathsBlob)
      for (const decodedPath of decodedPaths) {
        if (!decodedPath || seen.has(decodedPath)) continue
        seen.add(decodedPath)
        const name = path.basename(decodedPath)
        projects.push({ name, path: decodedPath })
      }
    }
    return projects
  },

  _decodeZedPaths(blob) {
    let text = ''
    if (typeof blob === 'string') {
      text = blob
    } else if (blob instanceof Uint8Array || Array.isArray(blob)) {
      text = new TextDecoder('utf-8').decode(blob)
    }
    text = text.trim()
    if (!text) return []

    // Try JSON array format (serde_json serialization)
    if (text.startsWith('[')) {
      try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          return parsed.filter(p => typeof p === 'string' && p.length > 0)
        }
      } catch {}
    }

    // Try null-byte separated (bincode Vec<String> serialization)
    if (text.includes('\0')) {
      return text.split('\0').filter(s => s.trim().length > 0)
    }

    // Single path
    return [text]
  },

  readZedProjects(filePath) {
    ensureSql()
    const { tmpFile, tmpDir } = copyToTemp(filePath)
    try {
      const buffer = fs.readFileSync(tmpFile)
      const db = new SQL.Database(buffer)
      const result = this.queryZedWorkspaces(db)
      db.close()
      return result
    } finally {
      cleanupTemp(tmpDir)
    }
  },

  readEdgeBookmarks(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    const items = []
    function walk(node) {
      if (!node) return
      if (node.type === 'url' && node.url) {
        items.push({ name: node.name || node.url, url: node.url })
      }
      if (node.children) {
        for (const child of node.children) walk(child)
      }
    }
    walk(data.roots?.bookmark_bar)
    walk(data.roots?.other)
    return items
  },

  readEdgeHistory(filePath) {
    ensureSql()
    const { tmpFile, tmpDir } = copyToTemp(filePath)
    try {
      const buffer = fs.readFileSync(tmpFile)
      const db = new SQL.Database(buffer)
      const result = db.exec(
        'SELECT url, title, last_visit_time FROM urls ORDER BY last_visit_time DESC'
      )
      db.close()
      if (!result.length || !result[0].values.length) return []
      return result[0].values.map((row) => ({
        url: row[0],
        title: row[1] || row[0],
        lastVisitTime: row[2]
      }))
    } finally {
      cleanupTemp(tmpDir)
    }
  },

  openWithExe(exePath, projectPath) {
    execFile(exePath, [projectPath])
  },

  openWithEdge(url) {
    const edgePath = findEdgePath()
    execFile(edgePath, [url])
  },

  getEdgePath() {
    return findEdgePath()
  },

  readBookmarks(filePath) {
    return this.readEdgeBookmarks(filePath)
  },

  readHistory(filePath) {
    return this.readEdgeHistory(filePath)
  },

  openWithUrl(exePath, url) {
    execFile(exePath, [url])
  }
}
