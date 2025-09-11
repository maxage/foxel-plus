import { useState, useEffect, useCallback } from 'react';
import { PluginMountCtx } from '../../foxel.d';
import { detectLanguage } from '../utils/language';
import { FileInfo } from '../types';

export const useCodeViewer = (ctx: PluginMountCtx) => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  const loadCode = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(ctx.urls.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      setCode(text);
      
      const language = detectLanguage(ctx.entry.name);
      const lines = text.split('\n').length;
      
      setFileInfo({
        name: ctx.entry.name,
        size: ctx.entry.size,
        lines,
        language
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文件失败');
    } finally {
      setLoading(false);
    }
  }, [ctx.urls.downloadUrl, ctx.entry.name, ctx.entry.size]);

  useEffect(() => {
    loadCode();
  }, [loadCode]);

  return { code, loading, error, fileInfo, loadCode };
};