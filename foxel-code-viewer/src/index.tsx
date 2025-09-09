import React from 'react';
import { createRoot } from 'react-dom/client';
import { RegisteredPlugin } from '../foxel.d';
import App from './App';

let root: any = null;

// 从 package.json 读取版本号（在构建时会被替换）
const VERSION = '1.0.0';

const plugin: RegisteredPlugin = {
  key: 'com.foxel-plus.code-viewer-plus',
  name: '代码查看器 Plus',
  version: VERSION,
  description: '功能强大的代码查看器插件，支持语法高亮、主题切换、搜索、折叠、复制等丰富功能',
  author: 'Foxel Plus Team @ maxage',
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
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggNEM2Ljg5NTQzIDQgNiA0Ljg5NTQzIDYgNlYxOEM2IDE5LjEwNDYgNi44OTU0MyAyMCA4IDIwSDE2QzE3LjEwNDYgMjAgMTggMTkuMTA0NiAxOCAxOFY2QzE4IDQuODk1NDMgMTcuMTA0NiA0IDE2IDRIOFoiIGZpbGw9IiMzMzMzMzMiLz4KPHBhdGggZD0iTTEwIDhIMTRWMTBIMTBWOFoiIGZpbGw9IiNmZmZmZmYiLz4KPHBhdGggZD0iTTEwIDEySDE2VjE0SDEwVjEyWiIgZmlsbD0iI2ZmZmZmZiIvPgo8cGF0aCBkPSJNMTAgMTZIMTRWMThIMTBWMTZaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=',

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
