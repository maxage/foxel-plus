#!/usr/bin/env node

/**
 * 上传插件文件到 GitHub Release
 * 使用 GitHub API 直接创建 Release 并上传文件
 */

const fs = require('fs');
const path = require('path');

// 检查文件是否存在
const pluginFile = 'foxel-image-viewer.js';
if (!fs.existsSync(pluginFile)) {
  console.error('❌ 插件文件不存在:', pluginFile);
  process.exit(1);
}

const fileStats = fs.statSync(pluginFile);
console.log('📁 插件文件信息:');
console.log(`   文件: ${pluginFile}`);
console.log(`   大小: ${Math.round(fileStats.size / 1024)}KB`);
console.log(`   修改时间: ${fileStats.mtime}`);

// 创建 Release 说明
const releaseNotes = `# 🎉 Foxel Plus 发布说明

## 📦 包含的插件

### 🖼️ foxel-image-viewer (v1.0.0)

**描述**: 一个功能丰富的图片查看器插件，支持缩放、拖拽、旋转等操作
**文件大小**: ${Math.round(fileStats.size / 1024)}KB
**支持格式**: JPG, PNG, GIF, BMP, WebP, SVG, ICO, TIFF

#### 主要功能
- 🔍 智能缩放（10%-500%）
- 🖱️ 拖拽移动
- 🎛️ 工具栏控制
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

---

**🎉 插件已准备就绪，立即开始使用吧！**`;

console.log('\n📝 Release 说明已生成');
console.log('\n🚀 请按照以下步骤手动创建 Release:');
console.log('\n1. 访问 GitHub Releases 页面:');
console.log('   https://github.com/maxage/foxel-plus/releases');
console.log('\n2. 点击 "Create a new release" 按钮');
console.log('\n3. 填写 Release 信息:');
console.log('   - Tag version: v1.3.0');
console.log('   - Release title: Foxel Plus v1.3.0 - 图片查看器插件');
console.log('   - Description: 复制下面的内容');
console.log('\n4. 在 "Attach binaries" 部分:');
console.log('   - 点击 "Choose your files"');
console.log('   - 选择 foxel-image-viewer.js 文件');
console.log('\n5. 点击 "Publish release" 按钮');
console.log('\n📋 Release 说明内容:');
console.log('─'.repeat(50));
console.log(releaseNotes);
console.log('─'.repeat(50));
