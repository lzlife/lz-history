# 📝 更新日志

## 1.0.0 (2025-07-10)

### 🎯 核心功能

#### IDE 最近项目
- **VS Code 支持**：读取 `state.vscdb` 中 `history.recentlyOpenedPathsList`，解析 `folderUri` 为本地路径
- **Zed 编辑器支持**：读取 Zed `db.sqlite` 中 `workspaces` 表的最近项目
- **项目列表**：展示项目名称 + 完整路径，支持搜索过滤
- **一键打开**：选中后通过程序文件直接打开对应 IDE
- **共享存储兜底**：VS Code 主路径读取失败时自动尝试 `~/.vscode-shared/sharedStorage/state.vscdb`
- **键盘 Tab 切换**：多 IDE 时支持 ← → 切换标签页

#### 浏览器书签
- **Edge 书签支持**：读取 `Bookmarks` JSON 文件，解析 `roots.bookmark_bar` 和 `roots.other` 树结构
- **Tabbit 书签支持**：Tabbit 书签读取（预留配置入口）
- **分类 Tab 切换**：多浏览器时以标签页形式切换
- **搜索过滤**：按名称和 URL 实时过滤
- **键盘 Tab 切换**：多浏览器时支持 ← → 切换标签页

#### 浏览器历史记录
- **Edge 历史支持**：读取 `History` SQLite 数据库，查询 `urls` 表按时间倒序
- **Tabbit 历史支持**：Tabbit 历史记录读取（预留配置入口）
- **分类 Tab 切换**：多浏览器时以标签页形式切换
- **搜索过滤**：按标题和 URL 实时过滤
- **键盘 Tab 切换**：多浏览器时支持 ← → 切换标签页

#### 插件设置
- **三栏设置页**：IDE / 书签 / 历史记录，各功能独立配置
- **路径选择**：通过系统文件选择对话框配置数据文件和程序文件路径
- **排序调整**：上下移动按钮调整各功能内项目的显示顺序
- **配置持久化**：所有配置存储在 `window.ztools.dbStorage` 中

### ⚙️ 技术架构

- **框架**：React 19 + TypeScript 5.3
- **构建**：Vite 6
- **样式**：Tailwind CSS 3.4 + Radix UI
- **数据库**：sql.js（WebAssembly 版 SQLite）
- **运行环境**：ZTools 插件宿主

### 🏗 项目结构

```
lz-history/
├── src/
│   ├── Ide/           # IDE 最近项目
│   ├── Bookmarks/     # 浏览器书签
│   ├── History/       # 浏览器历史
│   ├── Setting/       # 插件设置
│   ├── components/    # UI 组件
│   └── hooks/         # 自定义 Hooks
├── public/
│   ├── preload/       # 预加载脚本 (CommonJS)
│   └── plugin.json    # 插件清单
└── package.json
```
