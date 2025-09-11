import React, { useMemo } from 'react';
import { highlightCode } from '../utils/language';
import { CodeTheme } from '../types';

interface CodeViewProps {
  code: string;
  language: string;
  theme: CodeTheme;
  showLineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  enableCodeFolding: boolean;
}

export const CodeView: React.FC<CodeViewProps> = ({
  code,
  language,
  theme,
  showLineNumbers,
  wordWrap,
  fontSize,
  enableCodeFolding,
}) => {
  const highlightedCode = useMemo(() => {
    return highlightCode(code, language);
  }, [code, language]);

  const lines = useMemo(() => code.split('\n'), [code]);
  const highlightedLines = useMemo(() => highlightedCode.split('\n'), [highlightedCode]);

  return (
    <div
      className="code-view"
      style={{
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        fontSize: `${fontSize}px`,
        lineHeight: '1.5',
        backgroundColor: theme.background,
        color: theme.foreground,
      }}
    >
      <style>
        {`
          .keyword { color: ${theme.keyword}; font-weight: bold; }
          .string { color: ${theme.string}; }
          .comment { color: ${theme.comment}; font-style: italic; }
          .number { color: ${theme.number}; }
          .function { color: ${theme.function}; }
          .variable { color: ${theme.variable}; }
          .type { color: ${theme.type}; }
          .operator { color: ${theme.operator}; }
          .punctuation { color: ${theme.punctuation}; }
        `}
      </style>
      {lines.map((line, index) => (
        <div key={index} className="code-line">
          {showLineNumbers && <span className="line-number">{index + 1}</span>}
          <span
            className="line-content"
            style={{ whiteSpace: wordWrap ? 'pre-wrap' : 'pre' }}
            dangerouslySetInnerHTML={{ __html: highlightedLines[index] || '' }}
          />
        </div>
      ))}
    </div>
  );
};