// 语言检测
export const detectLanguage = (filename: string): string => {
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
export const highlightCode = (code: string, language: string): string => {
  if (language === 'text' || language === 'log') {
    return code.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
  }

  let highlighted = code
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>');

  // 注释
  if (['javascript', 'typescript', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'swift', 'kotlin', 'scala', 'php', 'ruby', 'python', 'clojure', 'bash', 'fish', 'powershell', 'batch', 'sql', 'dockerfile', 'makefile', 'cmake', 'gradle', 'graphql'].includes(language)) {
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
  }
  if (['html', 'xml', 'svg'].includes(language)) {
    highlighted = highlighted.replace(/(<!--[\s\S]*?-->)/g, '<span class="comment">$1</span>');
  }
  if (['css', 'scss', 'sass', 'less'].includes(language)) {
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
  }

  // 字符串
  highlighted = highlighted.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');

  // 数字
  highlighted = highlighted.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');

  // 关键字
  const keywords: { [key: string]: string[] } = {
    'javascript': ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'import', 'export', 'from', 'as', 'default', 'async', 'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined'],
    'typescript': ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'import', 'export', 'from', 'as', 'default', 'async', 'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined', 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'public', 'private', 'protected', 'readonly', 'static', 'abstract', 'implements'],
    'python': ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'lambda', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'pass', 'break', 'continue', 'raise', 'assert', 'del', 'global', 'nonlocal'],
    'java': ['public', 'private', 'protected', 'static', 'final', 'abstract', 'class', 'interface', 'extends', 'implements', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'import', 'package', 'synchronized', 'volatile', 'transient', 'native', 'strictfp'],
    'cpp': ['class', 'struct', 'union', 'enum', 'namespace', 'template', 'typename', 'public', 'private', 'protected', 'virtual', 'override', 'final', 'static', 'const', 'volatile', 'mutable', 'explicit', 'inline', 'friend', 'operator', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'new', 'delete', 'this', 'sizeof', 'typedef', 'using', 'extern', 'register', 'auto'],
    'c': ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'goto', 'struct', 'union', 'enum', 'typedef', 'static', 'extern', 'auto', 'register', 'const', 'volatile', 'signed', 'unsigned', 'short', 'long', 'int', 'char', 'float', 'double', 'void', 'sizeof', 'return'],
    'html': ['html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'select', 'option', 'textarea', 'label', 'fieldset', 'legend'],
    'css': ['@media', '@import', '@keyframes', '@font-face', '@page', '@supports', '@document', '@charset', '@namespace', '!important', 'and', 'or', 'not', 'only', 'all', 'print', 'screen', 'speech', 'aural', 'braille', 'embossed', 'handheld', 'projection', 'tty', 'tv']
  };

  const langKeywords = keywords[language] || [];
  if (langKeywords.length > 0) {
    const keywordRegex = new RegExp(`\\b(${langKeywords.join('|')})\\b`, 'g');
    highlighted = highlighted.replace(keywordRegex, '<span class="keyword">$1</span>');
  }

  return highlighted;
};