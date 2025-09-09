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
  entry: {
    name: string;
    path: string;
    size: number;
    isDirectory: boolean;
  };
  urls: {
    downloadUrl: string;
  };
  host: {
    close: () => void;
    saveFile?: (content: string) => Promise<void>;
    uploadFile?: (blob: Blob, filename: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    FoxelRegister: (plugin: RegisteredPlugin) => void;
  }
}
