import React, { useState, useEffect, useRef } from 'react';
import { PluginMountCtx } from '../foxel.d';

interface AppProps {
  ctx: PluginMountCtx;
}

const App: React.FC<AppProps> = ({ ctx }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: string } | null>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [toolbarTimeout, setToolbarTimeout] = useState<number | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [imageHistory, setImageHistory] = useState<Array<{
    zoom: number;
    position: { x: number; y: number };
    rotation: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setShowInfo(false);
    setImageInfo(null);
  }, [ctx.filePath]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            handleResetZoom();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case 'r':
            e.preventDefault();
            handleRotate();
            break;
          case 'h':
            e.preventDefault();
            handleFlipHorizontal();
            break;
          case 'v':
            e.preventDefault();
            handleFlipVertical();
            break;
          case 'f':
            e.preventDefault();
            handleToggleFullscreen();
            break;
          case 'i':
            e.preventDefault();
            setShowInfo(!showInfo);
            break;
          case 'z':
            e.preventDefault();
            handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
        }
      } else {
        switch (e.key) {
          case 'Escape':
            if (isFullscreen) {
              handleToggleFullscreen();
            } else {
              handleClose();
            }
            break;
          case ' ':
            e.preventDefault();
            handleToggleToolbar();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, showInfo]);

  // 全屏模式
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (isCurrentlyFullscreen) {
        document.body.style.overflow = 'hidden';
        // 全屏时确保工具栏显示
        setShowToolbar(true);
      } else {
        document.body.style.overflow = 'auto';
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    setImageError(false);
    
    const img = e.target as HTMLImageElement;
    setImageInfo({
      width: img.naturalWidth,
      height: img.naturalHeight,
      size: formatFileSize(ctx.entry.size)
    });
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 10));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    if (imageRef.current && containerRef.current) {
      const container = containerRef.current;
      const img = imageRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      
      const scaleX = containerWidth / imgWidth;
      const scaleY = containerHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      setZoom(scale);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setFlipHorizontal(prev => !prev);
  };

  const handleFlipVertical = () => {
    setFlipVertical(prev => !prev);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleToggleToolbar = () => {
    setShowToolbar(prev => !prev);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(10, prev * delta)));
  };

  const handleMouseEnter = () => {
    if (toolbarTimeout) {
      clearTimeout(toolbarTimeout);
    }
    setShowToolbar(true);
  };

  const handleMouseLeave = () => {
    const timeout = window.setTimeout(() => {
      setShowToolbar(false);
    }, 2000);
    setToolbarTimeout(timeout);
  };

  const handleClose = () => {
    ctx.host.close();
  };

  // 保存当前状态到历史记录
  const saveToHistory = () => {
    const currentState = {
      zoom,
      position,
      rotation,
      flipHorizontal,
      flipVertical,
      brightness,
      contrast,
      saturation,
      hue,
      blur
    };
    
    const newHistory = imageHistory.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    
    // 限制历史记录数量
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setImageHistory(newHistory);
  };

  // 撤销
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = imageHistory[historyIndex - 1];
      setZoom(prevState.zoom);
      setPosition(prevState.position);
      setRotation(prevState.rotation);
      setFlipHorizontal(prevState.flipHorizontal);
      setFlipVertical(prevState.flipVertical);
      setBrightness(prevState.brightness);
      setContrast(prevState.contrast);
      setSaturation(prevState.saturation);
      setHue(prevState.hue);
      setBlur(prevState.blur);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // 重做
  const handleRedo = () => {
    if (historyIndex < imageHistory.length - 1) {
      const nextState = imageHistory[historyIndex + 1];
      setZoom(nextState.zoom);
      setPosition(nextState.position);
      setRotation(nextState.rotation);
      setFlipHorizontal(nextState.flipHorizontal);
      setFlipVertical(nextState.flipVertical);
      setBrightness(nextState.brightness);
      setContrast(nextState.contrast);
      setSaturation(nextState.saturation);
      setHue(nextState.hue);
      setBlur(nextState.blur);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // 重置所有滤镜
  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    saveToHistory();
  };

  // 复制图片到剪贴板
  const handleCopyImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx_canvas = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (!img || !ctx_canvas) return;
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // 应用滤镜
      ctx_canvas.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`;
      
      // 应用变换
      ctx_canvas.save();
      
      if (rotation !== 0) {
        ctx_canvas.translate(canvas.width / 2, canvas.height / 2);
        ctx_canvas.rotate((rotation * Math.PI) / 180);
        ctx_canvas.translate(-canvas.width / 2, -canvas.height / 2);
      }
      
      if (flipHorizontal || flipVertical) {
        const scaleX = flipHorizontal ? -1 : 1;
        const scaleY = flipVertical ? -1 : 1;
        ctx_canvas.scale(scaleX, scaleY);
        ctx_canvas.translate(flipHorizontal ? -canvas.width : 0, flipVertical ? -canvas.height : 0);
      }
      
      ctx_canvas.drawImage(img, 0, 0);
      ctx_canvas.restore();
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          console.log('图片已复制到剪贴板');
        }
      });
    } catch (error) {
      console.error('复制图片失败:', error);
    }
  };

  // 下载图片
  const handleDownloadImage = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx_canvas = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (!img || !ctx_canvas) return;
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // 应用滤镜
      ctx_canvas.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`;
      
      // 应用变换
      ctx_canvas.save();
      
      if (rotation !== 0) {
        ctx_canvas.translate(canvas.width / 2, canvas.height / 2);
        ctx_canvas.rotate((rotation * Math.PI) / 180);
        ctx_canvas.translate(-canvas.width / 2, -canvas.height / 2);
      }
      
      if (flipHorizontal || flipVertical) {
        const scaleX = flipHorizontal ? -1 : 1;
        const scaleY = flipVertical ? -1 : 1;
        ctx_canvas.scale(scaleX, scaleY);
        ctx_canvas.translate(flipHorizontal ? -canvas.width : 0, flipVertical ? -canvas.height : 0);
      }
      
      ctx_canvas.drawImage(img, 0, 0);
      ctx_canvas.restore();
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = ctx.filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') + '_edited.png' || 'image_edited.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('下载图片失败:', error);
    }
  };

  const getTransform = () => {
    let transform = `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`;
    
    if (rotation !== 0) {
      transform += ` rotate(${rotation}deg)`;
    }
    
    if (flipHorizontal || flipVertical) {
      const scaleX = flipHorizontal ? -1 : 1;
      const scaleY = flipVertical ? -1 : 1;
      transform += ` scale(${scaleX}, ${scaleY})`;
    }
    
    return transform;
  };

  const getFilter = () => {
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`;
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
    textOverflow: 'ellipsis'
  });

  return (
    <div 
      ref={containerRef}
      id="foxel-image-viewer-plus" 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden'
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
          {/* 缩放控制 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <button
              onClick={handleZoomOut}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              −
            </button>
            <span style={{ 
              fontSize: isFullscreen ? '16px' : '12px', 
              minWidth: isFullscreen ? '60px' : '40px', 
              textAlign: 'center',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              +
            </button>
          </div>

          {/* 视图控制 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <button
              onClick={handleResetZoom}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              重置
            </button>
            <button
              onClick={handleFitToScreen}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              适应屏幕
            </button>
          </div>

          {/* 变换控制 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <button
              onClick={handleRotate}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              🔄 旋转
            </button>
            <button
              onClick={handleFlipHorizontal}
              style={getButtonStyle(flipHorizontal)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = flipHorizontal ? '#0088dd' : '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = flipHorizontal ? '#007acc' : '#444'}
            >
              ↔️ 水平翻转
            </button>
            <button
              onClick={handleFlipVertical}
              style={getButtonStyle(flipVertical)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = flipVertical ? '#0088dd' : '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = flipVertical ? '#007acc' : '#444'}
            >
              ↕️ 垂直翻转
            </button>
          </div>

          <div style={{ flex: 1 }} />

          {/* 历史记录控制 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              style={{
                ...getButtonStyle(),
                opacity: historyIndex <= 0 ? 0.5 : 1,
                cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (historyIndex > 0) e.currentTarget.style.backgroundColor = '#555';
              }}
              onMouseLeave={(e) => {
                if (historyIndex > 0) e.currentTarget.style.backgroundColor = '#444';
              }}
            >
              ↶ 撤销
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= imageHistory.length - 1}
              style={{
                ...getButtonStyle(),
                opacity: historyIndex >= imageHistory.length - 1 ? 0.5 : 1,
                cursor: historyIndex >= imageHistory.length - 1 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (historyIndex < imageHistory.length - 1) e.currentTarget.style.backgroundColor = '#555';
              }}
              onMouseLeave={(e) => {
                if (historyIndex < imageHistory.length - 1) e.currentTarget.style.backgroundColor = '#444';
              }}
            >
              ↷ 重做
            </button>
          </div>

          {/* 滤镜控制 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={getButtonStyle(showFilters)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showFilters ? '#0088dd' : '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showFilters ? '#007acc' : '#444'}
            >
              🎨 滤镜
            </button>
            <button
              onClick={handleResetFilters}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              🔄 重置滤镜
            </button>
          </div>

          {/* 功能按钮 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isFullscreen ? '8px' : '4px',
            flexShrink: 0
          }}>
            <button
              onClick={handleCopyImage}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              📋 复制
            </button>
            <button
              onClick={handleDownloadImage}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              💾 下载
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
              onClick={handleToggleFullscreen}
              style={getButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              {isFullscreen ? '⤓ 退出全屏' : '⤢ 全屏'}
            </button>
            <button
              onClick={handleClose}
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

          {/* 文件名 */}
          <span style={{ 
            fontSize: isFullscreen ? '14px' : '11px', 
            color: '#ccc', 
            marginLeft: isFullscreen ? '16px' : '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: isFullscreen ? '200px' : '120px',
            flexShrink: 0
          }}>
            {ctx.filePath.split('/').pop() || 'image'}
          </span>
        </div>
      )}

      {/* 滤镜面板 */}
      {showFilters && (
        <div style={{
          position: 'absolute',
          top: showToolbar ? (isFullscreen ? '80px' : '60px') : '10px',
          left: '10px',
          backgroundColor: isFullscreen ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          padding: isFullscreen ? '16px' : '12px',
          borderRadius: '8px',
          fontSize: isFullscreen ? '16px' : '14px',
          zIndex: 10,
          minWidth: isFullscreen ? '300px' : '250px',
          backdropFilter: isFullscreen ? 'blur(10px)' : 'none',
          boxShadow: isFullscreen ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.3)',
          border: isFullscreen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}>
          <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>滤镜设置</div>
          
          {/* 亮度 */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: isFullscreen ? '14px' : '12px' }}>
              亮度: {brightness}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => {
                setBrightness(Number(e.target.value));
                saveToHistory();
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* 对比度 */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: isFullscreen ? '14px' : '12px' }}>
              对比度: {contrast}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => {
                setContrast(Number(e.target.value));
                saveToHistory();
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* 饱和度 */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: isFullscreen ? '14px' : '12px' }}>
              饱和度: {saturation}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => {
                setSaturation(Number(e.target.value));
                saveToHistory();
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* 色相 */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: isFullscreen ? '14px' : '12px' }}>
              色相: {hue}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={hue}
              onChange={(e) => {
                setHue(Number(e.target.value));
                saveToHistory();
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* 模糊 */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: isFullscreen ? '14px' : '12px' }}>
              模糊: {blur}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={blur}
              onChange={(e) => {
                setBlur(Number(e.target.value));
                saveToHistory();
              }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {/* 图片信息面板 */}
      {showInfo && imageInfo && (
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
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>图片信息</div>
          <div>尺寸: {imageInfo.width} × {imageInfo.height}</div>
          <div>文件大小: {imageInfo.size}</div>
          <div>缩放: {Math.round(zoom * 100)}%</div>
          {rotation !== 0 && <div>旋转: {rotation}°</div>}
          {(flipHorizontal || flipVertical) && (
            <div>翻转: {flipHorizontal ? '水平' : ''} {flipVertical ? '垂直' : ''}</div>
          )}
        </div>
      )}

      {/* 快捷键提示 */}
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
            <span>Ctrl+0(重置)</span>
            <span>Ctrl+±(缩放)</span>
            <span>Ctrl+R(旋转)</span>
            <span>Ctrl+H/V(翻转)</span>
            <span>Ctrl+F(全屏)</span>
            <span>Ctrl+I(信息)</span>
            <span>Ctrl+Z/Y(撤销/重做)</span>
            <span>Space(工具栏)</span>
            <span>Esc(关闭)</span>
          </div>
        </div>
      )}

      {/* 图片容器 */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          marginTop: showToolbar ? (isFullscreen ? '80px' : '60px') : '0',
          paddingBottom: isFullscreen ? '60px' : '0'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {imageError ? (
          <div style={{
            textAlign: 'center',
            color: '#ff6b6b',
            fontSize: '16px'
          }}>
            <div style={{ marginBottom: '16px', fontSize: '48px' }}>❌</div>
            <div>无法加载图片</div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
              请检查文件格式是否支持
            </div>
          </div>
        ) : (
          <img
            ref={imageRef}
            src={ctx.urls.downloadUrl}
            alt={ctx.filePath.split('/').pop() || 'image'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: getTransform(),
              filter: getFilter(),
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
        )}
        
        {!imageLoaded && !imageError && (
          <div style={{
            textAlign: 'center',
            color: '#ccc',
            fontSize: '16px'
          }}>
            <div style={{ marginBottom: '16px', fontSize: '48px' }}>⏳</div>
            <div>加载中...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;