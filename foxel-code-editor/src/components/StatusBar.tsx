import React from 'react';
import { FileInfo } from '../types';

interface StatusBarProps {
  fileInfo: FileInfo | null;
  isEditMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ fileInfo, isEditMode }) => {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        {fileInfo && (
          <>
            <span>{fileInfo.language}</span>
            <span>{fileInfo.lines} 行</span>
            <span>{(fileInfo.size / 1024).toFixed(1)}KB</span>
          </>
        )}
      </div>
      <div className="status-bar-right">
        <span>快捷键:</span>
        <span>Ctrl+F(搜索)</span>
        <span>Ctrl+S({isEditMode ? '保存' : '下载'})</span>
        <span>Ctrl+E(编辑)</span>
        <span>Ctrl+Shift+C(复制)</span>
        <span>Ctrl+±(字体)</span>
        <span>Ctrl+0(重置字体)</span>
        <span>Ctrl+I(信息)</span>
        <span>Esc(关闭面板)</span>
      </div>
    </div>
  );
};