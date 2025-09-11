import React from 'react';
import { createRoot } from 'react-dom/client';
import { RegisteredPlugin } from '../foxel.d';
import App from './App';

let root: any = null;

// 从 package.json 读取版本号（在构建时会被替换）
const VERSION = '1.0.0';

const plugin: RegisteredPlugin = {
  key: 'com.foxel-plus.code-editor-plus',
  name: '代码编辑器 Plus',
  version: VERSION,
  description: '功能强大的代码编辑器插件，支持语法高亮、主题切换、搜索、编辑、保存、折叠、复制等丰富功能',
  author: 'Jason',
  website: 'https://github.com/maxage/foxel-plus',
  github: 'https://github.com/maxage/foxel-plus',
  supportedExts: [
    'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
    'html', 'htm', 'xml', 'css', 'scss', 'sass', 'less',
    'json', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
    'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'php',
    'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'clj',
    'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat',
    'sql', 'md', 'txt', 'log', 'diff', 'patch',
    'dockerfile', 'makefile', 'cmake', 'gradle',
    'xml', 'svg', 'graphql', 'gql'
  ],
  defaultBounds: {
    x: 100,
    y: 100,
    width: 1000,
    height: 700
  },
  defaultMaximized: false,
  icon: 'https://img.icons8.com/cotton/100/source-code--v1.png',

  mount: (container: HTMLElement, ctx) => {
    try {
      // 清理容器
      container.innerHTML = '';

      root = createRoot(container);
      root.render(<App ctx={ctx} />);
    } catch (error) {
      console.error('Foxel Code Viewer Plus mount error:', error);
    }
  },

  unmount: (container: HTMLElement) => {
    if (root) {
      root.unmount();
      root = null;
    }
  }
};

window.FoxelRegister(plugin);
