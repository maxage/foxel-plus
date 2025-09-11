# Foxel 图片查看器插件

一个功能丰富的图片查看器插件，专为 Foxel 私有云存储系统设计。

## 功能特性

- 🖼️ 支持多种图片格式：JPG、PNG、GIF、BMP、WebP、SVG、ICO、TIFF
- 🔍 图片缩放：支持鼠标滚轮缩放，缩放范围 10%-500%
- 🖱️ 拖拽移动：支持鼠标拖拽移动图片位置
- 🎛️ 工具栏控制：提供缩放、重置、适应屏幕等快捷操作
- 🌙 深色主题：现代化的深色界面设计
- 📱 响应式设计：适配不同窗口尺寸

## 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **ESBuild** - 快速构建工具
- **Foxel Plugin API** - 插件系统接口

## 项目结构

```
foxel-image-viewer/
├── src/
│   ├── App.tsx          # React 主组件
│   └── index.tsx        # 插件入口文件
├── dist/
│   └── plugin.js        # 构建输出文件
├── foxel.d.ts          # Foxel 类型定义
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── build.sh            # 构建脚本
└── README.md           # 说明文档
```

## 快速开始

### 1. 安装依赖

```bash
cd foxel-image-viewer
npm install
```

### 2. 构建插件

```bash
# 使用构建脚本（推荐）
./build.sh

# 或使用 npm 命令
npm run build
```

### 3. 安装到 Foxel

1. 将 `dist/plugin.js` 复制到 Foxel 的 `web/public/plugins/` 目录
2. 在 Foxel 的"应用"页面点击"安装应用"
3. 输入插件 URL：`http://your-foxel-domain/plugins/plugin.js`
4. 点击"安装"

### 4. 使用插件

1. 在 Foxel 文件管理器中找到图片文件
2. 右键点击图片文件
3. 选择"图片查看器"应用
4. 享受图片查看体验！

## 开发指南

### 本地开发

```bash
# 监听模式构建
npm run dev

# 清理构建文件
npm run clean
```

### 插件配置

在 `src/index.tsx` 中可以修改插件的基本信息：

```typescript
const plugin: RegisteredPlugin = {
  key: 'com.example.image-viewer',        // 插件唯一标识
  name: '图片查看器',                      // 显示名称
  version: '1.0.0',                       // 版本号
  description: '功能丰富的图片查看器',      // 描述
  author: 'Your Name',                    // 作者
  supportedExts: ['jpg', 'png', 'gif'],   // 支持的文件扩展名
  // ... 其他配置
};
```

### 自定义样式

插件使用内联样式，所有样式都包含在 `#foxel-image-viewer` 容器内，不会污染全局样式。

## API 参考

### 插件接口

- `mount(container, ctx)` - 挂载插件到容器
- `unmount(container)` - 卸载插件
- `supportedExts` - 支持的文件扩展名数组
- `defaultBounds` - 默认窗口位置和大小

### 上下文对象 (ctx)

- `filePath` - 当前文件路径
- `entry` - 文件信息对象
- `urls.downloadUrl` - 文件下载 URL
- `host.close()` - 关闭当前应用

## 支持的图片格式

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **BMP** (.bmp)
- **WebP** (.webp)
- **SVG** (.svg)
- **ICO** (.ico)
- **TIFF** (.tiff, .tif)

## 操作说明

### 鼠标操作
- **滚轮** - 缩放图片
- **拖拽** - 移动图片位置
- **左键拖拽** - 移动图片

### 工具栏按钮
- **+/-** - 放大/缩小
- **重置** - 重置缩放和位置
- **适应屏幕** - 自动适应窗口大小
- **关闭** - 关闭应用

## 故障排除

### 常见问题

1. **插件未显示在应用列表中**
   - 检查文件扩展名是否在 `supportedExts` 中
   - 确认插件已正确安装

2. **图片无法加载**
   - 检查文件格式是否支持
   - 确认文件未损坏

3. **构建失败**
   - 检查 Node.js 版本（建议 16+）
   - 删除 `node_modules` 重新安装依赖

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 相关链接

- [Foxel 官网](https://foxel.cc)
- [Foxel GitHub](https://github.com/DrizzleTime/Foxel)
- [插件开发指南](https://foxel.cc/guide/plugins-guide.html)
