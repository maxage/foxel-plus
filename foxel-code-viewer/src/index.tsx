import React from 'react';
import { createRoot } from 'react-dom/client';
import { RegisteredPlugin } from '../foxel.d';
import App from './App';

let root: any = null;

// 从构建时注入的环境变量获取版本信息
declare const PLUGIN_VERSION: string;
declare const PLUGIN_AUTHOR: string;

const plugin: RegisteredPlugin = {
  key: 'com.foxel-plus.code-viewer-plus',
  name: '代码查看器 Plus',
  version: PLUGIN_VERSION,
  description: '功能强大的代码查看器插件，支持语法高亮、预览、主题切换、搜索、折叠等丰富功能',
  author: PLUGIN_AUTHOR,
  website: 'https://github.com/maxage/foxel-plus',
  github: 'https://github.com/maxage/foxel-plus',
  supportedExts: [
    // 编程语言
    'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'astro',
    'html', 'htm', 'xml', 'css', 'scss', 'sass', 'less', 'stylus',
    'json', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
    'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'clj',
    'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
    'sql', 'md', 'txt', 'log', 'diff', 'patch',
    'dockerfile', 'makefile', 'cmake', 'gradle',
    'graphql', 'gql', 'prisma', 'proto',
    // 配置文件
    'env', 'gitignore', 'gitattributes', 'editorconfig',
    'eslintrc', 'prettierrc', 'babelrc', 'webpack',
    // 文档格式
    'rst', 'tex', 'latex', 'asciidoc', 'adoc',
    // 数据格式
    'csv', 'tsv', 'xml', 'svg', 'rss', 'atom'
  ],
  defaultBounds: {
    x: 100,
    y: 100,
    width: 1200,
    height: 800
  },
  defaultMaximized: false,
  icon: 'https://img.icons8.com/fluency/100/code.png',

  mount: (container: HTMLElement, ctx) => {
    try {
      // 设置容器 ID 用于样式隔离
      container.id = 'foxel-code-viewer-plus';
      
      // 清理容器
      container.innerHTML = '';

      // 创建 React root
      root = createRoot(container);
      root.render(<App ctx={ctx} />);
    } catch (error) {
      console.error('代码查看器插件挂载失败:', error);
      container.innerHTML = '<div style="padding: 20px; color: #ff6b6b; font-family: monospace;">代码查看器加载失败，请刷新页面重试</div>';
    }
  },

  unmount: (container: HTMLElement) => {
    try {
      if (root) {
        root.unmount();
        root = null;
      }
      container.innerHTML = '';
    } catch (error) {
      console.error('代码查看器插件卸载失败:', error);
    }
  }
};

// 注册插件
if (typeof window !== 'undefined' && window.FoxelRegister) {
  window.FoxelRegister(plugin);
} else {
  console.warn('FoxelRegister 函数未找到，插件可能无法正常工作');
  // 延迟重试注册
  setTimeout(() => {
    if (window.FoxelRegister) {
      window.FoxelRegister(plugin);
      console.log('代码查看器插件延迟注册成功');
    }
  }, 100);
}
