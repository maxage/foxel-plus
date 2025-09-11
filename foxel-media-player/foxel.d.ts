// Foxel Plugin Type Definitions
export interface PluginMountCtx {
  entry: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
  urls: {
    downloadUrl: string;
    thumbnailUrl?: string;
  };
  host: {
    close: () => void;
    saveFile?: (content: string) => Promise<void>;
    uploadFile?: (file: Blob, filename: string) => Promise<void>;
    showNotification?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  };
}

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
  icon: string;
  mount: (container: HTMLElement, ctx: PluginMountCtx) => void;
  unmount: (container: HTMLElement) => void;
}

declare global {
  interface Window {
    FoxelRegister: (plugin: RegisteredPlugin) => void;
    vfsApi?: {
      uploadFile: (filePath: string, blob: Blob) => Promise<void>;
      downloadFile: (filePath: string) => Promise<Blob>;
      listFiles: (path: string) => Promise<Array<{name: string, size: number, type: string, lastModified: number}>>;
    };
  }
}
