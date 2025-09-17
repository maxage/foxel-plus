#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const log = (icon, msg) => console.log(`${icon} ${msg}`);
const exitWithError = (msg) => {
  log('❌', msg);
  process.exit(1);
};

log('🔍', '开始验证 Foxel 图书阅读器插件\n');

const requiredFiles = [
  'package.json',
  'src/index.tsx',
  'src/App.tsx',
  'foxel.d.ts',
  'tsconfig.json'
];

log('📁', '检查必需文件');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    log('✅', file);
  } else {
    exitWithError(`缺少必需文件: ${file}`);
  }
});

log('\n📦', '解析 package.json');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const expectedName = 'foxel-ebook-reader';
if (pkg.name !== expectedName) {
  exitWithError(`package.json name 应为 ${expectedName}，当前为 ${pkg.name}`);
}

if (pkg.main !== 'dist/plugin.js') {
  exitWithError('package.json main 字段必须指向 dist/plugin.js');
}

if (!pkg.description || !pkg.description.includes('ebook')) {
  log('⚠️', '建议在 description 中包含 ebook / reader 关键词');
}

if (!pkg.scripts || !pkg.scripts.build) {
  exitWithError('缺少 npm run build 脚本');
}

const indexSource = fs.readFileSync('src/index.tsx', 'utf-8');
const requiredMatches = [
  { pattern: /key:\s*'com\.foxel-plus\.ebook-reader'/, hint: '插件 key 应为 com.foxel-plus.ebook-reader' },
  { pattern: /name:\s*'图书阅读器'/, hint: '插件中文名称应为 “图书阅读器”' },
  { pattern: /supportedExts:\s*\[[^\]]*'epub'[^\]]*\]/, hint: 'supportedExts 需要包含 epub' },
  { pattern: /supportedExts:\s*\[[^\]]*'pdf'[^\]]*\]/, hint: 'supportedExts 需要包含 pdf' },
  { pattern: /icon:\s*'https:\/\/img\.icons8\.com\/doodle\/96\/book\.png'/, hint: 'icon URL 必须为指定图标' }
];

log('\n🔌', '检查 src/index.tsx 关键配置');
requiredMatches.forEach(({ pattern, hint }) => {
  if (!pattern.test(indexSource)) {
    exitWithError(hint);
  }
});
log('✅', '入口配置检查通过');

const appSource = fs.readFileSync('src/App.tsx', 'utf-8');

log('\n🧠', '检查核心功能代码');
[
  { pattern: /EPUB/, message: 'EPUB 解析逻辑' },
  { pattern: /PDF/, message: 'PDF 支持逻辑' },
  { pattern: /localStorage/, message: '阅读进度持久化' },
  { pattern: /search/i, message: '搜索功能' },
  { pattern: /bookmark/i, message: '书签功能' }
].forEach(({ pattern, message }) => {
  if (pattern.test(appSource)) {
    log('✅', message);
  } else {
    exitWithError(`缺少 ${message} 相关代码`);
  }
});

log('\n🛡', '检查 dist 目录状态');
if (fs.existsSync('dist/plugin.js')) {
  const size = fs.statSync('dist/plugin.js').size;
  log('✅', `dist/plugin.js 已存在，文件大小 ${Math.round(size / 1024)}KB`);
} else {
  log('ℹ️', '提示：dist/plugin.js 尚未生成，可通过 npm run build 构建');
}

log('\n🎉', '验证通过，插件结构与配置符合项目规范\n');
