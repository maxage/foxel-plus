import React, { useMemo } from 'react';
import { renderPreviewContent } from '../utils/preview';
import { CodeTheme } from '../types';

interface PreviewProps {
  code: string;
  language: string;
  theme: CodeTheme;
  fontSize: number;
}

export const Preview: React.FC<PreviewProps> = ({ code, language, theme, fontSize }) => {
  const previewContent = useMemo(() => {
    return renderPreviewContent(code, language);
  }, [code, language]);

  return (
    <div
      className="preview-view"
      style={{
        backgroundColor: theme.background,
        color: theme.foreground,
        fontSize: `${fontSize}px`,
      }}
    >
      {language === 'html' ? (
        <iframe
          srcDoc={previewContent}
          className="preview-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      ) : (
        <>
          <style>
            {`
              .markdown-preview h1, .markdown-preview h2, .markdown-preview h3, 
              .markdown-preview h4, .markdown-preview h5, .markdown-preview h6 {
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                font-weight: bold;
                color: ${theme.foreground};
              }
              .markdown-preview h1 { font-size: 2em; border-bottom: 2px solid ${theme.comment}; padding-bottom: 0.3em; }
              .markdown-preview h2 { font-size: 1.5em; border-bottom: 1px solid ${theme.comment}; padding-bottom: 0.3em; }
              .markdown-preview h3 { font-size: 1.25em; }
              .markdown-preview h4 { font-size: 1.1em; }
              .markdown-preview h5 { font-size: 1em; }
              .markdown-preview h6 { font-size: 0.9em; color: ${theme.comment}; }
              
              .markdown-preview pre {
                background-color: ${theme.background === '#1e1e1e' ? '#2d2d2d' : '#f5f5f5'};
                padding: 12px;
                border-radius: 4px;
                overflow: auto;
                margin: 1em 0;
                border: 1px solid ${theme.comment};
              }
              
              .markdown-preview code {
                background-color: ${theme.background === '#1e1e1e' ? '#2d2d2d' : '#f5f5f5'};
                padding: 2px 4px;
                border-radius: 2px;
                font-family: Monaco, Consolas, "Courier New", monospace;
                color: ${theme.foreground};
              }
              
              .markdown-preview blockquote {
                border-left: 4px solid ${theme.comment};
                padding-left: 16px;
                margin: 1em 0;
                font-style: italic;
                color: ${theme.comment};
              }
              
              .markdown-preview ul, .markdown-preview ol {
                padding-left: 2em;
                margin: 1em 0;
              }
              
              .markdown-preview li {
                margin: 0.25em 0;
              }
              
              .markdown-preview img {
                max-width: 100%;
                height: auto;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              
              .markdown-preview a {
                color: #007acc;
                text-decoration: none;
              }
              
              .markdown-preview a:hover {
                text-decoration: underline;
              }
              
              .markdown-preview hr {
                border: none;
                border-top: 1px solid ${theme.comment};
                margin: 2em 0;
              }
              
              .markdown-preview table {
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
              }
              
              .markdown-preview th, .markdown-preview td {
                border: 1px solid ${theme.comment};
                padding: 8px 12px;
                text-align: left;
              }
              
              .markdown-preview th {
                background-color: ${theme.background === '#1e1e1e' ? '#2d2d2d' : '#f5f5f5'};
                font-weight: bold;
              }
            `}
          </style>
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </>
      )}
    </div>
  );
};