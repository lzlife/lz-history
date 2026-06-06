# AGENTS.md

## What this is

ZTools host plugin — quick-launch panel for IDE recent projects, browser bookmarks, and browser history inside the ZTools launcher. React 19 + Vite 6 + TypeScript. ESM package (`"type": "module"`).

## Commands

```bash
npm run dev        # Vite dev server (port 5173, used by ZTools dev mode)
npm run build      # tsc && vite build
```

No test/lint/format scripts. Run `npx tsc --noEmit` to typecheck manually.

## Architecture

- **Host dependency**: `window.services` (fs, process) and `window.ztools` are injected by the ZTools preload script (`public/preload/services.js`). These APIs do not exist in a plain browser.
- **Plugin manifest**: `public/plugin.json` declares 4 features: `ide`, `bookmarks`, `history`, `setting` — each with its own search commands.
- **Preload (CommonJS)**: `public/preload/services.js` reads data from SQLite (VS Code `state.vscdb` / Zed `db.sqlite`) and JSON (Edge Bookmarks). Uses `sql.js` for SQLite, direct `fs.readFileSync` for JSON.
- **Entry point**: `src/main.tsx` → `src/App.tsx` (routes by `action.code`: `ide` / `bookmarks` / `history` / `setting`)
- **Data flow**: Preload (Node) → `window.services` → React components via `useEffect` reads
- **UI**: Custom components in `src/components/ui/`, each view in its own directory (`Ide/`, `Bookmarks/`, `History/`, `Setting/`)

## Key files

| Path | Purpose |
|------|---------|
| `public/plugin.json` | Plugin manifest — features, commands, preload path |
| `public/preload/services.js` | Backend — reads VS Code/Zed SQLite, Edge bookmarks/history; opens external programs |
| `src/App.tsx` | Root router — maps `action.code` to view component |
| `src/Ide/index.tsx` | IDE recent projects list (VS Code + Zed), tab switching, search, keyboard nav |
| `src/Bookmarks/index.tsx` | Browser bookmarks list (Edge, Tabbit), tab switching, search |
| `src/History/index.tsx` | Browser history list (Edge, Tabbit), tab switching, search |
| `src/Setting/index.tsx` | Configuration — DB file paths, executable paths, ordering for IDE/browser items |
| `src/env.d.ts` | Type declarations for `VscProject`, `BookmarkItem`, `HistoryItem`, `Services`, `Window` |
| `src/hooks/useListNavigation.ts` | Reusable keyboard list navigation (ArrowUp/Down/Enter) |
| `src/hooks/useTabNavigation.ts` | Reusable keyboard tab navigation (ArrowLeft/Right) |
| `src/hooks/useInfiniteScroll.ts` | Scroll-to-bottom pagination (20 items per page) |

## Views

### IDE (`src/Ide/index.tsx`)

- Shows recent projects from configured IDEs (VS Code, Zed)
- Multiple IDEs → tab bar at top with ArrowLeft/Right keyboard switching
- Keyboard navigation: ArrowUp/Down to select, Enter to open, ArrowLeft/Right to switch IDE tab
- Search filters by project name or path
- Opens project via `window.services.openWithExe(exePath, projectPath)`

### Bookmarks (`src/Bookmarks/index.tsx`)

- Shows bookmarks from configured browsers (Edge, Tabbit)
- Same tab + list keyboard navigation pattern as IDE view
- Opens URL via `window.services.openWithUrl(exePath, url)`

### History (`src/History/index.tsx`)

- Shows browsing history from configured browsers (Edge, Tabbit)
- Same tab + list keyboard navigation pattern as IDE view
- Opens URL via `window.services.openWithUrl(exePath, url)`

### Setting (`src/Setting/index.tsx`)

- Three sidebar tabs: IDE / Bookmarks / History
- Each tab renders configuration cards (one per configured item)
- Cards: data file path, executable path; reorderable via up/down buttons
- Paths stored in `window.ztools.dbStorage` with keys like `${id}ProjectsPath`, `${id}ExePath`, etc.
- Order stored as JSON arrays: `ideOrder`, `bookmarkOrder`, `historyOrder`

## Data sources

| Source | File | Format | Reader |
|--------|------|--------|--------|
| VS Code recent projects | `state.vscdb` | SQLite (`ItemTable`, key `history.recentlyOpenedPathsList`) | `services.readProjects()` |
| Zed recent projects | `db.sqlite` | SQLite (`workspaces` table, `remote_connection_id IS NULL`) | `services.readZedProjects()` |
| Edge bookmarks | `Bookmarks` | JSON (`roots.bookmark_bar` / `roots.other`) | `services.readBookmarks()` |
| Edge history | `History` | SQLite (`urls` table) | `services.readHistory()` |

## Key conventions

- **Preload is CommonJS**: `public/preload/` has its own `package.json` with no `"type"` field (defaults to CJS). Do not convert to ESM.
- **Tailwind CSS v3**: Config in `tailwind.config.js` with CSS variable-based theme (`globals.css`). Uses `darkMode: 'media'`.
- **UI components**: Radix UI primitives + `class-variance-authority` variants, `tailwind-merge` for `cn()` utility.
- **Storage**: `window.ztools.dbStorage` for all persistent config (paths, order). No `localStorage` fallback needed.
- **Database reads**: All SQLite files are copied to temp dir before reading to avoid lock contention (`copyToTemp` → `cleanupTemp` pattern in `services.js`).
- **Type safety**: `src/env.d.ts` declares global interfaces. Add new IDE/browser reader types there.
- **License**: MIT.

## Gotchas

- The `@ztools-center/ztools-api-types` devDependency provides types for `window.services` and `window.ztools`. Check `src/env.d.ts` when adding new host API calls.
- VS Code shared storage path fallback: `readProjects()` first tries the user-configured path, then falls back to `~/.vscode-shared/sharedStorage/state.vscdb`.
- Zed `paths` column is a BLOB — `services._decodeZedPaths()` handles JSON array / null-byte-separated / single-path formats.
- `useListNavigation` attaches a native `keydown` listener via `addEventListener` on the container; `useTabNavigation` returns a handler used with React's `onKeyDown`. Both coexist on the same container div.
- When adding a new IDE or browser: add reader to `services.js`, add type to `env.d.ts`, add to `ALL_IDES`/`ALL_BROWSERS` in `Setting/index.tsx`, add to `IDE_NAMES`/`BROWSER_NAMES` in view components, and wire up the reader dispatch if needed.
