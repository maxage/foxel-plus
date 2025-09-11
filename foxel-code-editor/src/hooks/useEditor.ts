import { useState } from 'react';
import { PluginMountCtx } from '../../foxel.d';

export const useEditor = (ctx: PluginMountCtx, initialCode: string) => {
  const [code, setCode] = useState<string>(initialCode);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsModified(true);
  };

  const saveCode = async () => {
    if (!isModified) return;
    
    try {
      setIsSaving(true);
      setSaveError('');
      
      let saved = false;
      
      if (window.vfsApi && typeof window.vfsApi.uploadFile === 'function') {
        try {
          const blob = new Blob([code], { type: 'text/plain' });
          await window.vfsApi.uploadFile(ctx.entry.name, blob);
          saved = true;
        } catch (err) {
          console.log('vfsApi.uploadFile 失败:', err);
        }
      }
      
      if (!saved && ctx.host && typeof ctx.host.saveFile === 'function') {
        try {
          await ctx.host.saveFile(code);
          saved = true;
        } catch (err) {
          console.log('ctx.host.saveFile 失败:', err);
        }
      }
      
      if (!saved && ctx.host && typeof ctx.host.uploadFile === 'function') {
        try {
          const blob = new Blob([code], { type: 'text/plain' });
          await ctx.host.uploadFile(blob, ctx.entry.name);
          saved = true;
        } catch (err) {
          console.log('ctx.host.uploadFile 失败:', err);
        }
      }
      
      if (!saved) {
        try {
          const response = await fetch('/api/files/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: ctx.entry.name,
              content: code
            })
          });
          
          if (response.ok) {
            saved = true;
          }
        } catch (err) {
          console.log('/api/files/save 失败:', err);
        }
      }
      
      if (!saved) {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = ctx.entry.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('由于 Foxel 暂不支持直接保存，已为您下载修改后的文件。请手动替换原文件。');
        saved = true;
      }
      
      if (saved) {
        setIsModified(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
      
      setIsSaving(false);
      
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败');
      setIsSaving(false);
      setTimeout(() => setSaveError(''), 3000);
    }
  };

  return {
    code,
    isModified,
    isSaving,
    saveError,
    saveSuccess,
    handleCodeChange,
    saveCode
  };
};