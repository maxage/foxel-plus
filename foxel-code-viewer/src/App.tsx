import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PluginMountCtx } from '../foxel.d';

interface AppProps {
  ctx: PluginMountCtx;
}

interface CodeTheme {
  name: string;
  background: string;
  foreground: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
  function: string;
  variable: string;
  type: string;
  operator: string;
  punctuation: string;
}

interface SearchResult {
  line: number;
  column: number;
  text: string;
}

const themes: CodeTheme[] = [
  {
    name: 'VS Code Dark',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    number: '#b5cea8',
    function: '#dcdcaa',
    variable: '#9cdcfe',
    type: '#4ec9b0',
    operator: '#d4d4d4',
    punctuation: '#d4d4d4'
  },
  {
    name: 'VS Code Light',
    background: '#ffffff',
    foreground: '#000000',
    keyword: '#0000ff',
    string: '#a31515',
    comment: '#008000',
    number: '#098658',
    function: '#795e26',
    variable: '#001080',
    type: '#267f99',
    operator: '#000000',
    punctuation: '#000000'
  },
  {
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    keyword: '#f92672',
    string: '#e6db74',
    comment: '#75715e',
    number: '#ae81ff',
    function: '#a6e22e',
    variable: '#f8f8f2',
    type: '#66d9ef',
    operator: '#f8f8f2',
    punctuation: '#f8f8f2'
  },
  {
    name: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    keyword: '#859900',
    string: '#2aa198',
    comment: '#586e75',
    number: '#d33682',
    function: '#b58900',
    variable: '#839496',
    type: '#268bd2',
    operator: '#839496',
    punctuation: '#839496'
  },
  {
    name: 'GitHub',
    background: '#ffffff',
    foreground: '#24292e',
    keyword: '#d73a49',
    string: '#032f62',
    comment: '#6a737d',
    number: '#005cc5',
    function: '#6f42c1',
    variable: '#e36209',
    type: '#005cc5',
    operator: '#d73a49',
    punctuation: '#24292e'
  }
];

const App: React.FC<AppProps> = ({ ctx }) => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<CodeTheme>(themes[0]);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(-1);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(true);
  const [toolbarTimeout, setToolbarTimeout] = useState<number | null>(null);
  const [collapsedLines, setCollapsedLines] = useState<Set<number>>(new Set());
  const [enableCodeFolding, setEnableCodeFolding] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    lines: number;
    language: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 检测是否支持预览模式
  const isPreviewable = (language: string): boolean => {
    return ['markdown', 'html', 'htm', 'xml', 'svg'].includes(language);
  };

  // 渲染预览内容
  const renderPreviewContent = (code: string, language: string): string => {
    if (language === 'markdown') {
      // 简单的 Markdown 渲染
      return code
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');
    } else if (language === 'html' || language === 'htm') {
      return code;
    } else if (language === 'xml' || language === 'svg') {
      return code;
    }
    return code;
  };

  // 检测文件语言
  const detectLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'vue': 'vue',
      'svelte': 'svelte',
      'html': 'html',
      'htm': 'html',
      'xml': 'xml',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'cfg': 'ini',
      'conf': 'ini',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'c',
      'hpp': 'cpp',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'clj': 'clojure',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'fish',
      'ps1': 'powershell',
      'bat': 'batch',
      'sql': 'sql',
      'md': 'markdown',
      'txt': 'text',
      'log': 'text',
      'diff': 'diff',
      'patch': 'diff',
      'dockerfile': 'dockerfile',
      'makefile': 'makefile',
      'cmake': 'cmake',
      'gradle': 'gradle',
      'svg': 'xml',
      'graphql': 'graphql',
      'gql': 'graphql'
    };
    return languageMap[ext] || 'text';
  };

  // 简单的语法高亮
  const highlightCode = (code: string, language: string): string => {
    if (language === 'text' || language === 'log') {
      return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 注释
    if (language === 'javascript' || language === 'typescript' || language === 'java' || language === 'c' || language === 'cpp' || language === 'csharp' || language === 'go' || language === 'rust' || language === 'swift' || language === 'kotlin' || language === 'scala' || language === 'php' || language === 'ruby' || language === 'python' || language === 'swift' || language === 'kotlin' || language === 'scala' || language === 'clojure' || language === 'bash' || language === 'fish' || language === 'powershell' || language === 'batch' || language === 'sql' || language === 'dockerfile' || language === 'makefile' || language === 'cmake' || language === 'gradle' || language === 'graphql') {
      highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    }
    if (language === 'html' || language === 'xml' || language === 'svg') {
      highlighted = highlighted.replace(/(<!--[\s\S]*?-->)/g, '<span class="comment">$1</span>');
    }
    if (language === 'css' || language === 'scss' || language === 'sass' || language === 'less') {
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    // 字符串
    highlighted = highlighted.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');

    // 数字
    highlighted = highlighted.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');

    // 关键字
    const keywords = {
      'javascript': ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'import', 'export', 'from', 'as', 'default', 'async', 'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined'],
      'typescript': ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'import', 'export', 'from', 'as', 'default', 'async', 'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined', 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'public', 'private', 'protected', 'readonly', 'static', 'abstract', 'implements'],
      'python': ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'lambda', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'pass', 'break', 'continue', 'raise', 'assert', 'del', 'global', 'nonlocal'],
      'java': ['public', 'private', 'protected', 'static', 'final', 'abstract', 'class', 'interface', 'extends', 'implements', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'import', 'package', 'synchronized', 'volatile', 'transient', 'native', 'strictfp'],
      'cpp': ['class', 'struct', 'union', 'enum', 'namespace', 'template', 'typename', 'public', 'private', 'protected', 'virtual', 'override', 'final', 'static', 'const', 'volatile', 'mutable', 'explicit', 'inline', 'friend', 'operator', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'new', 'delete', 'this', 'sizeof', 'typedef', 'using', 'extern', 'register', 'auto'],
      'c': ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'goto', 'struct', 'union', 'enum', 'typedef', 'static', 'extern', 'auto', 'register', 'const', 'volatile', 'signed', 'unsigned', 'short', 'long', 'int', 'char', 'float', 'double', 'void', 'sizeof', 'return'],
      'html': ['html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'select', 'option', 'textarea', 'label', 'fieldset', 'legend'],
      'css': ['@media', '@import', '@keyframes', '@font-face', '@page', '@supports', '@document', '@charset', '@namespace', '!important', 'and', 'or', 'not', 'only', 'all', 'print', 'screen', 'speech', 'aural', 'braille', 'embossed', 'handheld', 'projection', 'tty', 'tv']
    };

    const langKeywords = keywords[language as keyof typeof keywords] || [];
    if (langKeywords.length > 0) {
      const keywordRegex = new RegExp(`\\b(${langKeywords.join('|')})\\b`, 'g');
      highlighted = highlighted.replace(keywordRegex, '<span class="keyword">$1</span>');
    }

    return highlighted;
  };

  // 加载代码文件
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

  // 搜索功能
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const lines = code.split('\n');
    const results: SearchResult[] = [];
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        results.push({
          line: lineIndex + 1,
          column: match.index + 1,
          text: line.trim()
        });
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }, [code]);

  // 跳转到搜索结果
  const goToSearchResult = (index: number) => {
    if (index >= 0 && index < searchResults.length) {
      setCurrentSearchIndex(index);
      const result = searchResults[index];
      const lineElement = document.getElementById(`line-${result.line}`);
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        lineElement.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        setTimeout(() => {
          lineElement.style.backgroundColor = '';
        }, 2000);
      }
    }
  };

  // 复制代码
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // 可以添加一个提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 下载代码
  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ctx.entry.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 保存代码
  const saveCode = async () => {
    if (!isModified) return;
    
    try {
      setIsSaving(true);
      setSaveError('');
      
      // 这里应该调用 Foxel 的保存 API
      // 由于我们不知道具体的保存 API，这里先模拟保存
      console.log('Saving code:', code);
      
      // 模拟保存延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsModified(false);
      setIsSaving(false);
      
      // 可以添加成功提示
      console.log('Code saved successfully');
      
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败');
      setIsSaving(false);
    }
  };

  // 处理代码内容变化
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsModified(true);
  };

  // 切换编辑模式
  const toggleEditMode = () => {
    if (editMode && isModified) {
      // 如果正在编辑且有未保存的更改，询问是否保存
      if (window.confirm('有未保存的更改，是否保存？')) {
        saveCode();
      }
    }
    setEditMode(!editMode);
  };

  // 切换行折叠
  const toggleLineCollapse = (lineNumber: number) => {
    const newCollapsed = new Set(collapsedLines);
    if (newCollapsed.has(lineNumber)) {
      newCollapsed.delete(lineNumber);
    } else {
      newCollapsed.add(lineNumber);
    }
    setCollapsedLines(newCollapsed);
  };

  // 键盘快捷键
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'f':
          e.preventDefault();
          setShowSearch(true);
          setTimeout(() => searchInputRef.current?.focus(), 100);
          break;
        case 's':
          e.preventDefault();
          if (editMode && isModified) {
            saveCode();
          } else {
            downloadCode();
          }
          break;
        case 'c':
          if (e.shiftKey) {
            e.preventDefault();
            copyCode();
          }
          break;
        case '=':
        case '+':
          e.preventDefault();
          setFontSize(prev => Math.min(prev + 1, 24));
          break;
        case '-':
          e.preventDefault();
          setFontSize(prev => Math.max(prev - 1, 8));
          break;
        case '0':
          e.preventDefault();
          setFontSize(14);
          break;
        case 'F':
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
        case 'i':
          e.preventDefault();
          setShowInfo(!showInfo);
          break;
        case 'e':
          e.preventDefault();
          toggleEditMode();
          break;
      }
    }
    
    if (e.key === 'Escape') {
      setShowSearch(false);
      setShowSettings(false);
      setShowInfo(false);
    }
  };

  // 鼠标事件处理
  const handleMouseEnter = () => {
    if (toolbarTimeout) {
      clearTimeout(toolbarTimeout);
      setToolbarTimeout(null);
    }
    setShowToolbar(true);
  };

  const handleMouseLeave = () => {
    const timeout = window.setTimeout(() => {
      setShowToolbar(false);
    }, 2000);
    setToolbarTimeout(timeout);
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 效果钩子
  useEffect(() => {
    loadCode();
  }, [loadCode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, showInfo]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  // 渲染编辑模式的代码编辑器
  const renderCodeEditor = () => {
    return (
      <textarea
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        style={{
          width: '100%',
          height: '100%',
          padding: '20px',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
          backgroundColor: currentTheme.background,
          color: currentTheme.foreground,
          border: 'none',
          outline: 'none',
          resize: 'none',
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflow: 'auto'
        }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    );
  };

  // 渲染代码行
  const renderCodeLines = () => {
    const lines = code.split('\n');
    const highlightedCode = highlightCode(code, fileInfo?.language || 'text');
    const highlightedLines = highlightedCode.split('\n');

    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const isCollapsed = collapsedLines.has(lineNumber);
      
      return (
        <div
          key={lineNumber}
          id={`line-${lineNumber}`}
          style={{
            display: 'flex',
            minHeight: '20px',
            lineHeight: '1.5',
            position: 'relative',
            alignItems: 'flex-start'
          }}
        >
          {showLineNumbers && (
            <div
              style={{
                width: '60px',
                padding: '0 10px',
                textAlign: 'right',
                color: currentTheme.comment,
                userSelect: 'none',
                flexShrink: 0,
                fontSize: `${fontSize}px`,
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                lineHeight: '1.5'
              }}
            >
              {lineNumber}
            </div>
          )}
          
          {/* 代码折叠按钮 - 只在启用时显示，且不重叠 */}
          {enableCodeFolding && line.trim() && (
            <div
              style={{
                width: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                padding: '0 4px'
              }}
            >
              <button
                onClick={() => toggleLineCollapse(lineNumber)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: currentTheme.comment,
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '2px',
                  opacity: 0.6,
                  borderRadius: '2px',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
              >
                {isCollapsed ? '▶' : '▼'}
              </button>
            </div>
          )}
          
          <div
            style={{
              flex: 1,
              padding: '0 10px',
              fontSize: `${fontSize}px`,
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              overflow: wordWrap ? 'visible' : 'auto',
              lineHeight: '1.5'
            }}
            dangerouslySetInnerHTML={{
              __html: isCollapsed ? '...' : highlightedLines[index] || ''
            }}
          />
        </div>
      );
    });
  };

  // 渲染预览内容
  const renderPreview = () => {
    if (!fileInfo || !isPreviewable(fileInfo.language)) {
      return null;
    }

    const previewContent = renderPreviewContent(code, fileInfo.language);
    
    return (
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          backgroundColor: currentTheme.background,
          color: currentTheme.foreground,
          fontSize: `${fontSize}px`,
          lineHeight: '1.6'
        }}
      >
        {fileInfo.language === 'html' || fileInfo.language === 'htm' ? (
          <iframe
            srcDoc={previewContent}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#fff'
            }}
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: previewContent }}
            style={{
              maxWidth: '100%',
              wordWrap: 'break-word'
            }}
          />
        )}
      </div>
    );
  };

  const getButtonStyle = (isActive = false) => ({
    padding: isFullscreen ? '10px 14px' : '6px 8px',
    backgroundColor: isActive ? '#007acc' : '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: isFullscreen ? '16px' : '12px',
    transition: 'background-color 0.2s',
    minWidth: isFullscreen ? '44px' : '32px',
    height: isFullscreen ? '44px' : '28px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 0
  });

  if (loading) {
    return (
      <div
        ref={containerRef}
        id="foxel-code-viewer-plus"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: currentTheme.background,
          color: currentTheme.foreground,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <div>加载代码文件中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        ref={containerRef}
        id="foxel-code-viewer-plus"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: currentTheme.background,
          color: currentTheme.foreground,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px', color: '#ff6b6b' }}>❌</div>
          <div style={{ marginBottom: '16px' }}>加载失败</div>
          <div style={{ color: currentTheme.comment, fontSize: '14px' }}>{error}</div>
          <button
            onClick={loadCode}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#007acc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="foxel-code-viewer-plus"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: currentTheme.background,
        color: currentTheme.foreground,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        position: 'relative'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 工具栏 */}
      {showToolbar && (
        <div style={{
          padding: isFullscreen ? '16px 20px' : '8px 12px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: isFullscreen ? '16px' : '6px',
          backgroundColor: isFullscreen ? 'rgba(42, 42, 42, 0.95)' : '#2a2a2a',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          transition: 'opacity 0.3s ease',
          backdropFilter: isFullscreen ? 'blur(10px)' : 'none',
          boxShadow: isFullscreen ? '0 2px 20px rgba(0, 0, 0, 0.5)' : 'none',
          flexWrap: isFullscreen ? 'nowrap' : 'wrap',
          minHeight: isFullscreen ? '80px' : 'auto'
        }}>
          {/* 文件信息 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <span style={{
              fontSize: isFullscreen ? '16px' : '12px',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              📄 {fileInfo?.name}
            </span>
            {fileInfo && (
              <span style={{
                fontSize: isFullscreen ? '14px' : '10px',
                color: '#ccc'
              }}>
                {fileInfo.language} • {fileInfo.lines} 行 • {(fileInfo.size / 1024).toFixed(1)}KB
              </span>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* 搜索 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              style={getButtonStyle(showSearch)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showSearch ? '#007acc' : '#444'}
            >
              🔍 搜索
            </button>
            {searchResults.length > 0 && (
              <span style={{
                fontSize: isFullscreen ? '14px' : '10px',
                color: '#ccc'
              }}>
                {currentSearchIndex + 1}/{searchResults.length}
              </span>
            )}
          </div>

          {/* 编辑模式 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <button
              onClick={toggleEditMode}
              style={getButtonStyle(editMode)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = editMode ? '#007acc' : '#444'}
            >
              {editMode ? '👁️ 查看' : '✏️ 编辑'}
            </button>
            {isModified && (
              <span style={{
                fontSize: isFullscreen ? '12px' : '10px',
                color: '#ff6b6b',
                fontWeight: 'bold'
              }}>
                ●
              </span>
            )}
          </div>

          {/* 预览模式 */}
          {fileInfo && isPreviewable(fileInfo.language) && !editMode && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isFullscreen ? '8px' : '4px',
              flexShrink: 0
            }}>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                style={getButtonStyle(previewMode)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = previewMode ? '#007acc' : '#444'}
              >
                {previewMode ? '📝 代码' : '👁️ 预览'}
              </button>
            </div>
          )}

          {/* 主题选择 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <select
              value={currentTheme.name}
              onChange={(e) => {
                const theme = themes.find(t => t.name === e.target.value);
                if (theme) setCurrentTheme(theme);
              }}
              style={{
                padding: isFullscreen ? '8px 12px' : '4px 6px',
                backgroundColor: '#444',
                color: '#fff',
                border: '1px solid #666',
                borderRadius: '4px',
                fontSize: isFullscreen ? '14px' : '10px',
                cursor: 'pointer'
              }}
            >
              {themes.map(theme => (
                <option key={theme.name} value={theme.name}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          {/* 设置 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={getButtonStyle(showSettings)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showSettings ? '#007acc' : '#444'}
            >
              ⚙️ 设置
            </button>
          </div>

          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            {editMode && isModified && (
              <button
                onClick={saveCode}
                disabled={isSaving}
                style={{
                  ...getButtonStyle(),
                  backgroundColor: isSaving ? '#666' : '#28a745',
                  opacity: isSaving ? 0.6 : 1,
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#34ce57')}
                onMouseLeave={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#28a745')}
              >
                {isSaving ? '💾 保存中...' : '💾 保存'}
              </button>
            )}
            <button
              onClick={copyCode}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              📋 复制
            </button>
            <button
              onClick={downloadCode}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              💾 下载
            </button>
            <button
              onClick={toggleFullscreen}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              {isFullscreen ? '⤓ 退出全屏' : '⤢ 全屏'}
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              style={getButtonStyle(showInfo)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showInfo ? '#0088dd' : '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showInfo ? '#007acc' : '#444'}
            >
              ℹ️ 信息
            </button>
            <button
              onClick={ctx.host.close}
              style={{
                ...getButtonStyle(),
                backgroundColor: '#d32f2f'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e53935'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
            >
              ✕ 关闭
            </button>
          </div>
        </div>
      )}

      {/* 搜索面板 */}
      {showSearch && (
        <div style={{
          position: 'absolute',
          top: showToolbar ? (isFullscreen ? '80px' : '60px') : '10px',
          left: '10px',
          right: '10px',
          backgroundColor: isFullscreen ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          padding: isFullscreen ? '16px' : '12px',
          borderRadius: '8px',
          zIndex: 10,
          backdropFilter: isFullscreen ? 'blur(10px)' : 'none',
          boxShadow: isFullscreen ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.3)',
          border: isFullscreen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索代码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: '#333',
                color: '#fff',
                border: '1px solid #666',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={() => setShowSearch(false)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              fontSize: '12px'
            }}>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => goToSearchResult(index)}
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    backgroundColor: index === currentSearchIndex ? '#007acc' : 'transparent',
                    borderRadius: '4px',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = index === currentSearchIndex ? '#007acc' : '#444'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index === currentSearchIndex ? '#007acc' : 'transparent'}
                >
                  第 {result.line} 行: {result.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 设置面板 */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: showToolbar ? (isFullscreen ? '80px' : '60px') : '10px',
          right: '10px',
          backgroundColor: isFullscreen ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          padding: isFullscreen ? '16px' : '12px',
          borderRadius: '8px',
          zIndex: 10,
          minWidth: isFullscreen ? '300px' : '250px',
          backdropFilter: isFullscreen ? 'blur(10px)' : 'none',
          boxShadow: isFullscreen ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.3)',
          border: isFullscreen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>设置</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
              />
              显示行号
            </label>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
              />
              自动换行
            </label>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={enableCodeFolding}
                onChange={(e) => setEnableCodeFolding(e.target.checked)}
              />
              代码折叠
            </label>
          </div>

          {fileInfo && isPreviewable(fileInfo.language) && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={previewMode}
                  onChange={(e) => setPreviewMode(e.target.checked)}
                />
                预览模式
              </label>
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              字体大小: {fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <button
            onClick={() => setShowSettings(false)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>
      )}

      {/* 信息面板 */}
      {showInfo && fileInfo && (
        <div style={{
          position: 'absolute',
          top: showToolbar ? (isFullscreen ? '80px' : '60px') : '10px',
          right: '10px',
          backgroundColor: isFullscreen ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          padding: isFullscreen ? '16px' : '12px',
          borderRadius: '8px',
          fontSize: isFullscreen ? '16px' : '14px',
          zIndex: 10,
          minWidth: isFullscreen ? '250px' : '200px',
          backdropFilter: isFullscreen ? 'blur(10px)' : 'none',
          boxShadow: isFullscreen ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.3)',
          border: isFullscreen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>文件信息</h3>
          <div style={{ lineHeight: '1.6' }}>
            <div><strong>文件名:</strong> {fileInfo.name}</div>
            <div><strong>语言:</strong> {fileInfo.language}</div>
            <div><strong>行数:</strong> {fileInfo.lines}</div>
            <div><strong>大小:</strong> {(fileInfo.size / 1024).toFixed(1)} KB</div>
            <div><strong>主题:</strong> {currentTheme.name}</div>
            <div><strong>字体大小:</strong> {fontSize}px</div>
          </div>
        </div>
      )}

      {/* 代码显示区域 */}
      <div
        ref={codeRef}
        style={{
          flex: 1,
          overflow: 'auto',
          marginTop: showToolbar ? (isFullscreen ? '80px' : '60px') : '0',
          paddingBottom: isFullscreen ? '60px' : '0'
        }}
      >
        {editMode ? (
          // 编辑模式
          renderCodeEditor()
        ) : previewMode && fileInfo && isPreviewable(fileInfo.language) ? (
          // 预览模式
          renderPreview()
        ) : (
          // 查看模式
          <>
            <style>
              {`
                .keyword { color: ${currentTheme.keyword}; font-weight: bold; }
                .string { color: ${currentTheme.string}; }
                .comment { color: ${currentTheme.comment}; font-style: italic; }
                .number { color: ${currentTheme.number}; }
                .function { color: ${currentTheme.function}; }
                .variable { color: ${currentTheme.variable}; }
                .type { color: ${currentTheme.type}; }
                .operator { color: ${currentTheme.operator}; }
                .punctuation { color: ${currentTheme.punctuation}; }
              `}
            </style>
            <div style={{
              padding: '20px',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: `${fontSize}px`,
              lineHeight: '1.5',
              backgroundColor: currentTheme.background,
              color: currentTheme.foreground
            }}>
              {renderCodeLines()}
            </div>
          </>
        )}
      </div>

      {/* 保存错误提示 */}
      {saveError && (
        <div style={{
          position: 'absolute',
          top: showToolbar ? (isFullscreen ? '80px' : '60px') : '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ff6b6b',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          zIndex: 20,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          ❌ {saveError}
        </div>
      )}

      {/* 键盘快捷键提示 */}
      {showToolbar && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: isFullscreen ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          padding: isFullscreen ? '12px 16px' : '6px 8px',
          borderRadius: '6px',
          fontSize: isFullscreen ? '14px' : '10px',
          color: '#ccc',
          zIndex: 10,
          backdropFilter: isFullscreen ? 'blur(10px)' : 'none',
          boxShadow: isFullscreen ? '0 2px 10px rgba(0, 0, 0, 0.5)' : '0 1px 5px rgba(0, 0, 0, 0.3)',
          border: isFullscreen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          maxWidth: isFullscreen ? '90%' : '70%',
          lineHeight: isFullscreen ? '1.4' : '1.2'
        }}>
          <div style={{
            display: isFullscreen ? 'flex' : 'block',
            flexWrap: isFullscreen ? 'wrap' : 'nowrap',
            gap: isFullscreen ? '8px' : '4px'
          }}>
            <span style={{ fontWeight: 'bold' }}>快捷键:</span>
            <span>Ctrl+F(搜索)</span>
            <span>Ctrl+S({editMode ? '保存' : '下载'})</span>
            <span>Ctrl+E(编辑)</span>
            <span>Ctrl+Shift+C(复制)</span>
            <span>Ctrl+±(字体)</span>
            <span>Ctrl+0(重置字体)</span>
            <span>Ctrl+I(信息)</span>
            <span>Esc(关闭面板)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
