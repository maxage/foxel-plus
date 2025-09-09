import React from 'react';
import { createRoot } from 'react-dom/client';
import { RegisteredPlugin } from '../foxel.d';
import App from './App';

let root: any = null;

const plugin: RegisteredPlugin = {
  key: 'com.foxel-plus.image-viewer-plus',
  name: '图片查看器 Plus',
  version: '1.1.0',
  description: '功能强大的图片查看器插件，支持缩放、拖拽、旋转、翻转、全屏、键盘快捷键等丰富功能',
  author: 'Foxel Plus Team @ maxage',
  website: 'https://github.com/maxage/foxel-plus',
  github: 'https://github.com/maxage/foxel-plus',
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
    try {
      // 清理容器
      container.innerHTML = '';
      
      // 创建 React root
      root = createRoot(container);
      
      // 渲染应用
      root.render(React.createElement(App, { ctx }));
      
      console.log('Foxel Plus 图片查看器插件已挂载');
    } catch (error) {
      console.error('插件挂载失败:', error);
      container.innerHTML = '<div style="padding: 20px; color: #ff6b6b;">插件加载失败，请刷新页面重试</div>';
    }
  },
  
  unmount: (container: HTMLElement) => {
    try {
      // 清理 React root
      if (root) {
        root.unmount();
        root = null;
      }
      
      // 清理容器
      container.innerHTML = '';
      
      console.log('Foxel Plus 图片查看器插件已卸载');
    } catch (error) {
      console.error('插件卸载失败:', error);
    }
  }
};

// 注册插件
if (typeof window !== 'undefined') {
  if (window.FoxelRegister) {
    try {
      window.FoxelRegister(plugin);
      console.log('Foxel Plus 图片查看器插件注册成功');
    } catch (error) {
      console.error('插件注册失败:', error);
    }
  } else {
    console.warn('FoxelRegister 函数未找到，插件可能无法正常工作');
    // 延迟重试注册
    setTimeout(() => {
      if (window.FoxelRegister) {
        window.FoxelRegister(plugin);
        console.log('Foxel Plus 图片查看器插件延迟注册成功');
      }
    }, 100);
  }
} else {
  console.error('window 对象未定义，插件无法注册');
}
