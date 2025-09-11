# Foxel Code Viewer Plus

一个功能强大的代码查看器插件，支持语法高亮、预览、主题切换、搜索等丰富功能。

## 功能特性

### 🔍 代码查看
- 支持 50+ 种编程语言和文件格式
- 语法高亮显示
- 行号显示
- 自动换行
- 代码搜索和定位

### 🎨 主题支持
- 9 种内置主题（亮色/暗色）
- Visual Studio Light/Dark
- GitHub Light/Dark
- Monokai
- Dracula
- One Dark
- Solarized Light/Dark

### 👁️ 预览功能
- HTML 实时预览
- Markdown 渲染预览
- JSON 格式化预览
- 安全的 HTML 清理

### 🔧 高级功能
- 代码搜索和结果高亮
- 复制代码到剪贴板
- 下载文件
- 响应式设计
- 键盘快捷键支持

## 支持的文件格式

### 编程语言
- **前端**: JavaScript, TypeScript, Vue, Svelte, HTML, CSS, SCSS, Sass, Less
- **后端**: Python, Java, C/C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin
- **脚本**: Shell, PowerShell, Batch
- **数据**: JSON, YAML, XML, TOML, INI
- **文档**: Markdown, Text, Diff
- **数据库**: SQL
- **配置**: Dockerfile, Makefile, CMake
- **其他**: GraphQL, Protocol Buffers

### 预览支持
- **HTML**: 实时渲染预览
- **Markdown**: 完整 Markdown 支持
- **JSON**: 格式化显示

## 使用方法

1. 在 Foxel 中打开支持的代码文件
2. 选择"代码查看器 Plus"应用
3. 使用工具栏进行各种操作：
   - 切换主题
   - 开启/关闭预览
   - 显示/隐藏行号
   - 开启/关闭自动换行
   - 搜索代码内容
   - 复制或下载文件

## 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Prism.js** - 语法高亮
- **Marked** - Markdown 解析
- **DOMPurify** - HTML 清理
- **ESBuild** - 构建工具

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 验证
npm run validate

# 清理
npm run clean
```

## 许可证

MIT License
