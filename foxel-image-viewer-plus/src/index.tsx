import React from 'react';
import { createRoot } from 'react-dom/client';
import { RegisteredPlugin } from '../foxel.d';
import App from './App';

let root: any = null;

// 从构建时注入的环境变量获取版本信息
declare const PLUGIN_VERSION: string;
declare const PLUGIN_AUTHOR: string;

const plugin: RegisteredPlugin = {
  key: 'com.foxel-plus.image-viewer-plus',
  name: '图片查看器 Plus',
  version: PLUGIN_VERSION,
  description: '功能强大的图片查看器插件，支持缩放、拖拽、旋转、翻转、全屏、键盘快捷键等丰富功能',
  author: PLUGIN_AUTHOR,
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
  icon: 'https://img.icons8.com/scribby/100/image.png',
  
  mount: (container: HTMLElement, ctx) => {
    try {
      // 设置容器 ID 用于样式隔离
      container.id = 'foxel-image-viewer-plus';
      
      // 清理容器
      container.innerHTML = '';

      // 创建 React root
      root = createRoot(container);
      root.render(<App ctx={ctx} />);
    } catch (error) {
      console.error('图片查看器插件挂载失败:', error);
      container.innerHTML = '<div style="padding: 20px; color: #ff6b6b; font-family: monospace;">图片查看器加载失败，请刷新页面重试</div>';
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
