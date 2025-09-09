import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [ctx.filePath]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
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
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleClose = () => {
    ctx.host.close();
  };

  return (
    <div id="foxel-image-viewer" style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* 工具栏 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#2a2a2a'
      }}>
        <button
          onClick={handleZoomOut}
          style={{
            padding: '8px 12px',
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
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
            fontSize: '14px'
          }}
        >
          +
        </button>
        <button
          onClick={handleResetZoom}
          style={{
            padding: '8px 12px',
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
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
            fontSize: '14px'
          }}
        >
          适应屏幕
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '14px', color: '#ccc' }}>
          {ctx.entry.name}
        </span>
        <button
          onClick={handleClose}
          style={{
            padding: '8px 12px',
            backgroundColor: '#d32f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          关闭
        </button>
      </div>

      {/* 图片容器 */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab'
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
            <div style={{ marginBottom: '16px' }}>❌</div>
            <div>无法加载图片</div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
              请检查文件格式是否支持
            </div>
          </div>
        ) : (
          <img
            src={ctx.urls.downloadUrl}
            alt={ctx.entry.name}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
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
            <div style={{ marginBottom: '16px' }}>⏳</div>
            <div>加载中...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
