# Foxel Plus - 插件集合

[![CI](https://github.com/your-username/foxel-plus/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/foxel-plus/actions/workflows/ci.yml)
[![Build Plugins](https://github.com/your-username/foxel-plus/actions/workflows/build-plugins.yml/badge.svg)](https://github.com/your-username/foxel-plus/actions/workflows/build-plugins.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 为 [Foxel](https://foxel.cc) 私有云存储系统开发的插件集合，提供丰富的文件查看和处理功能。

## 🚀 快速开始

### 安装插件

1. 下载插件文件
2. 将插件文件复制到 Foxel 的 `web/public/plugins/` 目录
3. 在 Foxel 的"应用"页面安装插件
4. 选择对应文件类型即可使用

### 开发插件

```bash
# 克隆仓库
git clone https://github.com/your-username/foxel-plus.git
cd foxel-plus

# 进入插件目录
cd foxel-image-viewer

# 安装依赖
npm install

# 构建插件
npm run build
```

## 📦 可用插件

### 🖼️ 图片查看器 (foxel-image-viewer)

一个功能丰富的图片查看器插件，支持多种图片格式和操作。

**支持格式**: JPG, PNG, GIF, BMP, WebP, SVG, ICO, TIFF

**主要功能**:
- 🔍 图片缩放（10%-500%）
- 🖱️ 拖拽移动
- 🎛️ 工具栏控制
- 🌙 深色主题
- 📱 响应式设计

**安装**: 下载 [foxel-image-viewer.js](https://github.com/your-username/foxel-plus/releases/latest/download/foxel-image-viewer.js)

## 🛠️ 开发指南

### 创建新插件

1. 创建插件目录：`foxel-your-plugin-name/`
2. 复制模板文件结构
3. 修改 `package.json` 中的插件信息
4. 实现插件功能
5. 构建并测试

### 插件结构

```
foxel-your-plugin/
├── src/
│   ├── App.tsx          # React 主组件
│   └── index.tsx        # 插件入口
├── dist/
│   └── plugin.js        # 构建输出
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── foxel.d.ts          # 类型定义
└── README.md           # 插件文档
```

### 构建命令

```bash
# 开发模式（监听文件变化）
npm run dev

# 生产构建
npm run build

# 清理构建文件
npm run clean
```

## 📋 插件开发规范

### 必需实现

- [ ] `window.FoxelRegister(plugin)` 注册插件
- [ ] `mount(container, ctx)` 挂载方法
- [ ] `unmount(container)` 卸载方法（可选）
- [ ] 使用 `ctx.urls.downloadUrl` 读取文件
- [ ] 仅操作传入的 `container` 节点
- [ ] 样式使用唯一 ID 避免污染

### 推荐配置

- [ ] 设置合适的 `supportedExts`
- [ ] 提供清晰的 `name` 和 `description`
- [ ] 添加 `icon`（建议使用 data URI）
- [ ] 设置合理的 `defaultBounds`
- [ ] 输出 IIFE 格式单文件

## 🤝 贡献指南

### 提交 Issue

- 🐛 **Bug 报告**: 使用 [Bug Report 模板](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ **功能请求**: 使用 [Feature Request 模板](.github/ISSUE_TEMPLATE/feature_request.md)
- 🔌 **插件请求**: 使用 [Plugin Request 模板](.github/ISSUE_TEMPLATE/plugin_request.md)

### 提交 PR

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 编写清晰的提交信息
- 添加必要的测试和文档

## 📚 相关资源

- [Foxel 官网](https://foxel.cc)
- [Foxel GitHub](https://github.com/DrizzleTime/Foxel)
- [插件开发指南](https://foxel.cc/guide/plugins-guide.html)
- [React 文档](https://react.dev)
- [TypeScript 文档](https://www.typescriptlang.org)

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

感谢 [Foxel](https://foxel.cc) 项目提供的优秀插件系统，让开发者能够轻松扩展文件管理功能。

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
