const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Foxel Media Player Plus plugin...');

// 检查必要文件
const requiredFiles = [
  'package.json',
  'dist/plugin.js',
  'src/index.tsx',
  'src/App.tsx'
];

let hasErrors = false;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required file: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found: ${file}`);
  }
});

// 检查 dist/plugin.js 是否存在且不为空
const pluginPath = path.join(__dirname, 'dist/plugin.js');
if (fs.existsSync(pluginPath)) {
  const stats = fs.statSync(pluginPath);
  if (stats.size === 0) {
    console.error('❌ dist/plugin.js is empty');
    hasErrors = true;
  } else {
    console.log(`✅ dist/plugin.js size: ${stats.size} bytes`);
  }
} else {
  console.error('❌ dist/plugin.js not found');
  hasErrors = true;
}

// 检查 package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`✅ Package: ${pkg.name} v${pkg.version}`);
    
    if (!pkg.name.includes('media-player')) {
      console.warn('⚠️  Package name should include "media-player"');
    }
  } catch (error) {
    console.error('❌ Invalid package.json:', error.message);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.log('\n❌ Plugin validation failed');
  process.exit(1);
} else {
  console.log('\n✅ Plugin validation passed');
}
