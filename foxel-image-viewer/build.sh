#!/bin/bash

# Foxel 图片查看器插件构建脚本

echo "🚀 开始构建 Foxel 图片查看器插件..."

# 检查是否存在 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 清理之前的构建
echo "🧹 清理之前的构建..."
npm run clean

# 创建 dist 目录
mkdir -p dist

# 构建插件
echo "🔨 构建插件..."
npm run build

# 检查构建结果
if [ -f "dist/plugin.js" ]; then
    echo "✅ 构建成功！"
    echo "📁 输出文件: dist/plugin.js"
    echo "📊 文件大小: $(du -h dist/plugin.js | cut -f1)"
    echo ""
    echo "🎯 使用方法:"
    echo "1. 将 dist/plugin.js 复制到 Foxel 的 web/public/plugins/ 目录"
    echo "2. 在 Foxel 的'应用'页面安装插件"
    echo "3. 选择图片文件即可使用图片查看器"
else
    echo "❌ 构建失败！"
    exit 1
fi
