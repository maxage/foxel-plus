# 贡献指南

感谢您对 Foxel Plus 项目的关注！我们欢迎各种形式的贡献，包括但不限于：

- 🐛 报告 Bug
- ✨ 提出新功能
- 🔌 开发新插件
- 📝 改进文档
- 🧪 编写测试

## 开发环境设置

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Git

### 本地开发

1. **Fork 并克隆仓库**
   ```bash
   git clone https://github.com/your-username/foxel-plus.git
   cd foxel-plus
   ```

2. **安装依赖**
   ```bash
   # 安装所有插件的依赖
   for plugin in foxel-*/; do
     if [ -f "$plugin/package.json" ]; then
       cd "$plugin"
       npm install
       cd ..
     fi
   done
   ```

3. **开发插件**
   ```bash
   cd foxel-image-viewer  # 或其他插件目录
   npm run dev           # 开发模式，监听文件变化
   ```

4. **构建插件**
   ```bash
   npm run build         # 生产构建
   ```

## 插件开发规范

### 目录结构

```
foxel-your-plugin/
├── src/
│   ├── App.tsx          # React 主组件
│   └── index.tsx        # 插件入口文件
├── dist/
│   └── plugin.js        # 构建输出
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── foxel.d.ts          # Foxel 类型定义
├── build.sh            # 构建脚本
└── README.md           # 插件文档
```

### 代码规范

1. **TypeScript**: 使用 TypeScript 进行类型安全开发
2. **React**: 使用函数组件和 Hooks
3. **样式**: 使用内联样式，避免全局样式污染
4. **命名**: 使用有意义的变量和函数名
5. **注释**: 为复杂逻辑添加注释

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

## 提交流程

### 1. 创建 Issue

在提交代码之前，请先创建 Issue 讨论您的想法：

- 🐛 **Bug 报告**: 使用 Bug Report 模板
- ✨ **功能请求**: 使用 Feature Request 模板  
- 🔌 **插件请求**: 使用 Plugin Request 模板

### 2. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 3. 提交代码

```bash
git add .
git commit -m "feat: add amazing feature"
```

**提交信息规范**:
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

### 4. 推送并创建 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

### 5. 代码审查

- 确保所有检查通过
- 响应审查意见
- 保持 PR 简洁，一次只做一件事

## 测试

### 本地测试

1. 构建插件
2. 将插件文件复制到 Foxel 的 `web/public/plugins/` 目录
3. 在 Foxel 中安装并测试插件

### 自动化测试

项目使用 GitHub Actions 进行自动化测试：

- **CI**: 类型检查和构建测试
- **Build**: 插件构建和打包
- **Release**: 自动发布

## 发布流程

### 版本号规范

使用 [语义化版本](https://semver.org/lang/zh-CN/)：

- `MAJOR`: 不兼容的 API 修改
- `MINOR`: 向下兼容的功能性新增
- `PATCH`: 向下兼容的问题修正

### 发布步骤

1. 更新版本号
2. 更新 CHANGELOG
3. 创建 Git Tag
4. 推送标签触发自动发布

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 社区准则

### 行为准则

- 保持友善和尊重
- 欢迎不同观点和经验水平
- 专注于对社区最有利的事情
- 对其他社区成员保持同理心

### 获取帮助

- 📖 查看 [文档](https://foxel.cc/guide/plugins-guide.html)
- 💬 在 [Discussions](https://github.com/your-username/foxel-plus/discussions) 中提问
- 🐛 在 [Issues](https://github.com/your-username/foxel-plus/issues) 中报告问题

## 许可证

通过贡献代码，您同意您的贡献将在 MIT 许可证下发布。

---

再次感谢您的贡献！🎉
