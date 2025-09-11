import React, { useRef } from 'react';
import { PluginMountCtx } from '../foxel.d';
import { useCodeViewer } from './hooks/useCodeViewer';
import { useEditor } from './hooks/useEditor';
import { useSettings } from './hooks/useSettings';
import { useUIState } from './hooks/useUIState';
import { Toolbar } from './components/Toolbar';
import { CodeView } from './components/CodeView';
import { EditorView } from './components/EditorView';
import { Preview } from './components/Preview';
import { StatusBar } from './components/StatusBar';
import { isPreviewable } from './utils/preview';
import { themes } from './constants/themes';
import './styles/Toolbar.css';
import './styles/CodeView.css';
import './styles/Preview.css';
import './styles/App.css';
import './styles/StatusBar.css';

interface AppProps {
  ctx: PluginMountCtx;
}

const App: React.FC<AppProps> = ({ ctx }) => {
  const { code: initialCode, loading, error, fileInfo, loadCode } = useCodeViewer(ctx);
  const {
    code,
    isModified,
    isSaving,
    saveError,
    saveSuccess,
    handleCodeChange,
    saveCode
  } = useEditor(ctx, initialCode);
  const {
    currentTheme,
    setCurrentTheme,
    showLineNumbers,
    wordWrap,
    fontSize,
    enableCodeFolding,
  } = useSettings();
  const {
    editMode,
    previewMode,
    showSearch,
    showSettings,
    showInfo,
    isFullscreen,
    setPreviewMode,
    setShowSearch,
    setShowSettings,
    setShowInfo,
    toggleEditMode,
  } = useUIState({ isModified, saveCode });

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) {
    return <div>加载代码文件中...</div>;
  }

  if (error) {
    return (
      <div>
        <div>加载失败: {error}</div>
        <button onClick={loadCode}>重试</button>
      </div>
    );
  }

  return (
    <div ref={containerRef} id="foxel-code-editor-plus" className="app-container">
      <Toolbar
        fileInfo={fileInfo}
        themes={themes}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        onSearchClick={() => setShowSearch(!showSearch)}
        onSettingsClick={() => setShowSettings(!showSettings)}
        onInfoClick={() => setShowInfo(!showInfo)}
        onEditClick={toggleEditMode}
        onCopyClick={() => navigator.clipboard.writeText(code)}
        onDownloadClick={() => {
          const blob = new Blob([code], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileInfo?.name || 'file.txt';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}
        onFullscreenClick={toggleFullscreen}
        onClose={ctx.host.close}
        isEditMode={editMode}
        isModified={isModified}
        isPreviewable={fileInfo ? isPreviewable(fileInfo.language) : false}
        isPreviewMode={previewMode}
        onPreviewClick={() => setPreviewMode(!previewMode)}
        isSaving={isSaving}
        onSave={saveCode}
      />
      <div className="content-area">
        {editMode ? (
          <EditorView
            code={code}
            onCodeChange={handleCodeChange}
            theme={currentTheme}
            wordWrap={wordWrap}
            fontSize={fontSize}
          />
        ) : previewMode && fileInfo && isPreviewable(fileInfo.language) ? (
          <Preview
            code={code}
            language={fileInfo.language}
            theme={currentTheme}
            fontSize={fontSize}
          />
        ) : (
          <CodeView
            code={code}
            language={fileInfo?.language || 'text'}
            theme={currentTheme}
            showLineNumbers={showLineNumbers}
            wordWrap={wordWrap}
            fontSize={fontSize}
            enableCodeFolding={enableCodeFolding}
          />
        )}
      </div>
      <StatusBar fileInfo={fileInfo} isEditMode={editMode} />
    </div>
  );
};

export default App;
