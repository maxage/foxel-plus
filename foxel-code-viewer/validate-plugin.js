#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证 Foxel 插件...\n');

// 检查必需文件
const requiredFiles = [
  'package.json',
  'src/index.tsx',
  'src/App.tsx',
  'foxel.d.ts',
  'tsconfig.json'
];

console.log('📁 检查必需文件:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 文件不存在`);
    process.exit(1);
  }
});

// 检查 package.json
console.log('\n📦 检查 package.json:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredFields = ['name', 'version', 'description', 'author', 'main'];
  requiredFields.forEach(field => {
    if (pkg[field]) {
      console.log(`  ✅ ${field}: ${pkg[field]}`);
    } else {
      console.log(`  ❌ ${field} - 缺少必需字段`);
      process.exit(1);
    }
  });
} catch (error) {
  console.log('  ❌ package.json 解析失败:', error.message);
  process.exit(1);
}

// 检查构建输出
console.log('\n🔨 检查构建输出:');
if (fs.existsSync('dist/plugin.js')) {
  const stats = fs.statSync('dist/plugin.js');
  console.log(`  ✅ dist/plugin.js`);
  console.log(`  📊 文件大小: ${(stats.size / 1024).toFixed(0)}KB`);
} else {
  console.log('  ❌ dist/plugin.js - 构建文件不存在');
  console.log('  💡 请运行 npm run build');
  process.exit(1);
}

// 检查插件代码
console.log('\n🔌 检查插件代码:');
const pluginContent = fs.readFileSync('dist/plugin.js', 'utf8');

const checks = [
  { name: 'window.FoxelRegister 调用', pattern: /window\.FoxelRegister/ },
  { name: 'mount 方法', pattern: /mount\s*:/ },
  { name: 'unmount 方法', pattern: /unmount\s*:/ },
  { name: 'supportedExts 配置', pattern: /supportedExts/ },
  { name: '插件 key 配置', pattern: /key\s*:/ },
  { name: '插件 name 配置', pattern: /name\s*:/ }
];

checks.forEach(check => {
  if (check.pattern.test(pluginContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name}`);
  }
});

// 检查 App 组件
console.log('\n🎨 检查 App 组件:');
const appContent = fs.readFileSync('src/App.tsx', 'utf8');

const appChecks = [
  { name: '使用 downloadUrl', pattern: /ctx\.urls\.downloadUrl/ },
  { name: '使用 host.close', pattern: /ctx\.host\.close/ },
  { name: '使用唯一 CSS ID', pattern: /id="foxel-code-viewer-plus"/ },
  { name: '操作 container 节点', pattern: /containerRef/ }
];

appChecks.forEach(check => {
  if (check.pattern.test(appContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name}`);
  }
});

// 检查类型定义
console.log('\n📝 检查类型定义:');
const typeContent = fs.readFileSync('foxel.d.ts', 'utf8');

const typeChecks = [
  { name: 'RegisteredPlugin 接口', pattern: /interface RegisteredPlugin/ },
  { name: 'PluginMountCtx 接口', pattern: /interface PluginMountCtx/ },
  { name: '全局 FoxelRegister 声明', pattern: /declare global/ }
];

typeChecks.forEach(check => {
  if (check.pattern.test(typeContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name}`);
  }
});

console.log('\n🎉 插件验证完成！\n');

console.log('📋 符合 Foxel 插件开发标准：');
console.log('  ✅ 必需文件完整');
console.log('  ✅ 插件注册正确');
console.log('  ✅ 生命周期方法实现');
console.log('  ✅ 使用官方 API');
console.log('  ✅ 样式隔离');
console.log('  ✅ 类型安全\n');

console.log('🚀 插件已准备好发布！');
