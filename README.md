# LZ History

LZ History 是一个运行在 ZTools 内的快捷启动插件，支持快速打开 IDE 最近项目、浏览器书签和历史记录。

## 核心能力

- IDE 最近项目：读取 VS Code 和 Zed 的最近打开项目列表，选择后直接打开。
- 浏览器书签：读取 Edge / Tabbit 的书签文件，支持名称检索。
- 浏览器历史：读取 Edge / Tabbit 的历史数据库，支持名称检索。
- 配置管理：在插件设置中配置各功能所需的数据文件路径和可执行文件路径。

## 数据与格式

| 来源 | 文件 | 格式 | 读取方式 |
|------|------|------|----------|
| VS Code 最近项目 | `state.vscdb` | SQLite | `services.readProjects()` |
| Zed 最近项目 | `db.sqlite` | SQLite | `services.readZedProjects()` |
| Edge 书签 | `Bookmarks` | JSON | `services.readBookmarks()` |
| Edge 历史 | `History` | SQLite | `services.readHistory()` |

## 使用说明

- 支持多个浏览器切换（Edge / Tabbit），通过顶部标签栏切换。
- 列表支持键盘上下方向键导航、Enter 打开。
- 支持输入关键词实时过滤。
- 设置页可配置各功能的数据文件路径、程序文件路径和显示顺序。

## 开发备注

- 前端：React 19 + TypeScript + Vite 6
- 样式：Tailwind CSS 3 + Radix UI
- 宿主能力：ZTools API + `window.services`
- 数据库读取：SQLite 文件先复制到临时目录再读取，避免锁冲突

## 开源许可与合规

- 本项目代码采用 MIT License，详见 `LICENSE`。
- 第三方依赖许可证与本项目许可证独立，详见 `THIRD_PARTY_NOTICES.md`。
- 本项目按"现状"提供，不提供任何明示或暗示担保，包含适销性和特定用途适用性的担保限制。
- 使用者在分发或商用前，应自行完成所在地区和企业内部的合规审查。
