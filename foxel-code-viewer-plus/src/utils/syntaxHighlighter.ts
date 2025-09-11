// 代码语法高亮工具
import { LanguageConfig } from './languages';
import { Theme } from './themes';

// 动态加载 Prism.js 语言支持
const loadedLanguages = new Set<string>();

export async function loadPrismLanguage(language: string): Promise<void> {
  if (loadedLanguages.has(language)) {
    return;
  }

  try {
    // 动态导入 Prism 语言文件
    switch (language) {
      case 'javascript':
        await import('prismjs/components/prism-javascript');
        break;
      case 'typescript':
        await import('prismjs/components/prism-typescript');
        break;
      case 'python':
        await import('prismjs/components/prism-python');
        break;
      case 'java':
        await import('prismjs/components/prism-java');
        break;
      case 'cpp':
        await import('prismjs/components/prism-cpp');
        break;
      case 'csharp':
        await import('prismjs/components/prism-csharp');
        break;
      case 'php':
        await import('prismjs/components/prism-php');
        break;
      case 'ruby':
        await import('prismjs/components/prism-ruby');
        break;
      case 'go':
        await import('prismjs/components/prism-go');
        break;
      case 'rust':
        await import('prismjs/components/prism-rust');
        break;
      case 'swift':
        await import('prismjs/components/prism-swift');
        break;
      case 'kotlin':
        await import('prismjs/components/prism-kotlin');
        break;
      case 'html':
        await import('prismjs/components/prism-markup');
        break;
      case 'css':
        await import('prismjs/components/prism-css');
        break;
      case 'scss':
        await import('prismjs/components/prism-scss');
        break;
      case 'sass':
        await import('prismjs/components/prism-sass');
        break;
      case 'less':
        await import('prismjs/components/prism-less');
        break;
      case 'json':
        await import('prismjs/components/prism-json');
        break;
      case 'yaml':
        await import('prismjs/components/prism-yaml');
        break;
      case 'xml':
        await import('prismjs/components/prism-markup');
        break;
      case 'markdown':
        await import('prismjs/components/prism-markdown');
        break;
      case 'bash':
        await import('prismjs/components/prism-bash');
        break;
      case 'powershell':
        await import('prismjs/components/prism-powershell');
        break;
      case 'sql':
        await import('prismjs/components/prism-sql');
        break;
      case 'dockerfile':
        await import('prismjs/components/prism-dockerfile');
        break;
      case 'graphql':
        await import('prismjs/components/prism-graphql');
        break;
      case 'diff':
        await import('prismjs/components/prism-diff');
        break;
      case 'ini':
        await import('prismjs/components/prism-ini');
        break;
      case 'toml':
        await import('prismjs/components/prism-toml');
        break;
      case 'makefile':
        await import('prismjs/components/prism-makefile');
        break;
      case 'cmake':
        await import('prismjs/components/prism-cmake');
        break;
      case 'protobuf':
        await import('prismjs/components/prism-protobuf');
        break;
      case 'vue':
        await import('prismjs/components/prism-markup');
        await import('prismjs/components/prism-javascript');
        await import('prismjs/components/prism-css');
        break;
      case 'svelte':
        await import('prismjs/components/prism-markup');
        await import('prismjs/components/prism-javascript');
        await import('prismjs/components/prism-css');
        break;
      default:
        // 对于不支持的语言，使用文本模式
        break;
    }
    
    loadedLanguages.add(language);
  } catch (error) {
    console.warn(`Failed to load Prism language: ${language}`, error);
  }
}

// 高亮代码
export async function highlightCode(
  code: string, 
  language: string, 
  theme: Theme
): Promise<string> {
  try {
    // 加载语言支持
    await loadPrismLanguage(language);
    
    // 使用 Prism 高亮代码
    const highlighted = (window as any).Prism.highlight(code, (window as any).Prism.languages[language] || (window as any).Prism.languages.text, language);
    
    // 应用主题样式
    return applyThemeStyles(highlighted, theme);
  } catch (error) {
    console.error('Code highlighting failed:', error);
    return escapeHtml(code);
  }
}

// 应用主题样式
function applyThemeStyles(highlightedCode: string, theme: Theme): string {
  const { colors } = theme;
  
  // 创建内联样式
  const styles = `
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
      
      .code-viewer .token.comment { color: ${colors.comment}; }
      .code-viewer .token.keyword { color: ${colors.keyword}; font-weight: bold; }
      .code-viewer .token.string { color: ${colors.string}; }
      .code-viewer .token.number { color: ${colors.number}; }
      .code-viewer .token.function { color: ${colors.function}; }
      .code-viewer .token.variable { color: ${colors.variable}; }
      .code-viewer .token.operator { color: ${colors.foreground}; }
      .code-viewer .token.punctuation { color: ${colors.foreground}; }
      .code-viewer .token.class-name { color: ${colors.function}; }
      .code-viewer .token.boolean { color: ${colors.keyword}; }
      .code-viewer .token.constant { color: ${colors.variable}; }
      .code-viewer .token.property { color: ${colors.variable}; }
      .code-viewer .token.selector { color: ${colors.function}; }
      .code-viewer .token.attr-name { color: ${colors.variable}; }
      .code-viewer .token.attr-value { color: ${colors.string}; }
      .code-viewer .token.tag { color: ${colors.keyword}; }
      .code-viewer .token.attr-name { color: ${colors.variable}; }
      .code-viewer .token.attr-value { color: ${colors.string}; }
      .code-viewer .token.important { color: ${colors.error}; font-weight: bold; }
      .code-viewer .token.bold { font-weight: bold; }
      .code-viewer .token.italic { font-style: italic; }
      .code-viewer .token.url { color: ${colors.primary}; text-decoration: underline; }
    </style>
  `;
  
  return `${styles}<div class="code-viewer">${highlightedCode}</div>`;
}

// HTML 转义
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 获取行号
export function getLineNumbers(code: string): string {
  const lines = code.split('\n');
  return lines.map((_, index) => index + 1).join('\n');
}

// 格式化代码
export function formatCode(code: string, language: string): string {
  // 简单的代码格式化
  switch (language) {
    case 'json':
      try {
        return JSON.stringify(JSON.parse(code), null, 2);
      } catch {
        return code;
      }
    case 'html':
    case 'xml':
      // 简单的 HTML/XML 格式化
      return code
        .replace(/></g, '>\n<')
        .replace(/^\s+|\s+$/g, '')
        .split('\n')
        .map(line => line.trim())
        .join('\n');
    default:
      return code;
  }
}
