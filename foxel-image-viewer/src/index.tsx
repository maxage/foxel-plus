import React from 'react';
import { createRoot } from 'react-dom/client';
import { RegisteredPlugin } from '../foxel.d';
import App from './App';

let root: any = null;

const plugin: RegisteredPlugin = {
  key: 'com.example.image-viewer',
  name: '图片查看器',
  version: '1.0.0',
  description: '一个功能丰富的图片查看器插件，支持缩放、拖拽、旋转等操作',
  author: 'Your Name',
  supportedExts: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'],
  defaultBounds: {
    x: 100,
    y: 100,
    width: 800,
    height: 600
  },
  defaultMaximized: false,
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJMMTEgMTRMMTUgMTBMMjEgMTZWMThIM1YxNkw5IDEyWiIgZmlsbD0iIzMzMzMzMyIvPgo8cGF0aCBkPSJNMyA2SDE5VjEwSDNWNloiIGZpbGw9IiMzMzMzMzMiLz4KPHBhdGggZD0iTTMgMTRIMTlWMTZIM1YxNFoiIGZpbGw9IiMzMzMzMzMiLz4KPC9zdmc+',
  
  mount: (container: HTMLElement, ctx) => {
    // 清理容器
    container.innerHTML = '';
    
    // 创建 React root
    root = createRoot(container);
    
    // 渲染应用
    root.render(React.createElement(App, { ctx }));
  },
  
  unmount: (container: HTMLElement) => {
    // 清理 React root
    if (root) {
      root.unmount();
      root = null;
    }
    
    // 清理容器
    container.innerHTML = '';
  }
};

// 注册插件
if (typeof window !== 'undefined' && window.FoxelRegister) {
  window.FoxelRegister(plugin);
} else {
  console.error('FoxelRegister not found on window object');
}
