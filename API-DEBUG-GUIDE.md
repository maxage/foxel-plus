# 🔧 Foxel API 调试工具使用指南

本指南提供了多种方式来调试和测试 Foxel 插件系统，通过 API 调用来连接、认证和加载插件。

## 📋 工具列表

### 1. Web 界面调试工具
- **文件**: `api-debug-tool.html`
- **用途**: 基于浏览器的图形化调试界面
- **特点**: 直观易用，支持实时测试

### 2. Node.js 脚本
- **文件**: `api-plugin-test.js`
- **用途**: 命令行交互式测试
- **特点**: 适合自动化测试和脚本集成

### 3. Shell 脚本
- **文件**: `test-api.sh`
- **用途**: 快速命令行测试
- **特点**: 轻量级，无需额外依赖

## 🚀 快速开始

### 方法一：Web 界面（推荐）

1. **打开调试工具**
   ```bash
   # 在浏览器中打开
   open api-debug-tool.html
   # 或者
   python -m http.server 8000
   # 然后访问 http://localhost:8000/api-debug-tool.html
   ```

2. **配置连接**
   - API 基础 URL: `http://10.0.0.8:3737`
   - 输入用户名和密码
   - 点击"连接"按钮

3. **测试插件**
   - 在"插件管理"部分
   - 设置插件 URL: `https://github.com/maxage/foxel-plus/raw/main/foxel-image-viewer.js`
   - 设置插件名称: `foxel-image-viewer`
   - 点击"加载插件"

### 方法二：Node.js 脚本

1. **运行脚本**
   ```bash
   node api-plugin-test.js
   ```

2. **按提示输入**
   - API 基础 URL（默认: http://10.0.0.8:3737）
   - 用户名
   - 密码

3. **查看结果**
   - 脚本会自动测试连接、登录、加载插件
   - 显示详细的响应信息

### 方法三：Shell 脚本

1. **基本使用**
   ```bash
   ./test-api.sh
   ```

2. **自定义参数**
   ```bash
   # 自定义 API URL
   ./test-api.sh -u http://localhost:3737
   
   # 自定义插件
   ./test-api.sh -n my-plugin -p https://example.com/plugin.js
   
   # 查看帮助
   ./test-api.sh --help
   ```

## 🔍 API 端点说明

根据 Foxel API 文档，以下是常用的端点：

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 系统信息
- `GET /api/system/health` - 健康检查
- `GET /api/system/info` - 系统信息

### 插件管理
- `GET /api/plugins` - 获取插件列表
- `POST /api/plugins` - 创建插件
- `PUT /api/plugins/{plugin_id}` - 更新插件
- `DELETE /api/plugins/{plugin_id}` - 删除插件
- `POST /api/plugins/{plugin_id}/metadata` - 更新插件元数据

## 📝 使用示例

### 1. 检查 API 连接

```bash
curl -X GET http://10.0.0.8:3737/api/system/health
```

### 2. 用户登录

```bash
curl -X POST http://10.0.0.8:3737/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'grant_type=password&username=your_username&password=your_password'
```

### 3. 创建插件

```bash
curl -X POST http://10.0.0.8:3737/api/plugins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"url":"https://github.com/maxage/foxel-plus/raw/main/foxel-image-viewer.js","enabled":true}'
```

### 4. 获取插件列表

```bash
curl -X GET http://10.0.0.8:3737/api/plugins \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 常见问题

### 1. 连接失败
- 检查 API 基础 URL 是否正确
- 确认 Foxel 服务是否正在运行
- 检查网络连接和防火墙设置

### 2. 认证失败
- 确认用户名和密码正确
- 检查 API 端点路径是否正确
- 查看服务器日志了解详细错误

### 3. 插件加载失败
- 检查插件 URL 是否可访问
- 确认插件格式是否符合 Foxel 标准
- 查看插件加载日志

### 4. CORS 问题
- 如果使用浏览器测试，可能遇到 CORS 问题
- 建议使用 Node.js 脚本或 curl 进行测试
- 或者配置 Foxel 服务器允许跨域请求

## 🔧 调试技巧

### 1. 查看详细日志
```bash
# 使用 curl 查看详细响应
curl -v -X GET http://10.0.0.8:3737/api/system/health
```

### 2. 检查响应头
```bash
# 只查看响应头
curl -I http://10.0.0.8:3737/api/system/health
```

### 3. 保存响应到文件
```bash
# 保存响应到文件
curl -X GET http://10.0.0.8:3737/api/plugins \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o plugins.json
```

### 4. 使用 jq 格式化 JSON
```bash
# 安装 jq
brew install jq  # macOS
apt-get install jq  # Ubuntu

# 格式化 JSON 输出
curl -X GET http://10.0.0.8:3737/api/plugins \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

## 📚 相关文档

- [Foxel 官方文档](https://foxel.cc/guide/plugins-guide.html)
- [Foxel GitHub 仓库](https://github.com/DrizzleTime/Foxel)
- [项目 GitHub 仓库](https://github.com/maxage/foxel-plus)

## 🤝 贡献

如果你发现任何问题或有改进建议，请：

1. 提交 Issue
2. 创建 Pull Request
3. 联系维护者

---

**注意**: 请根据实际的 Foxel API 文档调整端点路径和参数格式。本指南基于常见的 REST API 模式编写，可能与实际实现有所不同。
