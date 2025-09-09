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
  const [toolbarTimeout, setToolbarTimeout] = useState<NodeJS.Timeout | null>(null);
  
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
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

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
    const timeout = setTimeout(() => {
      setShowToolbar(false);
    }, 2000);
    setToolbarTimeout(timeout);
  };

  const handleClose = () => {
    ctx.host.close();
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
          padding: '12px 16px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#2a2a2a',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          transition: 'opacity 0.3s ease'
        }}>
          {/* 缩放控制 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleZoomOut}
              style={{
                padding: '8px 12px',
                backgroundColor: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              −
            </button>
            <span style={{ fontSize: '14px', minWidth: '60px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              style={{
                padding: '8px 12px',
                backgroundColor: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              +
            </button>
          </div>

          {/* 视图控制 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleResetZoom}
              style={{
                padding: '8px 12px',
                backgroundColor: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              重置
            </button>
            <button
              onClick={handleFitToScreen}
              style={{
                padding: '8px 12px',
                backgroundColor: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              适应屏幕
            </button>
          </div>

          {/* 变换控制 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleRotate}
              style={{
                padding: '8px 12px',
                backgroundColor: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              🔄 旋转
            </button>
            <button
              onClick={handleFlipHorizontal}
              style={{
                padding: '8px 12px',
                backgroundColor: flipHorizontal ? '#007acc' : '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = flipHorizontal ? '#0088dd' : '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = flipHorizontal ? '#007acc' : '#444'}
            >
              ↔️ 水平翻转
            </button>
            <button
              onClick={handleFlipVertical}
              style={{
                padding: '8px 12px',
                backgroundColor: flipVertical ? '#007acc' : '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = flipVertical ? '#0088dd' : '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = flipVertical ? '#007acc' : '#444'}
            >
              ↕️ 垂直翻转
            </button>
          </div>

          <div style={{ flex: 1 }} />

          {/* 功能按钮 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowInfo(!showInfo)}
              style={{
                padding: '8px 12px',
                backgroundColor: showInfo ? '#007acc' : '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showInfo ? '#0088dd' : '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showInfo ? '#007acc' : '#444'}
            >
              ℹ️ 信息
            </button>
            <button
              onClick={handleToggleFullscreen}
              style={{
                padding: '8px 12px',
                backgroundColor: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444'}
            >
              {isFullscreen ? '⤓ 退出全屏' : '⤢ 全屏'}
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: '8px 12px',
                backgroundColor: '#d32f2f',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e53935'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
            >
              ✕ 关闭
            </button>
          </div>

          {/* 文件名 */}
          <span style={{ fontSize: '14px', color: '#ccc', marginLeft: '16px' }}>
            {ctx.entry.name}
          </span>
        </div>
      )}

      {/* 图片信息面板 */}
      {showInfo && imageInfo && (
        <div style={{
          position: 'absolute',
          top: showToolbar ? '60px' : '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 10,
          minWidth: '200px'
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
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#ccc',
          zIndex: 10
        }}>
          <div>快捷键: Ctrl+0(重置) Ctrl+±(缩放) Ctrl+R(旋转) Ctrl+H/V(翻转) Ctrl+F(全屏) Ctrl+I(信息) Space(工具栏) Esc(关闭)</div>
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
          marginTop: showToolbar ? '60px' : '0'
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
            alt={ctx.entry.name}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: getTransform(),
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