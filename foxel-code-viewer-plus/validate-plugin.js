const fs = require('fs');
const path = require('path');

console.log('🔍 验证 Foxel Code Viewer Plus 插件...');

// 检查必需文件
const requiredFiles = [
  'src/index.tsx',
  'src/App.tsx',
  'package.json',
  'foxel.d.ts',
  'tsconfig.json'
];

let hasErrors = false;

requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`❌ 缺少必需文件: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ 找到文件: ${file}`);
  }
});

// 检查 package.json
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (pkg.name !== 'foxel-code-viewer-plus') {
    console.error('❌ package.json 中的 name 字段不正确');
    hasErrors = true;
  }
  
  if (!pkg.scripts || !pkg.scripts.build) {
    console.error('❌ package.json 中缺少 build 脚本');
    hasErrors = true;
  }
  
  console.log('✅ package.json 验证通过');
} catch (error) {
  console.error('❌ package.json 解析失败:', error.message);
  hasErrors = true;
}

// 检查插件入口文件
try {
  const indexContent = fs.readFileSync('src/index.tsx', 'utf8');
  
  if (!indexContent.includes('com.foxel-plus.code-viewer-plus')) {
    console.error('❌ 插件 key 不正确');
    hasErrors = true;
  }
  
  if (!indexContent.includes('window.FoxelRegister')) {
    console.error('❌ 缺少插件注册代码');
    hasErrors = true;
  }
  
  console.log('✅ 插件入口文件验证通过');
} catch (error) {
  console.error('❌ 无法读取 src/index.tsx:', error.message);
  hasErrors = true;
}

if (hasErrors) {
  console.log('\n❌ 插件验证失败，请修复上述错误');
  process.exit(1);
} else {
  console.log('\n✅ 插件验证通过！');
}
