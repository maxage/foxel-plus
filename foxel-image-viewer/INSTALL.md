# Foxel Plus 图片查看器 - 安装指南

## 📥 安装方法

### 方法一：通过 Foxel 应用中心安装（推荐）

1. **获取插件链接**
   - 访问 [GitHub Releases](https://github.com/maxage/foxel-plus/releases/latest)
   - 下载 `foxel-image-viewer.js` 文件
   - 将文件上传到你的 Web 服务器或使用 GitHub 的原始链接

2. **在 Foxel 中安装**
   - 打开 Foxel 私有云存储系统
   - 进入"应用"页面
   - 点击"安装应用"按钮
   - 在"应用链接"输入框中粘贴插件 URL：
     ```
     https://github.com/maxage/foxel-plus/releases/latest/download/foxel-image-viewer.js
     ```
   - 点击"安装"按钮

3. **使用插件**
   - 在文件管理器中找到图片文件
   - 右键点击图片文件
   - 选择"图片查看器"应用

### 方法二：本地安装

1. **下载插件文件**
   ```bash
   wget https://github.com/maxage/foxel-plus/releases/latest/download/foxel-image-viewer.js
   ```

2. **复制到 Foxel 目录**
   ```bash
   cp foxel-image-viewer.js /path/to/foxel/web/public/plugins/
   ```

3. **重启 Foxel 服务**
   ```bash
   # 根据你的 Foxel 安装方式重启服务
   ```

## 🔧 系统要求

- **Foxel 版本**: 支持插件系统的版本
- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **文件格式**: JPG, PNG, GIF, BMP, WebP, SVG, ICO, TIFF

## 🐛 故障排除

### 插件未显示在应用列表中

1. 检查文件扩展名是否在支持列表中
2. 确认插件已正确安装
3. 查看浏览器控制台是否有错误信息

### 图片无法加载

1. 检查文件格式是否支持
2. 确认文件未损坏
3. 检查网络连接

### 插件加载失败

1. 检查插件 URL 是否可访问
2. 确认 Foxel 版本支持插件系统
3. 查看浏览器控制台错误信息

## 📞 获取帮助

- **GitHub Issues**: [报告问题](https://github.com/maxage/foxel-plus/issues)
- **文档**: [查看完整文档](https://github.com/maxage/foxel-plus#readme)
- **Foxel 官网**: [https://foxel.cc](https://foxel.cc)

## 📄 许可证

本项目采用 [MIT 许可证](https://github.com/maxage/foxel-plus/blob/main/LICENSE)。
