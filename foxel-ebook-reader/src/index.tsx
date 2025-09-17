import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RegisteredPlugin } from '../foxel.d';
import App from './App';

declare const PLUGIN_VERSION: string;
declare const PLUGIN_AUTHOR: string;

let root: Root | null = null;

const plugin: RegisteredPlugin = {
  key: 'com.foxel-plus.ebook-reader',
  name: '图书阅读器',
  version: PLUGIN_VERSION,
  description: '支持 TXT、Markdown、HTML、EPUB、PDF 的全功能电子书阅读器，提供目录、分页、主题和书签能力',
  author: PLUGIN_AUTHOR,
  website: 'https://github.com/maxage/foxel-plus',
  github: 'https://github.com/maxage/foxel-plus',
  supportedExts: ['txt', 'md', 'markdown', 'html', 'xhtml', 'epub', 'pdf'],
  defaultBounds: {
    x: 120,
    y: 80,
    width: 1180,
    height: 820
  },
  defaultMaximized: false,
  icon: 'https://img.icons8.com/doodle/96/book.png',

  mount: (container, ctx) => {
    try {
      container.id = 'foxel-ebook-reader';
      container.innerHTML = '';

      root = createRoot(container);
      root.render(<App ctx={ctx} />);
    } catch (error) {
      console.error('图书阅读器插件挂载失败:', error);
      container.innerHTML = '<div style="padding:20px;color:#ff6b6b;font-family:monospace;">图书阅读器加载失败，请刷新页面重试</div>';
    }
  },

  unmount: container => {
    try {
      if (root) {
        root.unmount();
        root = null;
      }
      container.innerHTML = '';
    } catch (error) {
      console.error('图书阅读器插件卸载失败:', error);
    }
  }
};

if (typeof window !== 'undefined') {
  const register = () => {
    try {
      window.FoxelRegister?.(plugin);
      console.log('Foxel 图书阅读器插件注册成功');
    } catch (error) {
      console.error('图书阅读器插件注册失败:', error);
    }
  };

  if (typeof window.FoxelRegister === 'function') {
    register();
  } else {
    console.warn('FoxelRegister 函数暂不可用，稍后重试注册');
    setTimeout(register, 120);
  }
} else {
  console.error('window 对象不存在，无法注册图书阅读器插件');
}

export default plugin;
