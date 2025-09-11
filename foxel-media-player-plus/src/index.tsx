import React from 'react';
import { createRoot } from 'react-dom/client';
import { RegisteredPlugin } from '../foxel.d';
import App from './App';

let root: any = null;

// 从构建时注入的环境变量获取版本信息
declare const PLUGIN_VERSION: string;
declare const PLUGIN_AUTHOR: string;

const plugin: RegisteredPlugin = {
  key: 'com.foxel-plus.media-player-plus',
  name: '媒体播放器 Plus',
  version: PLUGIN_VERSION,
  description: '功能强大的媒体播放器插件，支持音频/视频播放、播放列表管理、歌词显示、音频可视化、多种主题等丰富功能',
  author: PLUGIN_AUTHOR,
  website: 'https://github.com/maxage/foxel-plus',
  github: 'https://github.com/maxage/foxel-plus',
  supportedExts: [
    // 音频格式
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus',
    // 视频格式
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp',
    // 字幕格式
    'srt', 'vtt', 'ass', 'ssa',
    // 歌词格式
    'lrc', 'txt'
  ],
  defaultBounds: {
    x: 100,
    y: 100,
    width: 1200,
    height: 800
  },
  defaultMaximized: false,
  icon: 'https://img.icons8.com/bubbles/100/circled-play.png',

  mount: (container: HTMLElement, ctx) => {
    try {
      // 设置容器 ID 用于样式隔离
      container.id = 'foxel-media-player-plus';
      
      // 清理容器
      container.innerHTML = '';

      // 创建 React root
      root = createRoot(container);
      root.render(<App ctx={ctx} />);
    } catch (error) {
      console.error('媒体播放器插件挂载失败:', error);
      container.innerHTML = '<div style="padding: 20px; color: #ff6b6b; font-family: monospace;">媒体播放器加载失败，请刷新页面重试</div>';
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
    } catch (error) {
      console.error('媒体播放器插件卸载失败:', error);
    }
  }
};

// 注册插件
if (typeof window !== 'undefined' && window.FoxelRegister) {
  window.FoxelRegister(plugin);
} else {
  console.warn('FoxelRegister 函数未找到，插件可能无法正常工作');
  setTimeout(() => {
    if (window.FoxelRegister) {
      window.FoxelRegister(plugin);
      console.log('媒体播放器插件延迟注册成功');
    }
  }, 100);
}
