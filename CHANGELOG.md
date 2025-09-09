# 更新日志

所有重要的项目更改都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 初始项目结构
- 图片查看器插件 (foxel-image-viewer)
- GitHub Actions 工作流
- 完整的文档和贡献指南

### 变更
- 无

### 修复
- 无

### 移除
- 无

## [1.0.0] - 2024-01-09

### 新增
- 🖼️ **图片查看器插件** - 功能丰富的图片查看器
  - 支持多种图片格式：JPG, PNG, GIF, BMP, WebP, SVG, ICO, TIFF
  - 图片缩放功能（10%-500%）
  - 拖拽移动图片
  - 工具栏控制（缩放、重置、适应屏幕、关闭）
  - 深色主题界面
  - 响应式设计

- 🛠️ **开发工具链**
  - TypeScript 支持
  - React 18 + ESBuild 构建
  - 完整的类型定义
  - 开发和生产构建脚本

- 📚 **文档和指南**
  - 详细的 README 文档
  - 插件开发指南
  - 贡献指南
  - Issue 和 PR 模板

- 🔧 **CI/CD 流程**
  - GitHub Actions 自动化构建
  - 代码质量检查
  - 自动发布流程
  - Dependabot 依赖更新

### 技术细节
- 使用 Foxel Plugin API 规范
- IIFE 格式单文件输出
- 无外部运行时依赖
- 完全自包含的插件系统

---

## 版本说明

- **[未发布]**: 开发中的功能
- **[1.0.0]**: 首个稳定版本
- **[MAJOR.MINOR.PATCH]**: 语义化版本号

## 链接

- [Foxel 官网](https://foxel.cc)
- [插件开发指南](https://foxel.cc/guide/plugins-guide.html)
- [GitHub 仓库](https://github.com/your-username/foxel-plus)
