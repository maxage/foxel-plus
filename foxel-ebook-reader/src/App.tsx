import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { PluginMountCtx } from '../foxel.d';

type ReaderMode = 'scroll' | 'page';
type ReaderTheme = 'light' | 'dark' | 'sepia';
type EbookType = 'text' | 'markdown' | 'html' | 'epub' | 'pdf';

type EpubResource = {
  href: string;
  mediaType: string;
  data: Uint8Array;
};

interface TocItem {
  id: string;
  title: string;
  level: number;
  href?: string;
  sectionIndex: number;
}

interface Section {
  id: string;
  title: string;
  level: number;
  html: string;
  plainText: string;
}

interface SearchResult {
  sectionIndex: number;
  snippet: string;
}

interface Bookmark {
  id: string;
  label: string;
  sectionIndex: number;
  percentage: number;
  createdAt: number;
  page?: number;
}

interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  maxWidth: number;
  mode: ReaderMode;
}

interface AppProps {
  ctx: PluginMountCtx;
}

const TEXT_FORMATS = new Set(['txt']);
const MARKDOWN_FORMATS = new Set(['md', 'markdown']);
const HTML_FORMATS = new Set(['html', 'xhtml']);

const STORAGE_PREFIX = 'com.foxel-plus.ebook-reader';

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'light',
  fontSize: 18,
  fontFamily: '"Noto Serif", "PingFang SC", "Microsoft Yahei", serif',
  lineHeight: 1.8,
  maxWidth: 860,
  mode: 'scroll'
};

const THEME_STYLES: Record<ReaderTheme, CSSProperties> = {
  light: {
    '--reader-bg': '#f7f7f5',
    '--reader-surface': '#ffffff',
    '--reader-text': '#282828',
    '--reader-accent': '#1f6feb'
  },
  dark: {
    '--reader-bg': '#0f172a',
    '--reader-surface': '#152238',
    '--reader-text': '#d6e1ff',
    '--reader-accent': '#38bdf8'
  },
  sepia: {
    '--reader-bg': '#f4ecdf',
    '--reader-surface': '#f7f1e5',
    '--reader-text': '#4a341d',
    '--reader-accent': '#b7791f'
  }
};

const PDF_VIEWER_MESSAGE_TARGETS = ['application/pdf', 'text/html'];

const READER_STYLES = `
#foxel-ebook-reader {
  position: relative;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--reader-bg);
  color: var(--reader-text);
  font-family: "Noto Serif", "PingFang SC", "Microsoft Yahei", serif;
}

#foxel-ebook-reader .reader-header,
#foxel-ebook-reader .reader-footer {
  padding: 16px 24px;
  background: var(--reader-surface);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

#foxel-ebook-reader .reader-footer {
  border-top: 1px solid rgba(0,0,0,0.06);
  border-bottom: none;
  min-height: 56px;
}

#foxel-ebook-reader .reader-header .title {
  font-size: 20px;
  margin: 0;
}

#foxel-ebook-reader .reader-header .subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  opacity: 0.75;
}

#foxel-ebook-reader .reader-header .actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

#foxel-ebook-reader button {
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  background: var(--reader-accent);
  color: white;
  font-size: 13px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

#foxel-ebook-reader button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

#foxel-ebook-reader button.ghost {
  background: transparent;
  color: var(--reader-text);
  border: 1px solid rgba(0,0,0,0.08);
}

#foxel-ebook-reader button.delete {
  background: #f87171;
  color: #fff;
}

#foxel-ebook-reader button.active {
  box-shadow: 0 0 0 2px rgba(31,111,235,0.3);
}

#foxel-ebook-reader .reader-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  overflow: hidden;
  min-height: 0;
}

#foxel-ebook-reader .sidebar {
  background: rgba(255,255,255,0.4);
  border-right: 1px solid rgba(0,0,0,0.06);
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

#foxel-ebook-reader .sidebar-section h2 {
  margin: 0 0 8px;
  font-size: 16px;
}

#foxel-ebook-reader .toc-list,
#foxel-ebook-reader .bookmark-list,
#foxel-ebook-reader .search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#foxel-ebook-reader .toc-item,
#foxel-ebook-reader .search-result,
#foxel-ebook-reader .bookmark-item > button:first-child {
  background: rgba(0,0,0,0.04);
  color: inherit;
  text-align: left;
  line-height: 1.5;
  padding: 8px 10px;
}

#foxel-ebook-reader .toc-item.active {
  background: var(--reader-accent);
  color: #fff;
}

#foxel-ebook-reader .toc-item.level-2 { padding-left: 20px; }
#foxel-ebook-reader .toc-item.level-3 { padding-left: 32px; }
#foxel-ebook-reader .toc-item.level-4 { padding-left: 44px; }

#foxel-ebook-reader .bookmark-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

#foxel-ebook-reader .bookmark-item strong {
  display: block;
  font-size: 14px;
}

#foxel-ebook-reader .bookmark-item span {
  font-size: 12px;
  opacity: 0.7;
}

#foxel-ebook-reader .reader-content {
  position: relative;
  overflow: hidden;
  background: transparent;
}

#foxel-ebook-reader .content-wrapper {
  width: 100%;
  height: 100%;
  padding: 0 24px;
  box-sizing: border-box;
}

#foxel-ebook-reader .content-wrapper.mode-scroll {
  overflow-y: auto;
}

#foxel-ebook-reader .content-wrapper.mode-page {
  overflow-y: hidden;
  overflow-x: auto;
}

#foxel-ebook-reader .reader-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

#foxel-ebook-reader .reader-section {
  background: var(--reader-surface);
  padding: 40px 48px;
  border-radius: 18px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.08);
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

#foxel-ebook-reader .reader-section h1,
#foxel-ebook-reader .reader-section h2,
#foxel-ebook-reader .reader-section h3,
#foxel-ebook-reader .reader-section h4,
#foxel-ebook-reader .reader-section h5,
#foxel-ebook-reader .reader-section h6 {
  margin-top: 0;
}

#foxel-ebook-reader .reader-section img {
  max-width: 100%;
  border-radius: 12px;
  margin: 16px 0;
}

#foxel-ebook-reader .reader-section pre {
  background: rgba(0,0,0,0.08);
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
}

#foxel-ebook-reader .status {
  padding: 12px 24px;
  background: rgba(0,0,0,0.05);
  margin: 0 24px;
  border-radius: 12px;
}

#foxel-ebook-reader .status.error {
  background: rgba(248,113,113,0.15);
  color: #b91c1c;
}

#foxel-ebook-reader .empty-state {
  padding: 12px;
  border-radius: 10px;
  background: rgba(0,0,0,0.05);
  color: rgba(0,0,0,0.6);
  font-size: 13px;
}

#foxel-ebook-reader .pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

#foxel-ebook-reader .pdf-iframe {
  flex: 1;
  width: 100%;
  border: none;
  border-radius: 12px;
  box-shadow: 0 16px 36px rgba(0,0,0,0.12);
}

#foxel-ebook-reader .pdf-actions {
  display: flex;
  gap: 12px;
}

#foxel-ebook-reader .reader-footer .footer-actions {
  display: flex;
  gap: 8px;
}

#foxel-ebook-reader .highlight-anchor {
  animation: foxel-highlight 1.6s ease-out;
}

@keyframes foxel-highlight {
  0% { background: rgba(255, 213, 0, 0.4); }
  100% { background: transparent; }
}

@media (max-width: 1180px) {
  #foxel-ebook-reader .reader-layout {
    grid-template-columns: 1fr;
  }
  #foxel-ebook-reader .sidebar {
    order: 2;
    flex-direction: row;
    overflow-x: auto;
  }
  #foxel-ebook-reader .reader-content {
    order: 1;
  }
}
`;

const guessMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'html':
    case 'htm':
    case 'xhtml':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'js':
      return 'text/javascript';
    case 'svg':
      return 'image/svg+xml';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'otf':
      return 'font/otf';
    case 'ttf':
      return 'font/ttf';
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
};

const getFileExtension = (path: string | undefined): string => {
  if (!path) return '';
  const parts = path.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

const slugify = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-');
};

const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const textDecoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true });

const decodeText = (data: Uint8Array | ArrayBuffer): string => {
  if (data instanceof ArrayBuffer) {
    return textDecoder.decode(new Uint8Array(data));
  }
  return textDecoder.decode(data);
};

const sanitizeHtml = (input: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, link[rel="import"]').forEach(el => el.remove());
  doc.querySelectorAll('[onclick], [onload], [onerror], [style*="expression"], [style*="javascript"]').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on') || /javascript:/i.test(attr.value)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
};

const extractSectionsFromHtml = (html: string): { sections: Section[]; toc: TocItem[] } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstElementChild as HTMLElement | null;
  if (!container) {
    return {
      sections: [
        {
          id: 'section-0',
          title: '正文',
          level: 1,
          html,
          plainText: container?.textContent ?? ''
        }
      ],
      toc: [
        {
          id: 'section-0',
          title: '正文',
          level: 1,
          sectionIndex: 0
        }
      ]
    };
  }

  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];

  if (headings.length === 0) {
    return {
      sections: [
        {
          id: 'section-0',
          title: '正文',
          level: 1,
          html,
          plainText: container.textContent ?? ''
        }
      ],
      toc: [
        {
          id: 'section-0',
          title: '正文',
          level: 1,
          sectionIndex: 0
        }
      ]
    };
  }

  const sections: Section[] = [];
  const toc: TocItem[] = [];

  headings.forEach((heading, index) => {
    const level = Number(heading.tagName.substring(1));
    let id = heading.id || slugify(heading.textContent || `section-${index}`);
    if (!heading.id) {
      heading.id = id;
    }

    const sectionContainer = doc.createElement('div');
    sectionContainer.setAttribute('data-source-section', id);
    sectionContainer.appendChild(heading.cloneNode(true));

    let walker: ChildNode | null = heading.nextSibling;
    while (walker) {
      if (walker.nodeType === Node.ELEMENT_NODE) {
        const element = walker as HTMLElement;
        if (/H[1-6]/.test(element.tagName)) {
          break;
        }
      }
      sectionContainer.appendChild(walker.cloneNode(true));
      walker = walker.nextSibling;
    }

    const htmlContent = sectionContainer.innerHTML;
    const plainText = sectionContainer.textContent?.trim() ?? '';

    sections.push({
      id,
      title: heading.textContent?.trim() || `第 ${index + 1} 节`,
      level,
      html: htmlContent,
      plainText
    });

    toc.push({
      id,
      title: heading.textContent?.trim() || `第 ${index + 1} 节`,
      level,
      sectionIndex: index
    });
  });

  return { sections, toc };
};

const markdownToHtml = (markdown: string): string => {
  let text = markdown;

  text = text.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.replace(/[&<>]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[ch] || ch))}</code></pre>`);
  text = text.replace(/^######\s?(.*)$/gm, '<h6>$1</h6>');
  text = text.replace(/^#####\s?(.*)$/gm, '<h5>$1</h5>');
  text = text.replace(/^####\s?(.*)$/gm, '<h4>$1</h4>');
  text = text.replace(/^###\s?(.*)$/gm, '<h3>$1</h3>');
  text = text.replace(/^##\s?(.*)$/gm, '<h2>$1</h2>');
  text = text.replace(/^#\s?(.*)$/gm, '<h1>$1</h1>');
  text = text.replace(/^>\s?(.*)$/gm, '<blockquote>$1</blockquote>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<figure><img src="$2" alt="$1"/><figcaption>$1</figcaption></figure>');
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  text = text.replace(/^-{3,}$/gm, '<hr/>');

  text = text.replace(/^(\s*[-*+]\s.*(?:\n\s*[-*+]\s.*)*)/gm, match => {
    const items = match.split(/\n/).map(line => line.replace(/^\s*[-*+]\s?/, '').trim());
    return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
  });

  text = text.replace(/^(\s*\d+\.\s.*(?:\n\s*\d+\.\s.*)*)/gm, match => {
    const items = match.split(/\n/).map(line => line.replace(/^\s*\d+\.\s?/, '').trim());
    return `<ol>${items.map(item => `<li>${item}</li>`).join('')}</ol>`;
  });

  text = text.replace(/\n{2,}/g, '</p><p>');
  text = `<p>${text}</p>`;
  text = text.replace(/<p><\/p>/g, '');

  return text;
};

const plainTextToHtml = (text: string): string => {
  const escaped = text.replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch] || ch));
  const paragraphs = escaped.split(/\n{2,}/).map(line => line.replace(/\n/g, '<br/>').trim());
  return paragraphs.map(p => `<p>${p}</p>`).join('');
};

type ZipEntryMeta = {
  fileName: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  localHeaderOffset: number;
};

type ZipArchive = Map<string, ZipEntryMeta>;

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIR_SIGNATURE = 0x02014b50;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;

const findEndOfCentralDirectory = (view: DataView): number => {
  for (let i = view.byteLength - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === EOCD_SIGNATURE) {
      return i;
    }
  }
  throw new Error('未找到 ZIP 目录结尾，EPUB 文件可能已损坏');
};

const readCentralDirectory = (buffer: ArrayBuffer): ZipArchive => {
  const view = new DataView(buffer);
  const eocdOffset = findEndOfCentralDirectory(view);
  const centralDirEntries = view.getUint16(eocdOffset + 10, true);
  const centralDirOffset = view.getUint32(eocdOffset + 16, true);

  let cursor = centralDirOffset;
  const archive: ZipArchive = new Map();

  for (let i = 0; i < centralDirEntries; i++) {
    const signature = view.getUint32(cursor, true);
    if (signature !== CENTRAL_DIR_SIGNATURE) {
      throw new Error('ZIP 中心目录结构损坏');
    }

    const compressionMethod = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const fileNameLength = view.getUint16(cursor + 28, true);
    const extraFieldLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localHeaderOffset = view.getUint32(cursor + 42, true);

    const fileNameBytes = new Uint8Array(buffer, cursor + 46, fileNameLength);
    const fileName = decodeText(fileNameBytes);

    archive.set(fileName, {
      fileName,
      compressedSize,
      uncompressedSize,
      compressionMethod,
      localHeaderOffset
    });

    cursor += 46 + fileNameLength + extraFieldLength + commentLength;
  }

  return archive;
};

const readZipEntry = async (buffer: ArrayBuffer, meta: ZipEntryMeta): Promise<Uint8Array> => {
  const view = new DataView(buffer);
  let cursor = meta.localHeaderOffset;

  const signature = view.getUint32(cursor, true);
  if (signature !== LOCAL_FILE_HEADER_SIGNATURE) {
    throw new Error(`ZIP 局部文件头损坏: ${meta.fileName}`);
  }

  const fileNameLength = view.getUint16(cursor + 26, true);
  const extraFieldLength = view.getUint16(cursor + 28, true);
  const dataOffset = cursor + 30 + fileNameLength + extraFieldLength;
  const slice = buffer.slice(dataOffset, dataOffset + meta.compressedSize);

  if (meta.compressionMethod === 0) {
    return new Uint8Array(slice);
  }

  if (meta.compressionMethod === 8) {
    if (typeof (window as any).DecompressionStream === 'undefined') {
      throw new Error('当前浏览器不支持 DecompressionStream，无法解压 EPUB 文件');
    }
    const decompressionStream = new (window as any).DecompressionStream('deflate-raw');
    const response = new Response(new Blob([slice]).stream().pipeThrough(decompressionStream));
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  throw new Error(`暂不支持的压缩算法: ${meta.compressionMethod}`);
};

const resolveEpubPath = (basePath: string, relativePath: string): string => {
  if (/^https?:/.test(relativePath)) return relativePath;
  const baseSegments = basePath.split('/').filter(Boolean);
  const relativeSegments = relativePath.split('/');

  relativeSegments.forEach(segment => {
    if (segment === '.' || segment === '') return;
    if (segment === '..') {
      baseSegments.pop();
    } else {
      baseSegments.push(segment);
    }
  });

  return baseSegments.join('/');
};

const buildSectionStyle = (settings: ReaderSettings): CSSProperties => ({
  fontSize: `${settings.fontSize}px`,
  fontFamily: settings.fontFamily,
  lineHeight: settings.lineHeight,
  maxWidth: `${settings.maxWidth}px`
});

const getStorageKey = (ctx: PluginMountCtx, suffix: string) => {
  const key = ctx.filePath || ctx.entry?.name || 'unknown';
  return `${STORAGE_PREFIX}:${key}:${suffix}`;
};

const createSearchSnippet = (text: string, index: number, length = 60): string => {
  const start = Math.max(0, index - length / 2);
  const end = Math.min(text.length, index + length / 2);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`.replace(/\s+/g, ' ');
};

const usePersistentState = <T,>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch (error) {
      console.warn('读取本地存储失败:', error);
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState(prev => {
        const newValue = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.warn('写入本地存储失败:', error);
        }
        return newValue;
      });
    },
    [key]
  );

  return [state, setValue];
};

const App: React.FC<AppProps> = ({ ctx }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docType, setDocType] = useState<EbookType>('text');
  const [sections, setSections] = useState<Section[]>([]);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [resourceUrls, setResourceUrls] = useState<string[]>([]);

  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfFrameRef = useRef<HTMLIFrameElement>(null);

  const settingsStorageKey = useMemo(() => getStorageKey(ctx, 'settings'), [ctx]);
  const bookmarksStorageKey = useMemo(() => getStorageKey(ctx, 'bookmarks'), [ctx]);
  const progressStorageKey = useMemo(() => getStorageKey(ctx, 'progress'), [ctx]);

  const [settings, setSettings] = usePersistentState<ReaderSettings>(settingsStorageKey, DEFAULT_SETTINGS);
  const [bookmarks, setBookmarks] = usePersistentState<Bookmark[]>(bookmarksStorageKey, []);
  const [progress, setProgress] = usePersistentState<{ sectionIndex: number; percentage: number; page?: number }>(
    progressStorageKey,
    { sectionIndex: 0, percentage: 0 }
  );

  const applyThemeStyle = useMemo(() => THEME_STYLES[settings.theme], [settings.theme]);

  const cleanResourceUrls = useCallback(() => {
    resourceUrls.forEach(url => URL.revokeObjectURL(url));
    setResourceUrls([]);
  }, [resourceUrls]);

  const updateResourceUrls = useCallback((urls: string[]) => {
    cleanResourceUrls();
    setResourceUrls(urls);
  }, [cleanResourceUrls]);

  const updateActiveLocation = useCallback(() => {
    if (docType === 'pdf' || !contentWrapperRef.current) return;

    const container = contentWrapperRef.current;
    const sectionsElements = Array.from(container.querySelectorAll('[data-section-index]')) as HTMLElement[];
    const scrollPosition = settings.mode === 'page' ? container.scrollLeft : container.scrollTop;
    const viewportSize = settings.mode === 'page' ? container.clientWidth : container.clientHeight;
    let foundIndex = 0;

    sectionsElements.forEach(section => {
      const index = Number(section.dataset.sectionIndex);
      if (settings.mode === 'page') {
        const left = section.offsetLeft;
        if (left - 32 <= scrollPosition) {
          foundIndex = index;
        }
      } else {
        const top = section.offsetTop;
        if (top - 64 <= scrollPosition) {
          foundIndex = index;
        }
      }
    });

    setActiveSection(foundIndex);

    const totalScrollable = settings.mode === 'page'
      ? container.scrollWidth - container.clientWidth
      : container.scrollHeight - container.clientHeight;
    const percentage = totalScrollable > 0 ? Math.min(1, scrollPosition / totalScrollable) : 0;
    setProgress(prev => ({ ...prev, sectionIndex: foundIndex, percentage }));
  }, [docType, settings.mode, setProgress]);

  useEffect(() => {
    const container = contentWrapperRef.current;
    if (!container || docType === 'pdf') return;

    const handleScroll = () => {
      window.requestAnimationFrame(updateActiveLocation);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [docType, settings.mode, updateActiveLocation]);

  useEffect(() => {
    return () => {
      cleanResourceUrls();
    };
  }, [cleanResourceUrls]);

  const restoreProgress = useCallback(() => {
    if (!contentWrapperRef.current) return;
    const container = contentWrapperRef.current;

    if (settings.mode === 'page') {
      const target = progress.percentage * (container.scrollWidth - container.clientWidth);
      container.scrollTo({ left: target, behavior: 'auto' });
    } else {
      const target = progress.percentage * (container.scrollHeight - container.clientHeight);
      container.scrollTo({ top: target, behavior: 'auto' });
    }
  }, [progress.percentage, settings.mode]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }
      const results: SearchResult[] = [];
      const keyword = term.toLowerCase();
      sections.forEach((section, index) => {
        const pos = section.plainText.toLowerCase().indexOf(keyword);
        if (pos >= 0) {
          results.push({
            sectionIndex: index,
            snippet: createSearchSnippet(section.plainText, pos)
          });
        }
      });
      setSearchResults(results.slice(0, 50));
    },
    [sections]
  );

  const scrollToSection = useCallback(
    (index: number, highlightId?: string) => {
      if (docType === 'pdf') return;
      const container = contentWrapperRef.current;
      if (!container) return;
      const target = container.querySelector(`[data-section-index="${index}"]`) as HTMLElement | null;
      if (!target) return;

      if (settings.mode === 'page') {
        container.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
      } else {
        container.scrollTo({ top: target.offsetTop - 32, behavior: 'smooth' });
      }

      setActiveSection(index);

      if (highlightId) {
        const el = target.querySelector(`#${CSS.escape(highlightId)}`) as HTMLElement | null;
        if (el) {
          el.classList.add('highlight-anchor');
          setTimeout(() => el.classList.remove('highlight-anchor'), 1600);
        }
      }
    },
    [docType, settings.mode]
  );

  const addBookmark = useCallback(() => {
    if (docType === 'pdf') {
      setBookmarks(prev => [
        ...prev,
        {
          id: `bookmark-${Date.now()}`,
          label: `第 ${pdfPage} 页`,
          sectionIndex: 0,
          percentage: 0,
          page: pdfPage,
          createdAt: Date.now()
        }
      ]);
      return;
    }

    const section = sections[activeSection];
    if (!section) return;
    const container = contentWrapperRef.current;
    if (!container) return;

    const totalScrollable = settings.mode === 'page'
      ? container.scrollWidth - container.clientWidth
      : container.scrollHeight - container.clientHeight;
    const current = settings.mode === 'page' ? container.scrollLeft : container.scrollTop;
    const percentage = totalScrollable > 0 ? current / totalScrollable : 0;

    setBookmarks(prev => [
      ...prev,
      {
        id: `bookmark-${Date.now()}`,
        label: section.title,
        sectionIndex: activeSection,
        percentage,
        createdAt: Date.now()
      }
    ]);
  }, [activeSection, docType, pdfPage, sections, setBookmarks, settings.mode]);

  const removeBookmark = useCallback(
    (id: string) => {
      setBookmarks(prev => prev.filter(item => item.id !== id));
    },
    [setBookmarks]
  );

  const handleBookmarkClick = useCallback(
    (bookmark: Bookmark) => {
      if (docType === 'pdf' && pdfFrameRef.current && bookmark.page) {
        pdfFrameRef.current.contentWindow?.postMessage({ type: 'foxel-pdf-goto-page', page: bookmark.page }, '*');
        setPdfPage(bookmark.page);
        return;
      }
      if (!contentWrapperRef.current) return;

      const container = contentWrapperRef.current;
      if (settings.mode === 'page') {
        const target = bookmark.percentage * (container.scrollWidth - container.clientWidth);
        container.scrollTo({ left: target, behavior: 'smooth' });
      } else {
        const target = bookmark.percentage * (container.scrollHeight - container.clientHeight);
        container.scrollTo({ top: target, behavior: 'smooth' });
      }
    },
    [docType, settings.mode, pdfFrameRef]
  );

  const handleThemeChange = useCallback((theme: ReaderTheme) => {
    setSettings(prev => ({ ...prev, theme }));
  }, [setSettings]);

  const handleModeToggle = useCallback(() => {
    setSettings(prev => ({ ...prev, mode: prev.mode === 'scroll' ? 'page' : 'scroll' }));
    setTimeout(() => restoreProgress(), 90);
  }, [restoreProgress, setSettings]);

  const adjustFontSize = useCallback((delta: number) => {
    setSettings(prev => ({ ...prev, fontSize: Math.min(32, Math.max(12, prev.fontSize + delta)) }));
  }, [setSettings]);

  const adjustLineHeight = useCallback((delta: number) => {
    setSettings(prev => ({ ...prev, lineHeight: Number(Math.min(2.4, Math.max(1.2, (prev.lineHeight + delta).toFixed(1)))) }));
  }, [setSettings]);

  const adjustWidth = useCallback((delta: number) => {
    setSettings(prev => ({ ...prev, maxWidth: Math.min(1200, Math.max(560, prev.maxWidth + delta)) }));
  }, [setSettings]);

  const parseHtmlDocument = useCallback((html: string) => {
    const sanitized = sanitizeHtml(html);
    const { sections: parsedSections, toc: parsedToc } = extractSectionsFromHtml(sanitized);
    setSections(parsedSections);
    setToc(parsedToc);
  }, []);

  const handlePdfBlob = useCallback((buffer: ArrayBuffer) => {
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
    updateResourceUrls([url]);
    setPdfUrl(url);
    setDocType('pdf');
    setLoading(false);
    setError(null);
  }, [updateResourceUrls]);

  const parsePlainTextDocument = useCallback((content: string) => {
    const html = plainTextToHtml(content);
    parseHtmlDocument(html);
  }, [parseHtmlDocument]);

  const parseMarkdownDocument = useCallback((content: string) => {
    const html = markdownToHtml(content);
    parseHtmlDocument(html);
  }, [parseHtmlDocument]);

  const parseHtmlContent = useCallback((content: string) => {
    parseHtmlDocument(content);
  }, [parseHtmlDocument]);

  const parseEpubDocument = useCallback(async (buffer: ArrayBuffer) => {
    const archive = readCentralDirectory(buffer);

    const containerEntry = archive.get('META-INF/container.xml');
    if (!containerEntry) {
      throw new Error('EPUB 缺少 META-INF/container.xml 文件');
    }
    const containerXml = decodeText(await readZipEntry(buffer, containerEntry));
    const containerDoc = new DOMParser().parseFromString(containerXml, 'text/xml');
    const rootfileElement = containerDoc.querySelector('rootfile');
    if (!rootfileElement) {
      throw new Error('EPUB 未指定 OPF 主文件');
    }

    const opfPath = rootfileElement.getAttribute('full-path');
    if (!opfPath) {
      throw new Error('EPUB container 缺少 full-path 属性');
    }

    const opfEntry = archive.get(opfPath);
    if (!opfEntry) {
      throw new Error(`EPUB 缺少 OPF 文件: ${opfPath}`);
    }

    const opfXml = decodeText(await readZipEntry(buffer, opfEntry));
    const opfDoc = new DOMParser().parseFromString(opfXml, 'text/xml');
    const manifestItems = Array.from(opfDoc.querySelectorAll('manifest > item'));
    const spineItems = Array.from(opfDoc.querySelectorAll('spine > itemref'));

    const manifestMap = new Map<string, { href: string; mediaType: string; properties: string | null }>();
    manifestItems.forEach(item => {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      const mediaType = item.getAttribute('media-type');
      const properties = item.getAttribute('properties');
      if (id && href && mediaType) {
        manifestMap.set(id, { href, mediaType, properties });
      }
    });

    const basePath = opfPath.split('/').slice(0, -1).join('/');

    const loadedSections: Section[] = [];
    const loadedToc: TocItem[] = [];
    const blobUrls: string[] = [];

    const resolveResource = async (href: string): Promise<string | null> => {
      const fullPath = resolveEpubPath(basePath, href);
      const entry = archive.get(fullPath);
      if (!entry) return null;
      const data = await readZipEntry(buffer, entry);
      const blob = new Blob([data], { type: guessMimeType(href) });
      const blobUrl = URL.createObjectURL(blob);
      blobUrls.push(blobUrl);
      return blobUrl;
    };

    const inlineStyles = async (doc: Document): Promise<void> => {
      const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
      await Promise.all(
        links.map(async link => {
          const href = link.getAttribute('href');
          if (!href) return;
          const url = resolveEpubPath(basePath, href);
          const entry = archive.get(url);
          if (!entry) return;
          const data = await readZipEntry(buffer, entry);
          const style = doc.createElement('style');
          style.textContent = decodeText(data);
          link.replaceWith(style);
        })
      );
    };

    for (let spineIndex = 0; spineIndex < spineItems.length; spineIndex++) {
      const itemref = spineItems[spineIndex];
      const idref = itemref.getAttribute('idref');
      if (!idref) continue;
      const manifestItem = manifestMap.get(idref);
      if (!manifestItem) continue;
      if (!/html|xhtml|xml/.test(manifestItem.mediaType)) continue;

      const contentPath = resolveEpubPath(basePath, manifestItem.href);
      const entry = archive.get(contentPath);
      if (!entry) continue;

      const xhtml = decodeText(await readZipEntry(buffer, entry));
      const parser = new DOMParser();
      const xhtmlDoc = parser.parseFromString(xhtml, 'text/html');
      await inlineStyles(xhtmlDoc);

      // Replace resource URLs with blob versions
      const resourceElements = xhtmlDoc.querySelectorAll('img, image, audio, video, source');
      await Promise.all(
        Array.from(resourceElements).map(async element => {
          const attr = element.tagName.toLowerCase() === 'object' ? 'data' : 'src';
          const src = element.getAttribute(attr);
          if (!src) return;
          const blobUrl = await resolveResource(src);
          if (blobUrl) {
            element.setAttribute(attr, blobUrl);
          }
        })
      );

      const body = xhtmlDoc.body;
      if (!body) continue;
      const sanitized = sanitizeHtml(body.innerHTML);
      const { sections: chapterSections, toc: chapterToc } = extractSectionsFromHtml(sanitized);

      if (chapterSections.length === 0) {
        loadedSections.push({
          id: `chapter-${spineIndex}`,
          title: `章节 ${spineIndex + 1}`,
          level: 1,
          html: sanitized,
          plainText: xhtmlDoc.body.textContent?.trim() ?? ''
        });
        loadedToc.push({
          id: `chapter-${spineIndex}`,
          title: `章节 ${spineIndex + 1}`,
          level: 1,
          sectionIndex: loadedSections.length - 1
        });
      } else {
        chapterSections.forEach(section => loadedSections.push(section));
        chapterToc.forEach(item => {
          loadedToc.push({
            ...item,
            sectionIndex: loadedSections.findIndex(section => section.id === item.id)
          });
        });
      }
    }

    // 构建导航
    const navItem = manifestItems.find(item => item.getAttribute('properties')?.includes('nav'));
    if (navItem) {
      const navPath = resolveEpubPath(basePath, navItem.getAttribute('href') || '');
      const navEntry = navPath ? archive.get(navPath) : null;
      if (navEntry) {
        const navContent = decodeText(await readZipEntry(buffer, navEntry));
        const navDoc = new DOMParser().parseFromString(navContent, 'text/html');
        const navList = navDoc.querySelector('nav[epub|type="toc"], nav[type="toc"], nav');
        if (navList) {
          const items: TocItem[] = [];
          navList.querySelectorAll('a').forEach(anchor => {
            const href = anchor.getAttribute('href');
            const title = anchor.textContent?.trim() ?? '';
            if (!href || !title) return;
            const [path, hash] = href.split('#');
            const resolvedPath = resolveEpubPath(basePath, path || '');
            const sectionId = hash || slugify(title);
            const sectionIndex = loadedSections.findIndex(section => section.id === sectionId);
            if (sectionIndex >= 0) {
              items.push({
                id: sectionId,
                title,
                href: resolvedPath,
                level: 1,
                sectionIndex
              });
            }
          });
          if (items.length > 0) {
            items.sort((a, b) => a.sectionIndex - b.sectionIndex);
            loadedToc.splice(0, loadedToc.length, ...items);
          }
        }
      }
    }

    updateResourceUrls(blobUrls);
    setSections(loadedSections);
    setToc(loadedToc.length > 0 ? loadedToc : loadedSections.map((section, index) => ({
      id: section.id,
      title: section.title,
      level: section.level,
      sectionIndex: index
    })));
  }, [updateResourceUrls]);

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDocType('text');
    setSections([]);
    setToc([]);
    setPdfUrl(null);
    setPdfPage(1);

    try {
      const extension = getFileExtension(ctx.filePath);
      const response = await fetch(ctx.urls.downloadUrl);
      if (!response.ok) {
        throw new Error(`无法加载文件：${response.status}`);
      }

      if (extension === 'pdf') {
        const buffer = await response.arrayBuffer();
        handlePdfBlob(buffer);
        return;
      }

      if (extension === 'epub') {
        const buffer = await response.arrayBuffer();
        await parseEpubDocument(buffer);
        setDocType('epub');
        setLoading(false);
        return;
      }

      if (TEXT_FORMATS.has(extension)) {
        const text = await response.text();
        parsePlainTextDocument(text);
        setDocType('text');
      } else if (MARKDOWN_FORMATS.has(extension)) {
        const text = await response.text();
        parseMarkdownDocument(text);
        setDocType('markdown');
      } else if (HTML_FORMATS.has(extension)) {
        const text = await response.text();
        parseHtmlContent(text);
        setDocType('html');
      } else {
        const text = await response.text();
        parsePlainTextDocument(text);
        setDocType('text');
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '文件加载失败');
      setLoading(false);
    }
  }, [ctx.filePath, ctx.urls.downloadUrl, handlePdfBlob, parseEpubDocument, parseHtmlContent, parseMarkdownDocument, parsePlainTextDocument]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  useEffect(() => {
    if (!loading && !error) {
      setTimeout(() => restoreProgress(), 120);
    }
  }, [loading, error, restoreProgress]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'f':
            event.preventDefault();
            const keyword = window.prompt('请输入要搜索的内容', searchTerm);
            if (keyword !== null) {
              handleSearch(keyword);
            }
            break;
          case 'b':
            event.preventDefault();
            addBookmark();
            break;
          case '+':
          case '=':
            event.preventDefault();
            adjustFontSize(1);
            break;
          case '-':
            event.preventDefault();
            adjustFontSize(-1);
            break;
        }
      } else {
        switch (event.key) {
          case '[':
            event.preventDefault();
            scrollToSection(Math.max(0, activeSection - 1));
            break;
          case ']':
            event.preventDefault();
            scrollToSection(Math.min(sections.length - 1, activeSection + 1));
            break;
          case 'PageDown':
            event.preventDefault();
            if (contentWrapperRef.current) {
              if (settings.mode === 'page') {
                contentWrapperRef.current.scrollBy({ left: contentWrapperRef.current.clientWidth, behavior: 'smooth' });
              } else {
                contentWrapperRef.current.scrollBy({ top: contentWrapperRef.current.clientHeight, behavior: 'smooth' });
              }
            }
            break;
          case 'PageUp':
            event.preventDefault();
            if (contentWrapperRef.current) {
              if (settings.mode === 'page') {
                contentWrapperRef.current.scrollBy({ left: -contentWrapperRef.current.clientWidth, behavior: 'smooth' });
              } else {
                contentWrapperRef.current.scrollBy({ top: -contentWrapperRef.current.clientHeight, behavior: 'smooth' });
              }
            }
            break;
          case 't':
          case 'T':
            event.preventDefault();
            handleThemeChange(settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'sepia' : 'light');
            break;
          case 'Escape':
            event.preventDefault();
            ctx.host.close();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeSection, addBookmark, adjustFontSize, ctx.host, handleSearch, handleThemeChange, scrollToSection, searchTerm, sections.length, settings.mode, settings.theme]);

  useEffect(() => {
    if (docType !== 'pdf' || !pdfFrameRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      if (!PDF_VIEWER_MESSAGE_TARGETS.includes(event.data?.type)) return;
      if (typeof event.data?.pageNumber === 'number') {
        setPdfPage(event.data.pageNumber);
      }
      if (typeof event.data?.pageCount === 'number') {
        setTotalPages(event.data.pageCount);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [docType]);

  const readerClassName = useMemo(() => `foxel-reader foxel-reader-${settings.theme}`, [settings.theme]);

  const readerStyle: CSSProperties = useMemo(() => ({
    ...applyThemeStyle,
    '--reader-font-size': `${settings.fontSize}px`,
    '--reader-line-height': `${settings.lineHeight}`,
    '--reader-max-width': `${settings.maxWidth}px`
  }), [applyThemeStyle, settings.fontSize, settings.lineHeight, settings.maxWidth]);

  const contentStyle: CSSProperties = useMemo(() => ({
    maxWidth: `${settings.maxWidth}px`,
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    fontFamily: settings.fontFamily
  }), [settings.fontSize, settings.fontFamily, settings.lineHeight, settings.maxWidth]);

  const wrapperStyle: CSSProperties = useMemo(() => ({
    overflowY: settings.mode === 'scroll' ? 'auto' : 'hidden',
    overflowX: settings.mode === 'scroll' ? 'hidden' : 'auto',
    scrollBehavior: 'smooth'
  }), [settings.mode]);

  const columnStyle: CSSProperties = useMemo(() => ({
    columnWidth: settings.mode === 'page' ? `${settings.maxWidth + 80}px` : 'auto',
    columnGap: settings.mode === 'page' ? '80px' : '0',
    padding: settings.mode === 'page' ? '40px 80px 80px 80px' : '40px 0',
    display: settings.mode === 'page' ? 'block' : 'flex',
    flexDirection: settings.mode === 'page' ? undefined : 'column'
  }), [settings.maxWidth, settings.mode]);

  const progressIndicator = useMemo(() => {
    if (docType === 'pdf') {
      return totalPages ? `第 ${pdfPage}/${totalPages} 页` : `第 ${pdfPage} 页`;
    }
    const percentage = Math.round(progress.percentage * 100);
    return `阅读进度 ${percentage}% · 第 ${activeSection + 1}/${sections.length || 1} 节`;
  }, [activeSection, docType, pdfPage, progress.percentage, sections.length, totalPages]);

  const renderContent = () => {
    if (docType === 'pdf') {
      return (
        <div className="pdf-viewer">
          {pdfUrl ? (
            <iframe
              ref={pdfFrameRef}
              src={pdfUrl}
              title="PDF 阅读器"
              className="pdf-iframe"
            />
          ) : (
            <div className="empty-state">PDF 加载中...</div>
          )}
          <div className="pdf-actions">
            <button onClick={() => addBookmark()}>添加书签</button>
            <a href={pdfUrl ?? '#'} download={ctx.entry.name} className="ghost">下载文件</a>
            <button className="ghost" onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}>在新窗口打开</button>
          </div>
        </div>
      );
    }

    return (
      <div className="reader-body" style={columnStyle} ref={contentRef}>
        {sections.map((section, index) => (
          <section
            key={section.id || index}
            id={section.id}
            className={`reader-section level-${section.level}`}
            data-section-index={index}
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: section.html }}
          />
        ))}
      </div>
    );
  };

  return (
    <div id="foxel-ebook-reader" className={readerClassName} style={readerStyle}>
      <style>{READER_STYLES}</style>
      <header className="reader-header">
        <div>
          <h1 className="title">{ctx.entry.name}</h1>
          <p className="subtitle">{progressIndicator}</p>
        </div>
        <div className="actions">
          <button onClick={() => handleThemeChange('light')} className={settings.theme === 'light' ? 'active' : ''}>浅色</button>
          <button onClick={() => handleThemeChange('dark')} className={settings.theme === 'dark' ? 'active' : ''}>深色</button>
          <button onClick={() => handleThemeChange('sepia')} className={settings.theme === 'sepia' ? 'active' : ''}>米黄</button>
          <button onClick={() => adjustFontSize(1)}>字号+</button>
          <button onClick={() => adjustFontSize(-1)}>字号-</button>
          <button onClick={() => adjustLineHeight(0.1)}>行距+</button>
          <button onClick={() => adjustLineHeight(-0.1)}>行距-</button>
          <button onClick={() => adjustWidth(40)}>宽度+</button>
          <button onClick={() => adjustWidth(-40)}>宽度-</button>
          <button onClick={handleModeToggle}>{settings.mode === 'scroll' ? '分页模式' : '滚动模式'}</button>
          <button onClick={() => handleSearch(window.prompt('请输入要搜索的内容', searchTerm) || '')}>搜索</button>
          <button onClick={addBookmark}>添加书签</button>
          <button className="ghost" onClick={() => ctx.host.close()}>关闭</button>
        </div>
      </header>

      {loading && <div className="status">正在加载电子书...</div>}
      {error && <div className="status error">{error}</div>}

      <main className="reader-layout">
        <aside className="sidebar">
          <section className="sidebar-section">
            <h2>目录</h2>
            <div className="toc-list">
              {toc.length === 0 && <div className="empty-state">尚未生成目录</div>}
              {toc.map(item => (
                <button
                  key={`${item.id}-${item.sectionIndex}`}
                  className={`toc-item level-${item.level} ${activeSection === item.sectionIndex ? 'active' : ''}`}
                  onClick={() => scrollToSection(item.sectionIndex, item.id)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </section>

          <section className="sidebar-section">
            <h2>书签</h2>
            <div className="bookmark-list">
              {bookmarks.length === 0 && <div className="empty-state">暂无书签</div>}
              {bookmarks.map(bookmark => (
                <div key={bookmark.id} className="bookmark-item">
                  <button onClick={() => handleBookmarkClick(bookmark)}>
                    <strong>{bookmark.label}</strong>
                    <span>{formatDateTime(bookmark.createdAt)}</span>
                  </button>
                  <button className="delete" onClick={() => removeBookmark(bookmark.id)}>删除</button>
                </div>
              ))}
            </div>
          </section>

          {searchTerm && (
            <section className="sidebar-section">
              <h2>搜索结果</h2>
              <div className="search-results">
                {searchResults.length === 0 && <div className="empty-state">未找到匹配内容</div>}
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.sectionIndex}-${index}`}
                    onClick={() => scrollToSection(result.sectionIndex)}
                    className="search-result"
                  >
                    <strong>第 {result.sectionIndex + 1} 节</strong>
                    <span>{result.snippet}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </aside>

        <section className="reader-content">
          <div className={`content-wrapper ${settings.mode === 'page' ? 'mode-page' : 'mode-scroll'}`} ref={contentWrapperRef} style={wrapperStyle}>
            {renderContent()}
          </div>
        </section>
      </main>

      <footer className="reader-footer">
        <span>{docType === 'pdf' ? 'PDF 模式 · 使用浏览器内置工具栏查看更多控制' : '滚动以更新进度，支持快捷键 [ 、 ] 导航章节'}</span>
        <div className="footer-actions">
          <button className="ghost" onClick={() => scrollToSection(0)}>回到开头</button>
          <button className="ghost" onClick={() => scrollToSection(sections.length - 1)}>跳到结尾</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
