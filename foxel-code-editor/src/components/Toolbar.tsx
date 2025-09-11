import React from 'react';
import { FileInfo, CodeTheme } from '../types';

interface ToolbarProps {
  fileInfo: FileInfo | null;
  themes: CodeTheme[];
  currentTheme: CodeTheme;
  onThemeChange: (theme: CodeTheme) => void;
  onSearchClick: () => void;
  onSettingsClick: () => void;
  onInfoClick: () => void;
  onEditClick: () => void;
  onCopyClick: () => void;
  onDownloadClick: () => void;
  onFullscreenClick: () => void;
  onClose: () => void;
  isEditMode: boolean;
  isModified: boolean;
  isPreviewable: boolean;
  isPreviewMode: boolean;
  onPreviewClick: () => void;
  isSaving: boolean;
  onSave: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  fileInfo,
  themes,
  currentTheme,
  onThemeChange,
  onSearchClick,
  onSettingsClick,
  onInfoClick,
  onEditClick,
  onCopyClick,
  onDownloadClick,
  onFullscreenClick,
  onClose,
  isEditMode,
  isModified,
  isPreviewable,
  isPreviewMode,
  onPreviewClick,
  isSaving,
  onSave,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {fileInfo && (
          <>
            <span className="file-name">📄 {fileInfo.name}</span>
            <span className="file-details">
              {fileInfo.language} • {fileInfo.lines} 行 • {(fileInfo.size / 1024).toFixed(1)}KB
            </span>
          </>
        )}
      </div>
      <div className="toolbar-right">
        <button onClick={onSearchClick}>🔍 搜索</button>
        <button onClick={onEditClick}>{isEditMode ? '👁️ 查看' : '✏️ 编辑'}</button>
        {isModified && <span className="modified-indicator">●</span>}
        {isPreviewable && !isEditMode && (
          <button onClick={onPreviewClick}>{isPreviewMode ? '📝 代码' : '👁️ 预览'}</button>
        )}
        <select
          value={currentTheme.name}
          onChange={(e) => {
            const theme = themes.find(t => t.name === e.target.value);
            if (theme) onThemeChange(theme);
          }}
        >
          {themes.map(theme => (
            <option key={theme.name} value={theme.name}>
              {theme.name}
            </option>
          ))}
        </select>
        <button onClick={onSettingsClick}>⚙️ 设置</button>
        <button onClick={onInfoClick}>ℹ️ 信息</button>
        {isEditMode && isModified && (
          <button onClick={onSave} disabled={isSaving}>
            {isSaving ? '💾 保存中...' : '💾 保存'}
          </button>
        )}
        <button onClick={onCopyClick}>📋 复制</button>
        <button onClick={onDownloadClick}>💾 下载</button>
        <button onClick={onFullscreenClick}>⤢ 全屏</button>
        <button onClick={onClose} className="close-button">✕ 关闭</button>
      </div>
    </div>
  );
};