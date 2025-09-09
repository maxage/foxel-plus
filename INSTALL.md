# 🚀 Foxel Plus 插件安装指南

## 📥 立即安装

由于 GitHub Actions 自动发布可能需要一些时间，我们提供了临时的安装方法：

### 方法一：使用本地文件（推荐）

1. **下载插件文件**
   - 文件位置：`foxel-image-viewer.js`（已在项目根目录）
   - 文件大小：145KB
   - 状态：✅ 已验证，符合 Foxel 标准

2. **安装到 Foxel**
   - 将 `foxel-image-viewer.js` 复制到 Foxel 的 `web/public/plugins/` 目录
   - 重启 Foxel 服务
   - 在 Foxel 的"应用"页面安装插件

### 方法二：等待自动发布

GitHub Actions 正在自动构建和发布，请稍等几分钟后访问：
- [Releases 页面](https://github.com/maxage/foxel-plus/releases)
- 下载 `foxel-image-viewer.js` 文件

## 🔧 系统要求

- **Foxel 版本**: 支持插件系统的版本
- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **文件格式**: JPG, PNG, GIF, BMP, WebP, SVG, ICO, TIFF

## 🎯 插件功能

- 🔍 **智能缩放** - 鼠标滚轮缩放（10%-500%）
- 🖱️ **拖拽移动** - 流畅的图片拖拽体验
- 🎛️ **工具栏控制** - 缩放、重置、适应屏幕、关闭
- 🌙 **深色主题** - 护眼的现代化界面
- 📱 **响应式设计** - 适配各种屏幕尺寸

## 🐛 故障排除

### 插件未显示在应用列表中
1. 检查文件扩展名是否在支持列表中
2. 确认插件已正确安装到 `web/public/plugins/` 目录
3. 重启 Foxel 服务

### 图片无法加载
1. 检查文件格式是否支持
2. 确认文件未损坏
3. 检查网络连接

## 📞 获取帮助

- **GitHub Issues**: [报告问题](https://github.com/maxage/foxel-plus/issues)
- **项目文档**: [查看完整文档](https://github.com/maxage/foxel-plus#readme)

---

**🎉 插件已准备就绪，立即开始使用吧！**
