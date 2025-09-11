import React from 'react';
import { createRoot } from 'react-dom/client';
import { RegisteredPlugin } from '../foxel.d';
import App from './App';

let root: any = null;

// 从 package.json 读取版本号（在构建时会被替换）
const VERSION = '1.0.0';

const plugin: RegisteredPlugin = {
  key: 'com.foxel-plus.media-player-plus',
  name: '媒体播放器 Plus',
  version: VERSION,
  description: '功能强大的媒体播放器插件，支持音频/视频播放、播放列表管理、歌词显示、音频可视化、多种主题等丰富功能',
  author: 'Jason',
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
      // 清理容器
      container.innerHTML = '';

      root = createRoot(container);
      root.render(<App ctx={ctx} />);
    } catch (error) {
      console.error('Foxel Media Player Plus mount error:', error);
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
