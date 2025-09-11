import { useState } from 'react';
import { themes } from '../constants/themes';
import { CodeTheme } from '../types';

export const useSettings = () => {
  const [currentTheme, setCurrentTheme] = useState<CodeTheme>(themes);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [enableCodeFolding, setEnableCodeFolding] = useState<boolean>(false);

  return {
    currentTheme,
    setCurrentTheme,
    showLineNumbers,
    setShowLineNumbers,
    wordWrap,
    setWordWrap,
    fontSize,
    setFontSize,
    enableCodeFolding,
    setEnableCodeFolding
  };
};