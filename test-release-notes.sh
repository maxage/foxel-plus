#!/bin/bash

echo "🧪 测试发布说明生成..."

# 模拟 Manual Release 的发布说明生成
VERSION="v1.1.3"
if [[ $VERSION == v* ]]; then
  VERSION=${VERSION#v}
fi

echo "📝 版本号: $VERSION"

# 获取插件信息
PLUGIN_NAME=$(cd foxel-image-viewer && node -p "require('./package.json').name")
PLUGIN_DESCRIPTION=$(cd foxel-image-viewer && node -p "require('./package.json').description")
PLUGIN_AUTHOR=$(cd foxel-image-viewer && node -p "require('./package.json').author")

echo "📦 插件名称: $PLUGIN_NAME"
echo "📝 插件描述: $PLUGIN_DESCRIPTION"
echo "👤 插件作者: $PLUGIN_AUTHOR"

# 创建测试发布说明
cat > test-release-notes.md << EOF
# 🎉 Foxel Plus 发布说明

## 📦 包含的插件

### 🖼️ $PLUGIN_NAME (v$VERSION)

**描述**: $PLUGIN_DESCRIPTION  
**作者**: $PLUGIN_AUTHOR  
**文件大小**: $(du -h foxel-image-viewer/dist/plugin.js | cut -f1)  
**支持格式**: JPG, PNG, GIF, BMP, WebP, SVG, ICO, TIFF

#### 主要功能
- 🔍 智能缩放（10%-500%）
- 🖱️ 拖拽移动
- 🔄 旋转和翻转
- ⤢ 全屏模式
- ℹ️ 图片信息显示
- ⌨️ 键盘快捷键支持
- 🎛️ 智能工具栏
- 🌙 深色主题
- 📱 响应式设计

#### 安装方法
1. 下载 \`foxel-image-viewer.js\` 文件
2. 将文件复制到 Foxel 的 \`web/public/plugins/\` 目录
3. 在 Foxel 的"应用"页面安装插件
4. 选择对应文件类型即可使用

#### 技术特性
- **完全自包含** - 单文件输出，无外部依赖
- **类型安全** - 基于 TypeScript 开发
- **现代化 UI** - 使用 React 18 构建
- **高性能** - ESBuild 优化构建
- **即插即用** - 符合 Foxel 插件规范

#### 更新日志
- 版本 $VERSION 更新
- 优化了全屏和非全屏模式的布局
- 改进了工具栏的响应式设计
- 增强了键盘快捷键支持
- 修复了文本挤压问题
EOF

echo "✅ 测试发布说明已生成: test-release-notes.md"
echo ""
echo "📋 发布说明内容预览:"
echo "========================"
cat test-release-notes.md
