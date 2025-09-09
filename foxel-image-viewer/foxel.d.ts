// Foxel 插件类型定义
export interface RegisteredPlugin {
  mount: (container: HTMLElement, ctx: PluginMountCtx) => void | Promise<void>;
  unmount?: (container: HTMLElement) => void | Promise<void>;
  key?: string;
  name?: string;
  version?: string;
  supportedExts?: string[];
  defaultBounds?: { x?: number; y?: number; width?: number; height?: number };
  defaultMaximized?: boolean;
  icon?: string;
  description?: string;
  author?: string;
  website?: string;
  github?: string;
}

export interface PluginMountCtx {
  filePath: string;
  entry: {
    name: string;
    is_dir: boolean;
    size: number;
    mtime: number;
    type?: string;
    is_image?: boolean;
  };
  urls: { downloadUrl: string };
  host: { close: () => void };
}

declare global {
  interface Window {
    FoxelRegister?: (plugin: RegisteredPlugin) => void;
  }
}
