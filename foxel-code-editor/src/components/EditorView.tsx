import React from 'react';
import { CodeTheme } from '../types';

interface EditorViewProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  theme: CodeTheme;
  wordWrap: boolean;
  fontSize: number;
}

export const EditorView: React.FC<EditorViewProps> = ({
  code,
  onCodeChange,
  theme,
  wordWrap,
  fontSize,
}) => {
  return (
    <textarea
      value={code}
      onChange={(e) => onCodeChange(e.target.value)}
      style={{
        width: '100%',
        height: '100%',
        padding: '20px',
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        fontSize: `${fontSize}px`,
        lineHeight: '1.5',
        backgroundColor: theme.background,
        color: theme.foreground,
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