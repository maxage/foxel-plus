import { useState } from 'react';

interface UIStateArgs {
  isModified: boolean;
  saveCode: () => void;
}

export const useUIState = ({ isModified, saveCode }: UIStateArgs) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleEditMode = () => {
    if (editMode && isModified) {
      if (window.confirm('有未保存的更改，是否保存？')) {
        saveCode();
      }
    }
    setEditMode(!editMode);
  };

  return {
    editMode,
    previewMode,
    showSearch,
    showSettings,
    showInfo,
    isFullscreen,
    setEditMode,
    setPreviewMode,
    setShowSearch,
    setShowSettings,
    setShowInfo,
    setIsFullscreen,
    toggleEditMode,
  };
};