import React, { useState, useEffect, useRef } from 'react';
import { PluginMountCtx } from '../foxel.d';

interface AppProps {
  ctx: PluginMountCtx;
}

const App: React.FC<AppProps> = ({ ctx }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mediaType, setMediaType] = useState<'audio' | 'video' | null>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlist, setPlaylist] = useState<Array<{id: string, name: string, url: string, type: 'audio' | 'video'}>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // 检测文件类型
  const getFileType = (filename: string): 'audio' | 'video' | null => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'];
    const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'];
    
    if (audioExts.includes(ext)) return 'audio';
    if (videoExts.includes(ext)) return 'video';
    return null;
  };

  // 初始化媒体文件
  useEffect(() => {
    console.log('媒体播放器初始化:', {
      filePath: ctx?.filePath,
      downloadUrl: ctx?.urls?.downloadUrl,
      entry: ctx?.entry
    });
    
    if (ctx && ctx.filePath && ctx.urls.downloadUrl) {
      const fileName = ctx.filePath.split('/').pop() || '';
      const fileType = getFileType(fileName);
      
      console.log('文件信息:', {
        fileName,
        fileType,
        downloadUrl: ctx.urls.downloadUrl
      });
      
      if (fileType) {
        setMediaType(fileType);
        setPlaylist([{
          id: 'current',
          name: fileName,
          url: ctx.urls.downloadUrl,
          type: fileType
        }]);
        setCurrentIndex(0);
        
        // 测试 URL 可访问性
        testUrl(ctx.urls.downloadUrl).then(isAccessible => {
          if (!isAccessible) {
            setError('无法访问媒体文件，请检查网络连接或文件权限');
          }
          setIsLoading(false);
        });
      } else {
        setError('不支持的文件格式');
        setIsLoading(false);
      }
    } else {
      setError('无法加载媒体文件');
      setIsLoading(false);
    }
  }, [ctx]);

  // 当前媒体文件
  const currentFile = playlist[currentIndex];

  // 测试 URL 是否可访问
  const testUrl = async (url: string) => {
    try {
      console.log('测试 URL 可访问性:', url);
      const response = await fetch(url, { method: 'HEAD' });
      console.log('URL 测试结果:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      return response.ok;
    } catch (error) {
      console.error('URL 测试失败:', error);
      return false;
    }
  };

  // 播放/暂停
  const togglePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play().catch(err => {
          console.error('播放失败:', err);
          setError('播放失败，请检查文件格式');
        });
      }
    }
  };

  // 停止播放
  const stopPlayback = () => {
    if (mediaRef.current) {
      mediaRef.current.pause();
      mediaRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // 上一首/下一首
  const playPrevious = () => {
    if (playlist.length > 1) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
      setCurrentIndex(newIndex);
    }
  };

  const playNext = () => {
    if (playlist.length > 1) {
      const newIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
    }
  };

  // 设置音量
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
  };

  // 静音切换
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (mediaRef.current) {
      mediaRef.current.muted = newMuted;
    }
  };

  // 设置播放速度
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (mediaRef.current) {
      mediaRef.current.playbackRate = rate;
    }
  };

  // 跳转到指定时间
  const seekTo = (time: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 关闭插件
  const handleClose = () => {
    ctx.host.close();
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 显示/隐藏控制栏
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // 事件处理
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setError('');
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    playNext();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement, Event>) => {
    const target = e.target as HTMLVideoElement | HTMLAudioElement;
    const error = target.error;
    let errorMessage = '媒体文件加载失败';
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = '媒体加载被中止';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = '网络错误，无法加载媒体文件';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = '媒体文件解码失败';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = '不支持的媒体格式或文件损坏';
          break;
        default:
          errorMessage = `媒体加载失败 (错误代码: ${error.code})`;
      }
    }
    
    console.error('媒体播放器错误:', error, 'URL:', currentFile?.url);
    setError(errorMessage);
    setIsLoading(false);
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(0, currentTime - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(Math.min(duration, currentTime + 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyN':
          e.preventDefault();
          playNext();
          break;
        case 'KeyP':
          e.preventDefault();
          playPrevious();
          break;
        case 'KeyS':
          e.preventDefault();
          stopPlayback();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            handleClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, volume, isFullscreen]);

  // 全屏变化监听
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div id="foxel-media-player-plus" style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
          <div>加载媒体文件中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="foxel-media-player-plus" style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#ff6b6b',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <div>{error}</div>
          <button
            onClick={handleClose}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="foxel-media-player-plus"
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
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      {/* 媒体元素 */}
      {currentFile && (
        <>
          {mediaType === 'video' ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={currentFile.url}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000'
              }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onError={handleError}
              onVolumeChange={() => setVolume(mediaRef.current?.volume || 0)}
              onRateChange={() => setPlaybackRate(mediaRef.current?.playbackRate || 1)}
              controls={false}
              preload="metadata"
            />
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #bb86fc20, #03dac620)',
              padding: '40px'
            }}>
              {/* 音频封面占位符 */}
              <div style={{
                width: '200px',
                height: '200px',
                backgroundColor: '#2a2a2a',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                marginBottom: '20px',
                boxShadow: '0 8px 32px rgba(187, 134, 252, 0.3)'
              }}>
                🎵
              </div>

              {/* 歌曲信息 */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{currentFile.name}</h2>
                <p style={{ margin: '0', color: '#b3b3b3', fontSize: '16px' }}>
                  {mediaType === 'audio' ? '音频文件' : '视频文件'}
                </p>
              </div>
            </div>
          )}

          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={mediaType === 'audio' ? currentFile.url : ''}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
            onVolumeChange={() => setVolume(mediaRef.current?.volume || 0)}
            onRateChange={() => setPlaybackRate(mediaRef.current?.playbackRate || 1)}
            style={{ display: 'none' }}
            preload="metadata"
          />
        </>
      )}

      {/* 控制栏 */}
      {showControls && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          transition: 'opacity 0.3s ease'
        }}>
          {/* 进度条 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', minWidth: '40px', color: '#ccc' }}>
              {formatTime(currentTime)}
            </span>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  background: `linear-gradient(to right, #bb86fc 0%, #bb86fc ${(currentTime / (duration || 1)) * 100}%, #333 ${(currentTime / (duration || 1)) * 100}%, #333 100%)`,
                  outline: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              />
            </div>
            <span style={{ fontSize: '12px', minWidth: '40px', color: '#ccc' }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* 控制按钮 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={playPrevious}
                disabled={playlist.length <= 1}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: playlist.length <= 1 ? '#666' : '#fff',
                  cursor: playlist.length <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '20px',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ⏮️
              </button>
              
              <button
                onClick={togglePlayPause}
                style={{
                  padding: '12px',
                  backgroundColor: '#bb86fc',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '24px',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(187, 134, 252, 0.5)'
                }}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <button
                onClick={playNext}
                disabled={playlist.length <= 1}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: playlist.length <= 1 ? '#666' : '#fff',
                  cursor: playlist.length <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '20px',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ⏭️
              </button>
              
              <button
                onClick={stopPlayback}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '20px',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ⏹️
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={toggleMute}
                style={{
                  padding: '6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                style={{
                  width: '80px',
                  height: '4px',
                  background: `linear-gradient(to right, #bb86fc 0%, #bb86fc ${(isMuted ? 0 : volume) * 100}%, #333 ${(isMuted ? 0 : volume) * 100}%, #333 100%)`,
                  outline: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              />
              
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#2a2a2a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
              
              <button
                onClick={toggleFullscreen}
                style={{
                  padding: '6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {isFullscreen ? '⤓' : '⤢'}
              </button>
              
              <button
                onClick={handleClose}
                style={{
                  padding: '6px',
                  backgroundColor: '#d32f2f',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  borderRadius: '4px'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 播放列表 */}
      {showPlaylist && playlist.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '300px',
          maxHeight: '400px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          padding: '16px',
          overflow: 'auto',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>播放列表</h3>
            <button
              onClick={() => setShowPlaylist(false)}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
          
          {playlist.map((file, index) => (
            <div
              key={file.id}
              style={{
                padding: '8px',
                backgroundColor: index === currentIndex ? 'rgba(187, 134, 252, 0.3)' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={() => setCurrentIndex(index)}
            >
              <span style={{ fontSize: '16px' }}>
                {file.type === 'audio' ? '🎵' : '🎬'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: index === currentIndex ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {file.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#ccc',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {file.type === 'audio' ? '音频文件' : '视频文件'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 播放列表按钮 */}
      {playlist.length > 0 && (
        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            borderRadius: '4px',
            fontSize: '14px',
            zIndex: 10
          }}
        >
          📋 播放列表 ({playlist.length})
        </button>
      )}

      {/* 快捷键提示 */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#ccc',
        zIndex: 10,
        maxWidth: '300px',
        lineHeight: '1.4'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>快捷键:</div>
        <div>Space(播放/暂停) ←→(快退/快进) ↑↓(音量) M(静音)</div>
        <div>N(下一首) P(上一首) S(停止) F(全屏) Esc(关闭)</div>
      </div>
    </div>
  );
};

export default App;