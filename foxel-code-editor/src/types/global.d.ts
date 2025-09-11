declare global {
  interface Window {
    vfsApi?: {
      uploadFile: (filePath: string, blob: Blob) => Promise<void>;
    };
  }
}

// This file is intentionally left blank.
// It's used to declare global types.
export {};