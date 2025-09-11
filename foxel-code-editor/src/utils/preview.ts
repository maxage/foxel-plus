// 检测是否支持预览模式
export const isPreviewable = (language: string): boolean => {
  return ['markdown', 'html', 'xml', 'svg'].includes(language);
};

// 渲染预览内容
export const renderPreviewContent = (code: string, language: string): string => {
  if (language === 'markdown') {
    // 更完整的 Markdown 渲染
    let html = code
      // 代码块（必须在其他规则之前处理）
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // 行内代码
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      // 标题（按顺序处理，从大到小）
      .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
      .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 水平线
      .replace(/^---$/gm, '<hr>')
      .replace(/^\*\*\*$/gm, '<hr>')
      // 列表项
      .replace(/^(\s*)[-*+] (.*$)/gim, '$1<li>$2</li>')
      .replace(/^(\s*)(\d+)\. (.*$)/gim, '$1<li>$3</li>')
      // 粗体和斜体
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 删除线
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // 图片
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 4px;">')
      // 引用
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      // 换行处理
      .replace(/\n\n/g, '\n</p>\n<p>\n')
      .replace(/\n/g, '<br>\n')
      // 包装段落
      .replace(/^(?!<[h|p|u|o|l|i|d|b|q|h])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>')
      // 包装列表
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // 清理空段落和多余的标签
      .replace(/<p><\/p>/g, '')
      .replace(/<p><br><\/p>/g, '')
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<ul><li>/g, '<ul><li>')
      .replace(/<\/li><\/ul>/g, '</li></ul>');

    return html;
  } else if (language === 'html') {
    return code;
  } else if (language === 'xml' || language === 'svg') {
    return code;
  }
  return code;
};