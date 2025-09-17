# Foxel 图书阅读器插件

一个专为 Foxel 私有云打造的电子书阅读器插件，支持 TXT、Markdown、HTML、EPUB、PDF 等多种格式，提供沉浸式阅读体验与丰富的阅读工具。

## ✨ 功能亮点

- 📚 **多格式兼容**：原生支持 TXT / Markdown / HTML / EPUB / PDF
- 📖 **阅读模式**：滚动阅读与分页阅读自由切换，支持列宽、行距、字体自定义
- 🧭 **智能目录**：自动生成章节目录，支持章节跳转与回到顶部/结尾
- 🔍 **全文搜索**：快速定位关键内容，展示上下文摘要
- 📌 **书签与进度**：记录阅读进度与书签，自动持久化到本地
- 🎨 **主题切换**：内置浅色、深色、米黄色三种主题，适配不同环境
- 📑 **EPUB 专属优化**：内联样式、图片资源自动生成 Blob URL，确保离线可用
- 📄 **PDF 支持**：利用浏览器原生 PDF 查看器展示内容，附带一键下载、书签功能
- ⌨️ **快捷键**：支持章节导航、搜索、主题切换等常用快捷键

## 🛠 技术栈

- **React 18 + TypeScript**：构建插件核心逻辑
- **ESBuild**：打包为 IIFE 单文件
- **Foxel Plugin API**：与宿主系统通信
- **原生浏览器能力**：`DOMParser`、`DecompressionStream`、`localStorage`、`Blob` 等

## 📁 项目结构

```
foxel-ebook-reader/
├── src/
│   ├── App.tsx          # 阅读器主界面与状态管理
│   └── index.tsx        # 插件注册入口
├── dist/
│   └── plugin.js        # 构建输出（自动生成）
├── foxel.d.ts           # Foxel 类型定义
├── package.json         # 脚本与依赖配置
├── tsconfig.json        # TypeScript 配置
├── validate-plugin.js   # 插件验证脚本
└── README.md            # 插件说明
```

## 🚀 快速上手

```bash
# 安装依赖
cd foxel-ebook-reader
npm install

# 开发模式（监听文件变动）
npm run dev

# 构建生产版本
npm run build

# 构建前校验（包含于 build 脚本）
npm run validate

# 清理输出
npm run clean
```

## 🗂 支持的文件格式

| 格式 | 描述 |
|------|------|
| `.txt` | 纯文本，自动分段排版 |
| `.md` / `.markdown` | Markdown 语法增强显示 |
| `.html` / `.xhtml` | HTML 内容（自动安全清理） |
| `.epub` | 电子书容器，自动解析目录、内嵌样式与资源 |
| `.pdf` | 浏览器内置查看器打开，支持书签与下载 |

## 🎯 主要交互

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/⌘ + F` | 打开搜索 |
| `Ctrl/⌘ + B` | 添加书签 |
| `[` / `]` | 上一章 / 下一章 |
| `PageUp / PageDown` | 上一页 / 下一页 |
| `Ctrl/⌘ + +/-` | 调整字号 |
| `T` | 循环切换主题 |
| `Esc` | 关闭插件 |

## 📝 常见问题

1. **EPUB 解压失败**：请确认浏览器支持 `DecompressionStream`，如需兼容旧版浏览器，可提示用户升级。
2. **PDF 无法内嵌显示**：部分浏览器禁用内嵌 PDF，可使用“在新窗口打开”或直接下载。
3. **阅读进度未保存**：请确认浏览器允许使用 `localStorage`。

## 📄 许可证

MIT License

## 🔗 相关链接

- [Foxel 官网](https://foxel.cc)
- [Foxel GitHub](https://github.com/DrizzleTime/Foxel)
- [插件开发指南](https://foxel.cc/guide/plugins-guide.html)
