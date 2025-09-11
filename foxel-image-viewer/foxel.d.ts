// Foxel Plugin Type Definitions

export interface RegisteredPlugin {
  key: string;
  name: string;
  version: string;
  description: string;
  author: string;
  website?: string;
  github?: string;
  supportedExts: string[];
  defaultBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  defaultMaximized: boolean;
  icon?: string;
  mount: (container: HTMLElement, ctx: PluginMountCtx) => void;
  unmount: (container: HTMLElement) => void;
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
  urls: {
    downloadUrl: string;
  };
  host: {
    close: () => void;
  };
}

declare global {
  interface Window {
    FoxelRegister: (plugin: RegisteredPlugin) => void;
  }
}
