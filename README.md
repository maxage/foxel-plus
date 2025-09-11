# Foxel Plus 🦊

[![CI](https://github.com/maxage/foxel-plus/actions/workflows/ci.yml/badge.svg)](https://github.com/maxage/foxel-plus/actions/workflows/ci.yml)
[![Auto Release](https://github.com/maxage/foxel-plus/actions/workflows/auto-release.yml/badge.svg)](https://github.com/maxage/foxel-plus/actions/workflows/auto-release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-61dafb.svg)](https://react.dev/)

> 🚀 为 [Foxel](https://foxel.cc) 私有云存储系统开发的多插件仓库，提供丰富的文件查看和处理功能。基于 TypeScript + React + ESBuild 构建，完全自包含，即插即用。

## ✨ 特性

- 🎯 **即插即用** - 下载即用，无需复杂配置
- 🔧 **完全自包含** - 单文件输出，无外部依赖
- 🎨 **现代化 UI** - 基于 React 18 + TypeScript 构建
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 🌙 **多主题支持** - 深色、浅色、海洋主题
- ⚡ **高性能** - 基于 ESBuild 快速构建
- 🔒 **类型安全** - 完整的 TypeScript 类型支持
- 🛠️ **易于开发** - 完整的开发工具链和文档

## 🚀 快速开始

### 📥 安装插件

#### 方法一：直接下载（推荐）

1. 访问 [Releases 页面](https://github.com/maxage/foxel-plus/releases/latest)
2. 下载所需的插件文件：
   - 图片查看器：`foxel-image-viewer.js`
   - 代码查看器：`foxel-code-viewer.js`
   - 媒体播放器：`foxel-media-player.js`
3. 在 Foxel 的"应用"页面添加插件
4. 输入对应的插件 URL：
   - 图片查看器：`https://github.com/maxage/foxel-plus/releases/latest/download/foxel-image-viewer.js`
   - 代码查看器：`https://github.com/maxage/foxel-plus/releases/latest/download/foxel-code-viewer.js`
   - 媒体播放器：`https://github.com/maxage/foxel-plus/releases/latest/download/foxel-media-player.js`
5. 安装完成后即可在文件管理器中查看对应文件类型

## 📦 可用插件

### 🖼️ 图片查看器

一个功能强大的图片查看器插件，支持多种图片格式和丰富的操作功能。

| 属性 | 值 |
|------|-----|
| **版本** | v1.0.0 |
| **文件大小** | ~158KB |
| **支持格式** | JPG, PNG, GIF, BMP, WebP, SVG, ICO, TIFF |
| **作者** | Jason |
| **图标** | ![Image Icon](https://img.icons8.com/scribby/100/image.png) |

#### ✨ 主要功能

- 🔍 **智能缩放** - 鼠标滚轮缩放（10%-1000%）
- 🖱️ **拖拽移动** - 流畅的图片拖拽体验
- 🔄 **旋转翻转** - 支持90度旋转和水平/垂直翻转
- 🎨 **滤镜效果** - 亮度、对比度、饱和度、色相、模糊调节
- 📋 **复制下载** - 支持复制和下载编辑后的图片
- ↶↷ **撤销重做** - 支持50步历史记录操作
- 🎛️ **工具栏控制** - 缩放、重置、适应屏幕、关闭
- 🌙 **多主题支持** - 深色、浅色、海洋主题
- 📱 **响应式设计** - 适配各种屏幕尺寸
- ⚡ **高性能** - 优化的渲染和交互体验
- 🎨 **美观界面** - 简洁现代的 UI 设计
- ⌨️ **键盘快捷键** - 支持常用快捷键操作

#### 🎮 操作指南

| 操作 | 说明 |
|------|------|
| **鼠标滚轮** | 缩放图片 |
| **左键拖拽** | 移动图片位置 |
| **工具栏按钮** | 各种快捷操作 |
| **滤镜面板** | 实时调节图片效果 |
| **键盘快捷键** | 支持常用快捷键 |

---

### 💻 代码查看器

一个功能强大的代码查看器插件，支持语法高亮、预览、主题切换等丰富功能。

| 属性 | 值 |
|------|-----|
| **版本** | v1.0.0 |
| **文件大小** | ~159KB |
| **支持格式** | JS, TS, JSX, TSX, HTML, CSS, SCSS, JSON, MD, TXT, PY, JAVA, C, CPP, GO, PHP, RB, SH, YAML, XML |
| **作者** | Jason |
| **图标** | ![Code Icon](https://img.icons8.com/cotton/100/source-code--v1.png) |

#### ✨ 主要功能

- 🎨 **语法高亮** - 支持多种编程语言语法高亮
- 👁️ **代码预览** - 只读模式查看代码文件
- 🔍 **搜索功能** - 强大的代码搜索功能
- 📄 **内容预览** - 支持 HTML、Markdown、JSON 预览
- 🌙 **多主题支持** - 深色、浅色、海洋主题
- 📱 **响应式设计** - 适配各种屏幕尺寸
- ⌨️ **键盘快捷键** - 支持常用查看器快捷键
- 🔧 **代码折叠** - 支持代码块折叠
- 📋 **复制功能** - 支持代码复制
- 📊 **行号显示** - 可切换的行号显示
- 🔤 **自动换行** - 可切换的自动换行

#### 🎮 操作指南

| 操作 | 说明 |
|------|------|
| **Ctrl+F** | 搜索代码 |
| **Ctrl+G** | 跳转到指定行 |
| **Ctrl+/** | 切换注释 |
| **F11** | 全屏模式 |
| **Esc** | 退出全屏 |

---

### 🎵 媒体播放器

一个功能强大的媒体播放器插件，支持音频和视频播放，完全符合 Foxel 规范。

| 属性 | 值 |
|------|-----|
| **版本** | v1.0.0 |
| **文件大小** | ~154KB |
| **支持格式** | MP3, WAV, FLAC, AAC, OGG, M4A, WMA, OPUS, MP4, AVI, MKV, MOV, WMV, FLV, WebM, M4V, 3GP |
| **作者** | Jason |
| **图标** | ![Media Icon](https://img.icons8.com/bubbles/100/circled-play.png) |

#### ✨ 主要功能

- 🎵 **多格式支持** - 支持音频和视频多种格式
- 🎮 **播放控制** - 播放、暂停、停止、上一首、下一首
- ⏪⏩ **快进快退** - 支持10秒快进快退
- 🔊 **音量控制** - 音量调节、静音切换
- ⚡ **播放速度** - 支持0.5x到2x的播放速度调节
- 📁 **播放列表管理** - 支持多文件播放列表
- 🎨 **音频可视化** - 音频文件显示专辑封面占位符
- 🌙 **现代化界面** - 深色主题，渐变背景
- ⤢ **全屏播放** - 支持全屏播放模式
- ⌨️ **键盘快捷键** - 丰富的快捷键支持
- 🎛️ **自动隐藏控制栏** - 播放时自动隐藏，鼠标移动时显示
- 📱 **响应式设计** - 适配各种屏幕尺寸

#### 🎮 操作指南

| 快捷键 | 功能 |
|--------|------|
| **空格键** | 播放/暂停 |
| **←/→** | 快退/快进10秒 |
| **↑/↓** | 音量调节 |
| **M** | 静音切换 |
| **N** | 下一首 |
| **P** | 上一首 |
| **S** | 停止播放 |
| **F** | 全屏切换 |
| **Esc** | 关闭插件/退出全屏 |

---

## 🛠️ 开发指南

### 🚀 快速创建新插件

#### 1. 使用模板创建

```bash
# 克隆仓库
git clone https://github.com/maxage/foxel-plus.git
cd foxel-plus

# 复制模板
cp -r foxel-image-viewer foxel-your-plugin-name
cd foxel-your-plugin-name

# 修改插件信息
# 编辑 package.json 中的 name, description 等字段
# 编辑 src/index.tsx 中的插件配置
```

#### 2. 插件目录结构

```
foxel-your-plugin/
├── src/
│   ├── App.tsx          # React 主组件
│   └── index.tsx        # 插件入口文件
├── dist/
│   └── plugin.js        # 构建输出文件
├── package.json         # 项目配置文件
├── tsconfig.json        # TypeScript 配置
├── foxel.d.ts          # Foxel 类型定义
├── validate-plugin.js   # 插件验证脚本
└── README.md           # 插件文档
```

#### 3. 开发工作流

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 生产构建
npm run build

# 验证插件
npm run validate
```

### 📋 插件开发规范

#### 必需实现

- [ ] `window.FoxelRegister(plugin)` 注册插件
- [ ] `mount(container, ctx)` 挂载方法
- [ ] `unmount(container)` 卸载方法（可选）
- [ ] 使用 `ctx.urls.downloadUrl` 读取文件
- [ ] 仅操作传入的 `container` 节点
- [ ] 样式使用唯一 ID 避免污染

#### 推荐配置

- [ ] 设置合适的 `supportedExts`
- [ ] 提供清晰的 `name` 和 `description`
- [ ] 添加 `icon`（建议使用 Icons8 图标）
- [ ] 设置合理的 `defaultBounds`
- [ ] 输出 IIFE 格式单文件

#### 代码规范

```typescript
// 插件基本结构
const plugin: RegisteredPlugin = {
  key: 'com.your-org.plugin-name',
  name: '插件名称',
  version: '1.0.0',
  description: '插件描述',
  author: 'Jason',
  supportedExts: ['jpg', 'png', 'gif'],
  defaultBounds: { width: 800, height: 600 },
  icon: 'https://img.icons8.com/...',
  
  mount: (container: HTMLElement, ctx: PluginMountCtx) => {
    // 插件挂载逻辑
  },
  
  unmount: (container: HTMLElement) => {
    // 插件卸载逻辑
  }
};
```

### 🔧 技术栈详解

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.3+ | UI 框架 |
| **TypeScript** | 5.5+ | 类型安全 |
| **ESBuild** | 0.25+ | 构建工具 |
| **Foxel API** | Latest | 插件接口 |

## 🤝 贡献指南

### 🐛 报告问题

我们欢迎各种形式的贡献！请使用以下模板：

- 🐛 **Bug 报告**: [Bug Report 模板](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ **功能请求**: [Feature Request 模板](.github/ISSUE_TEMPLATE/feature_request.md)
- 🔌 **插件请求**: [Plugin Request 模板](.github/ISSUE_TEMPLATE/plugin_request.md)

### 🚀 提交代码

#### 1. Fork 和克隆

```bash
# Fork 仓库后克隆
git clone https://github.com/your-username/foxel-plus.git
cd foxel-plus

# 添加上游仓库
git remote add upstream https://github.com/maxage/foxel-plus.git
```

#### 2. 创建功能分支

```bash
# 创建并切换到新分支
git checkout -b feature/amazing-feature

# 或者修复 Bug
git checkout -b fix/bug-description
```

#### 3. 开发和提交

```bash
# 开发你的功能
# ...

# 添加更改
git add .

# 提交更改（使用规范的提交信息）
git commit -m "feat: add amazing feature"
# 或者
git commit -m "fix: resolve bug in image viewer"
```

#### 4. 推送和创建 PR

```bash
# 推送分支
git push origin feature/amazing-feature

# 在 GitHub 上创建 Pull Request
```

### 📝 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: add video player plugin` |
| `fix` | Bug 修复 | `fix: resolve image scaling issue` |
| `docs` | 文档更新 | `docs: update installation guide` |
| `style` | 代码格式 | `style: format code with prettier` |
| `refactor` | 代码重构 | `refactor: optimize build process` |
| `test` | 测试相关 | `test: add unit tests for image viewer` |
| `chore` | 构建/工具 | `chore: update dependencies` |

## 🔄 自动发布

本项目使用 GitHub Actions 实现自动构建和发布：

### 🚀 自动触发条件

- **插件文件修改** - 当任何 `foxel-*/` 目录下的文件发生变更时
- **根目录插件文件修改** - 当任何 `foxel-*.js` 文件发生变更时
- **推送到 main 分支** - 确保只在主分支上触发

### 📦 发布流程

1. **自动检测** - 检测到插件文件变更，识别所有修改的插件
2. **构建插件** - 使用 ESBuild 构建所有修改的插件
3. **版本管理** - 从第一个修改插件的 `package.json` 读取版本号
4. **创建标签** - 自动创建 Git 标签
5. **发布 Release** - 在 GitHub 上创建 Release，包含所有插件文件
6. **更新文件** - 更新根目录对应的插件文件

### 🛠️ 手动操作

- **手动发布** - 使用 "Manual Release" 工作流
- **测试发布** - 使用 "Test Release" 工作流创建预发布版本
- **版本控制** - 通过修改 `package.json` 中的版本号来管理版本

## 📊 项目统计

![GitHub stars](https://img.shields.io/github/stars/maxage/foxel-plus?style=social)
![GitHub forks](https://img.shields.io/github/forks/maxage/foxel-plus?style=social)
![GitHub issues](https://img.shields.io/github/issues/maxage/foxel-plus)
![GitHub pull requests](https://img.shields.io/github/issues-pr/maxage/foxel-plus)
![GitHub last commit](https://img.shields.io/github/last-commit/maxage/foxel-plus)

## 📚 相关资源

### 🔗 官方链接

- [Foxel 官网](https://foxel.cc) - 官方主页
- [Foxel GitHub](https://github.com/DrizzleTime/Foxel) - 官方仓库
- [插件开发指南](https://foxel.cc/guide/plugins-guide.html) - 详细开发文档

### 🛠️ 技术文档

- [React 官方文档](https://react.dev) - React 框架文档
- [TypeScript 手册](https://www.typescriptlang.org/docs/) - TypeScript 类型系统
- [ESBuild 文档](https://esbuild.github.io/) - 构建工具文档
- [Conventional Commits](https://www.conventionalcommits.org/) - 提交信息规范

### 🎯 学习资源

- [Foxel 插件示例](https://github.com/DrizzleTime/foxel-text-viewer) - 官方文本查看器示例
- [React 最佳实践](https://react.dev/learn) - React 学习指南
- [TypeScript 入门](https://www.typescriptlang.org/docs/handbook/intro.html) - TypeScript 入门教程

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

```
MIT License

Copyright (c) 2024 Foxel Plus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 致谢

感谢以下项目和社区的支持：

- [Foxel](https://foxel.cc) - 提供优秀的插件系统架构
- [React](https://react.dev) - 强大的 UI 框架
- [TypeScript](https://www.typescriptlang.org) - 类型安全的 JavaScript
- [ESBuild](https://esbuild.github.io) - 极速的构建工具
- [GitHub](https://github.com) - 代码托管和 CI/CD 平台
- [Icons8](https://icons8.com) - 提供精美的图标资源

## 🎉 支持我们

如果这个项目对你有帮助，请考虑：

- ⭐ **给个 Star** - 让更多人看到这个项目
- 🍴 **Fork 项目** - 参与开发和改进
- 🐛 **报告问题** - 帮助我们改进
- 💡 **提出建议** - 分享你的想法
- 📢 **分享给朋友** - 让更多人受益

---

<div align="center">

**🚀 让 Foxel 更强大，让文件管理更简单！**

[![Star](https://img.shields.io/badge/⭐-Star%20this%20project-yellow?style=for-the-badge)](https://github.com/maxage/foxel-plus)
[![Fork](https://img.shields.io/badge/🍴-Fork%20this%20project-blue?style=for-the-badge)](https://github.com/maxage/foxel-plus/fork)
[![Issues](https://img.shields.io/badge/🐛-Report%20issues-red?style=for-the-badge)](https://github.com/maxage/foxel-plus/issues)

</div>