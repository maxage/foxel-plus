import React, { useState, useEffect, useCallback } from 'react';
import { PluginMountCtx } from '../foxel.d';

// 内联类型定义
interface LanguageConfig {
  name: string;
  extensions: string[];
  prismLanguage: string;
  mimeType?: string;
  canPreview?: boolean;
  previewType?: 'html' | 'markdown' | 'json' | 'image';
}

interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    selection: string;
    comment: string;
    keyword: string;
    string: string;
    number: string;
    function: string;
    variable: string;
    error: string;
    warning: string;
  };
}

interface AppProps {
  ctx: PluginMountCtx;
}

// 支持的语言配置
const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    name: 'JavaScript',
    extensions: ['js', 'jsx', 'mjs', 'cjs'],
    prismLanguage: 'javascript',
    mimeType: 'application/javascript'
  },
  {
    name: 'TypeScript',
    extensions: ['ts', 'tsx'],
    prismLanguage: 'typescript',
    mimeType: 'application/typescript'
  },
  {
    name: 'HTML',
    extensions: ['html', 'htm'],
    prismLanguage: 'html',
    mimeType: 'text/html',
    canPreview: true,
    previewType: 'html'
  },
  {
    name: 'CSS',
    extensions: ['css'],
    prismLanguage: 'css',
    mimeType: 'text/css'
  },
  {
    name: 'JSON',
    extensions: ['json'],
    prismLanguage: 'json',
    mimeType: 'application/json',
    canPreview: true,
    previewType: 'json'
  },
  {
    name: 'Markdown',
    extensions: ['md', 'markdown'],
    prismLanguage: 'markdown',
    mimeType: 'text/markdown',
    canPreview: true,
    previewType: 'markdown'
  },
  {
    name: 'Python',
    extensions: ['py', 'pyw', 'pyi'],
    prismLanguage: 'python',
    mimeType: 'text/x-python'
  },
  {
    name: 'Java',
    extensions: ['java'],
    prismLanguage: 'java',
    mimeType: 'text/x-java'
  },
  {
    name: 'C',
    extensions: ['c', 'h'],
    prismLanguage: 'c',
    mimeType: 'text/x-c'
  },
  {
    name: 'C++',
    extensions: ['cpp', 'cxx', 'cc', 'hpp', 'hxx'],
    prismLanguage: 'cpp',
    mimeType: 'text/x-c++'
  },
  {
    name: 'Text',
    extensions: ['txt', 'log'],
    prismLanguage: 'text',
    mimeType: 'text/plain'
  }
];

// 主题配置
const THEMES: Theme[] = [
  {
    id: 'vs-light',
    name: 'Visual Studio Light',
    type: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#007acc',
      secondary: '#6a6a6a',
      accent: '#007acc',
      border: '#d3d3d3',
      selection: '#add6ff',
      comment: '#008000',
      keyword: '#0000ff',
      string: '#a31515',
      number: '#098658',
      function: '#795e26',
      variable: '#001080',
      error: '#f44747',
      warning: '#ffcc02'
    }
  },
  {
    id: 'vs-dark',
    name: 'Visual Studio Dark',
    type: 'dark',
    colors: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      primary: '#569cd6',
      secondary: '#808080',
      accent: '#569cd6',
      border: '#3c3c3c',
      selection: '#264f78',
      comment: '#6a9955',
      keyword: '#569cd6',
      string: '#ce9178',
      number: '#b5cea8',
      function: '#dcdcaa',
      variable: '#9cdcfe',
      error: '#f44747',
      warning: '#ffcc02'
    }
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    type: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#24292e',
      primary: '#0366d6',
      secondary: '#586069',
      accent: '#0366d6',
      border: '#e1e4e8',
      selection: '#c8e1ff',
      comment: '#6a737d',
      keyword: '#d73a49',
      string: '#032f62',
      number: '#005cc5',
      function: '#6f42c1',
      variable: '#e36209',
      error: '#d73a49',
      warning: '#e36209'
    }
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    type: 'dark',
    colors: {
      background: '#0d1117',
      foreground: '#c9d1d9',
      primary: '#58a6ff',
      secondary: '#8b949e',
      accent: '#58a6ff',
      border: '#30363d',
      selection: '#264f78',
      comment: '#8b949e',
      keyword: '#ff7b72',
      string: '#a5d6ff',
      number: '#79c0ff',
      function: '#d2a8ff',
      variable: '#ffa657',
      error: '#f85149',
      warning: '#ffa657'
    }
  }
];

// 工具函数
function getLanguageByFilename(filename: string): LanguageConfig | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  return SUPPORTED_LANGUAGES.find(lang => lang.extensions.includes(ext)) || null;
}

function getAllThemes(): Theme[] {
  return THEMES;
}

function getDefaultTheme(): Theme {
  return THEMES.find(theme => theme.id === 'vs-dark') || THEMES[0];
}

// 简单的代码高亮（不使用 Prism.js）
function highlightCode(code: string, language: string, theme: Theme): string {
  const { colors } = theme;
  
  // 简单的语法高亮规则
  let highlighted = code
    .replace(/(\/\/.*$)/gm, `<span style="color: ${colors.comment}">$1</span>`)
    .replace(/(\/\*[\s\S]*?\*\/)/g, `<span style="color: ${colors.comment}">$1</span>`)
    .replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export|from|default)\b/g, `<span style="color: ${colors.keyword}; font-weight: bold">$1</span>`)
    .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, `<span style="color: ${colors.string}">$1$2$1</span>`)
    .replace(/\b(\d+\.?\d*)\b/g, `<span style="color: ${colors.number}">$1</span>`)
    .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, `<span style="color: ${colors.function}">$1</span>(`);

  return `
    <style>
      .code-viewer {
        background-color: ${colors.background};
        color: ${colors.foreground};
        font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 20px;
        border-radius: 8px;
        overflow: auto;
        white-space: pre;
        tab-size: 2;
      }
    </style>
    <div class="code-viewer">${highlighted}</div>
  `;
}

// 预览功能
function renderMarkdownPreview(markdown: string): string {
  // 简单的 Markdown 渲染
  let html = markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  return `
    <div class="markdown-preview">
      <div class="preview-content">${html}</div>
    </div>
  `;
}

function renderJsonPreview(json: string): string {
  try {
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, 2);
    return `
      <div class="json-preview">
        <pre><code>${formatted}</code></pre>
      </div>
    `;
  } catch (error) {
    return `
      <div class="json-preview error">
        <p>JSON 解析失败: ${error}</p>
        <pre>${json}</pre>
      </div>
    `;
  }
}

function renderHtmlPreview(html: string): string {
  return `
    <div class="html-preview">
      <div class="preview-content">${html}</div>
    </div>
  `;
}

const App: React.FC<AppProps> = ({ ctx }) => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<LanguageConfig | null>(null);
  const [theme, setTheme] = useState<Theme>(getDefaultTheme());
  const [themes] = useState<Theme[]>(getAllThemes());
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 加载文件内容
  const loadFile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(ctx.urls.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      setCode(content);

      // 检测语言
      const detectedLanguage = getLanguageByFilename(ctx.filePath);
      setLanguage(detectedLanguage);

      // 如果支持预览，默认显示预览
      if (detectedLanguage?.canPreview) {
        setShowPreview(true);
      }

    } catch (err) {
      console.error('Failed to load file:', err);
      setError(`加载文件失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }, [ctx.urls.downloadUrl, ctx.filePath]);

  // 初始化
  useEffect(() => {
    loadFile();
  }, [loadFile]);

  // 复制代码
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      console.log('代码已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [code]);

  // 下载文件
  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ctx.filePath.split('/').pop() || 'file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('下载失败:', err);
    }
  }, [code, ctx.filePath]);

  // 关闭插件
  const handleClose = useCallback(() => {
    ctx.host.close();
  }, [ctx.host]);

  if (loading) {
    return (
      <div id="foxel-code-viewer-plus">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载文件...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="foxel-code-viewer-plus">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>加载失败</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={loadFile} className="retry-btn">
              重试
            </button>
            <button onClick={handleClose} className="close-btn">
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  const highlightedCode = highlightCode(code, language?.prismLanguage || 'text', theme);
  
  let previewContent = '';
  if (showPreview && language?.canPreview) {
    switch (language.previewType) {
      case 'html':
        previewContent = renderHtmlPreview(code);
        break;
      case 'markdown':
        previewContent = renderMarkdownPreview(code);
        break;
      case 'json':
        previewContent = renderJsonPreview(code);
        break;
    }
  }

  return (
    <div id="foxel-code-viewer-plus">
      <style>{`
        #foxel-code-viewer-plus {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: ${theme.colors.background};
          color: ${theme.colors.foreground};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 20px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid ${theme.colors.border};
          border-top: 4px solid ${theme.colors.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .error-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .retry-btn,
        .close-btn {
          padding: 8px 16px;
          border: 1px solid ${theme.colors.border};
          border-radius: 4px;
          background-color: ${theme.colors.background};
          color: ${theme.colors.foreground};
          cursor: pointer;
          font-size: 14px;
        }

        .retry-btn:hover,
        .close-btn:hover {
          background-color: ${theme.colors.selection};
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background-color: ${theme.colors.background};
          border-bottom: 1px solid ${theme.colors.border};
          flex-shrink: 0;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .toolbar-center {
          flex: 1;
          max-width: 400px;
          margin: 0 20px;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toolbar-group label {
          font-size: 14px;
          color: ${theme.colors.secondary};
        }

        .theme-select {
          padding: 4px 8px;
          border: 1px solid ${theme.colors.border};
          border-radius: 4px;
          background-color: ${theme.colors.background};
          color: ${theme.colors.foreground};
          font-size: 14px;
        }

        .toolbar-btn {
          padding: 6px 12px;
          border: 1px solid ${theme.colors.border};
          border-radius: 4px;
          background-color: ${theme.colors.background};
          color: ${theme.colors.foreground};
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .toolbar-btn:hover {
          background-color: ${theme.colors.selection};
        }

        .toolbar-btn.active {
          background-color: ${theme.colors.primary};
          color: ${theme.colors.background};
        }

        .search-group {
          position: relative;
          width: 100%;
        }

        .search-input {
          width: 100%;
          padding: 6px 12px;
          padding-right: 32px;
          border: 1px solid ${theme.colors.border};
          border-radius: 4px;
          background-color: ${theme.colors.background};
          color: ${theme.colors.foreground};
          font-size: 14px;
        }

        .search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: ${theme.colors.secondary};
          cursor: pointer;
          font-size: 16px;
        }

        .file-info {
          font-size: 14px;
          color: ${theme.colors.secondary};
        }

        .main-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .code-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .preview-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-left: 1px solid ${theme.colors.border};
        }

        .code-viewer-container {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .line-numbers {
          background-color: ${theme.colors.background};
          color: ${theme.colors.secondary};
          padding: 20px 8px 20px 16px;
          border-right: 1px solid ${theme.colors.border};
          font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
          user-select: none;
          flex-shrink: 0;
        }

        .code-viewer-content {
          flex: 1;
          overflow: auto;
          padding: 0;
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background-color: ${theme.colors.background};
          border-bottom: 1px solid ${theme.colors.border};
        }

        .preview-header h3 {
          margin: 0;
          font-size: 16px;
          color: ${theme.colors.foreground};
        }

        .preview-type {
          font-size: 12px;
          color: ${theme.colors.secondary};
        }

        .preview-content {
          flex: 1;
          overflow: auto;
          padding: 20px;
          background-color: #ffffff;
          color: #333333;
        }

        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
        }

        .markdown-preview h1 {
          font-size: 2em;
          border-bottom: 1px solid #eaecef;
          padding-bottom: 0.3em;
        }

        .markdown-preview h2 {
          font-size: 1.5em;
          border-bottom: 1px solid #eaecef;
          padding-bottom: 0.3em;
        }

        .markdown-preview p {
          margin-bottom: 16px;
        }

        .markdown-preview code {
          padding: 0.2em 0.4em;
          margin: 0;
          font-size: 85%;
          background-color: rgba(27, 31, 35, 0.05);
          border-radius: 3px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        }

        .json-preview pre {
          background-color: #f6f8fa;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          padding: 16px;
          overflow: auto;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 12px;
          line-height: 1.45;
        }

        .json-preview.error {
          background-color: #ffeaea;
          border: 1px solid #f85149;
          border-radius: 6px;
          color: #d73a49;
          padding: 16px;
        }
      `}</style>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="toolbar-group">
            <label htmlFor="theme-select">主题:</label>
            <select
              id="theme-select"
              value={theme.id}
              onChange={(e) => {
                const selectedTheme = themes.find(t => t.id === e.target.value);
                if (selectedTheme) setTheme(selectedTheme);
              }}
              className="theme-select"
            >
              {themes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="toolbar-group">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`toolbar-btn ${showPreview ? 'active' : ''}`}
              title="切换预览模式"
            >
              👁️ 预览
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className={`toolbar-btn ${showLineNumbers ? 'active' : ''}`}
              title="切换行号显示"
            >
              🔢 行号
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`toolbar-btn ${wordWrap ? 'active' : ''}`}
              title="切换自动换行"
            >
              📝 换行
            </button>
          </div>
        </div>

        <div className="toolbar-center">
          <div className="search-group">
            <input
              type="text"
              placeholder="搜索代码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="search-clear"
                title="清除搜索"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          <div className="toolbar-group">
            <button
              onClick={handleCopy}
              className="toolbar-btn"
              title="复制代码"
            >
              📋 复制
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={handleDownload}
              className="toolbar-btn"
              title="下载文件"
            >
              💾 下载
            </button>
          </div>

          <div className="toolbar-group">
            <span className="file-info">
              {language ? language.name : '未知格式'}
            </span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="code-section">
          <div className="code-viewer-container">
            {showLineNumbers && (
              <div className="line-numbers">
                <pre>{code.split('\n').map((_, index) => index + 1).join('\n')}</pre>
              </div>
            )}
            
            <div 
              className="code-viewer-content"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
              style={{
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                overflow: 'auto',
                height: '100%',
                backgroundColor: theme.colors.background,
                color: theme.colors.foreground
              }}
            />
          </div>
        </div>

        {showPreview && (
          <div className="preview-section">
            <div className="preview-container">
              <div className="preview-header">
                <h3>预览</h3>
                <span className="preview-type">
                  {language?.previewType === 'html' && 'HTML 预览'}
                  {language?.previewType === 'markdown' && 'Markdown 预览'}
                  {language?.previewType === 'json' && 'JSON 预览'}
                </span>
              </div>
              <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;