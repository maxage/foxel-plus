import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PluginMountCtx } from '../foxel.d';

// 媒体文件类型定义
interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'audio' | 'video';
  size: number;
  duration?: number;
  thumbnail?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  lyrics?: string;
  subtitles?: Array<{
    language: string;
    url: string;
    format: 'srt' | 'vtt' | 'ass' | 'ssa';
  }>;
}

// 播放列表类型定义
interface Playlist {
  id: string;
  name: string;
  files: MediaFile[];
  currentIndex: number;
}

// 播放状态类型定义
interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

// 主题类型定义
interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
}

const themes: Theme[] = [
  {
    name: 'Dark',
    primary: '#bb86fc',
    secondary: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    accent: '#ff6b6b',
    error: '#cf6679',
    success: '#4caf50',
    warning: '#ff9800'
  },
  {
    name: 'Light',
    primary: '#6200ea',
    secondary: '#018786',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#000000',
    textSecondary: '#666666',
    accent: '#e91e63',
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800'
  },
  {
    name: 'Ocean',
    primary: '#2196f3',
    secondary: '#00bcd4',
    background: '#0d1117',
    surface: '#161b22',
    text: '#f0f6fc',
    textSecondary: '#8b949e',
    accent: '#ff6b6b',
    error: '#f85149',
    success: '#3fb950',
    warning: '#d29922'
  }
];

const App: React.FC<{ ctx: PluginMountCtx }> = ({ ctx }) => {
  // 状态管理
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentFile, setCurrentFile] = useState<MediaFile | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    playbackRate: 1,
    isShuffled: false,
    repeatMode: 'none'
  });
  const [showPlaylist, setShowPlaylist] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [showVisualizer, setShowVisualizer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  // 音频可视化相关
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // 检测文件类型
  const getFileType = (filename: string): 'audio' | 'video' | 'unknown' => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'];
    const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'];
    
    if (audioExts.includes(ext)) return 'audio';
    if (videoExts.includes(ext)) return 'video';
    return 'unknown';
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

  // 创建新的播放列表
  const createPlaylist = (name: string): Playlist => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      files: [],
      currentIndex: 0
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  // 添加文件到播放列表
  const addFileToPlaylist = (playlistId: string, file: MediaFile) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, files: [...playlist.files, file] }
        : playlist
    ));
  };

  // 从播放列表移除文件
  const removeFileFromPlaylist = (playlistId: string, fileId: string) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId 
        ? { 
            ...playlist, 
            files: playlist.files.filter(f => f.id !== fileId),
            currentIndex: playlist.currentIndex >= playlist.files.length - 1 
              ? Math.max(0, playlist.currentIndex - 1) 
              : playlist.currentIndex
          }
        : playlist
    ));
  };

  // 播放文件
  const playFile = (file: MediaFile) => {
    setCurrentFile(file);
    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
  };

  // 暂停/播放切换
  const togglePlayPause = () => {
    const mediaElement = currentFile?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      if (playbackState.isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
    }
  };

  // 停止播放
  const stopPlayback = () => {
    const mediaElement = currentFile?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.pause();
      mediaElement.currentTime = 0;
    }
    setPlaybackState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
  };

  // 上一首/下一首
  const playPrevious = () => {
    if (currentPlaylist && currentPlaylist.files.length > 0) {
      const newIndex = currentPlaylist.currentIndex > 0 
        ? currentPlaylist.currentIndex - 1 
        : currentPlaylist.files.length - 1;
      setCurrentPlaylist(prev => prev ? { ...prev, currentIndex: newIndex } : null);
      playFile(currentPlaylist.files[newIndex]);
    }
  };

  const playNext = () => {
    if (currentPlaylist && currentPlaylist.files.length > 0) {
      const newIndex = currentPlaylist.currentIndex < currentPlaylist.files.length - 1 
        ? currentPlaylist.currentIndex + 1 
        : 0;
      setCurrentPlaylist(prev => prev ? { ...prev, currentIndex: newIndex } : null);
      playFile(currentPlaylist.files[newIndex]);
    }
  };

  // 设置音量
  const setVolume = (volume: number) => {
    const mediaElement = currentFile?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.volume = volume;
      setPlaybackState(prev => ({ ...prev, volume }));
    }
  };

  // 静音切换
  const toggleMute = () => {
    const mediaElement = currentFile?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.muted = !playbackState.isMuted;
      setPlaybackState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  };

  // 设置播放速度
  const setPlaybackRate = (rate: number) => {
    const mediaElement = currentFile?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.playbackRate = rate;
      setPlaybackState(prev => ({ ...prev, playbackRate: rate }));
    }
  };

  // 跳转到指定时间
  const seekTo = (time: number) => {
    const mediaElement = currentFile?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.currentTime = time;
      setPlaybackState(prev => ({ ...prev, currentTime: time }));
    }
  };

  // 文件上传处理
  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const newFiles: MediaFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = getFileType(file.name);
        
        if (fileType === 'unknown') {
          console.warn(`Unsupported file type: ${file.name}`);
          continue;
        }

        const mediaFile: MediaFile = {
          id: Date.now().toString() + i,
          name: file.name,
          url: URL.createObjectURL(file),
          type: fileType,
          size: file.size
        };

        newFiles.push(mediaFile);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // 添加到默认播放列表或创建新播放列表
      if (playlists.length === 0) {
        const defaultPlaylist = createPlaylist('默认播放列表');
        newFiles.forEach(file => addFileToPlaylist(defaultPlaylist.id, file));
        setCurrentPlaylist({ ...defaultPlaylist, files: newFiles });
      } else {
        const targetPlaylist = currentPlaylist || playlists[0];
        newFiles.forEach(file => addFileToPlaylist(targetPlaylist.id, file));
      }

      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件上传失败');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 音频可视化
  const initAudioVisualizer = () => {
    if (!audioRef.current || !canvasRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      
      drawVisualizer();
    } catch (err) {
      console.error('Failed to initialize audio visualizer:', err);
    }
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      ctx.fillStyle = currentTheme.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = (dataArrayRef.current[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, currentTheme.primary);
        gradient.addColorStop(1, currentTheme.accent);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  // 事件处理
  const handleTimeUpdate = () => {
    const mediaElement = currentFile?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      setPlaybackState(prev => ({ ...prev, currentTime: mediaElement.currentTime }));
    }
  };

  const handleLoadedMetadata = () => {
    const mediaElement = currentFile?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      setPlaybackState(prev => ({ ...prev, duration: mediaElement.duration }));
    }
  };

  const handleEnded = () => {
    if (playbackState.repeatMode === 'one') {
      const mediaElement = currentFile?.type === 'video' ? videoRef.current : audioRef.current;
      if (mediaElement) {
        mediaElement.currentTime = 0;
        mediaElement.play();
      }
    } else {
      playNext();
    }
  };

  const handlePlay = () => {
    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    if (currentFile?.type === 'audio' && showVisualizer) {
      initAudioVisualizer();
    }
  };

  const handlePause = () => {
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // 初始化
  useEffect(() => {
    setLoading(false);
    
    // 创建默认播放列表
    if (playlists.length === 0) {
      createPlaylist('默认播放列表');
    }
  }, []);

  // 清理资源
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

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
          seekTo(Math.max(0, playbackState.currentTime - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(Math.min(playbackState.duration, playbackState.currentTime + 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, playbackState.volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, playbackState.volume - 0.1));
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
          setIsFullscreen(!isFullscreen);
          break;
        case 'KeyL':
          e.preventDefault();
          setShowLyrics(!showLyrics);
          break;
        case 'KeyV':
          e.preventDefault();
          setShowVisualizer(!showVisualizer);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [playbackState, isFullscreen, showLyrics, showVisualizer]);

  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
          <div>加载媒体播放器中...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      backgroundColor: currentTheme.background,
      color: currentTheme.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* 侧边栏 - 播放列表 */}
      {showPlaylist && (
        <div style={{
          width: '300px',
          height: '100%',
          backgroundColor: currentTheme.surface,
          borderRight: `1px solid ${currentTheme.textSecondary}20`,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 播放列表头部 */}
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${currentTheme.textSecondary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>播放列表</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '6px 12px',
                  backgroundColor: currentTheme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📁 添加文件
              </button>
              <button
                onClick={() => createPlaylist(`播放列表 ${playlists.length + 1}`)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: currentTheme.secondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ➕ 新建
              </button>
            </div>
          </div>

          {/* 播放列表内容 */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            {playlists.map(playlist => (
              <div key={playlist.id} style={{ marginBottom: '16px' }}>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: currentPlaylist?.id === playlist.id ? currentTheme.primary + '20' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '8px'
                }}
                onClick={() => setCurrentPlaylist(playlist)}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{playlist.name}</div>
                  <div style={{ fontSize: '12px', color: currentTheme.textSecondary }}>
                    {playlist.files.length} 个文件
                  </div>
                </div>
                
                {currentPlaylist?.id === playlist.id && (
                  <div style={{ paddingLeft: '8px' }}>
                    {playlist.files.map((file, index) => (
                      <div
                        key={file.id}
                        style={{
                          padding: '8px',
                          backgroundColor: currentFile?.id === file.id ? currentTheme.primary + '30' : 'transparent',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onClick={() => playFile(file)}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: currentFile?.id === file.id ? 'bold' : 'normal',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {file.name}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: currentTheme.textSecondary,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {file.type === 'audio' ? '🎵' : '🎬'} {formatFileSize(file.size)}
                            {file.duration && ` • ${formatTime(file.duration)}`}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFileFromPlaylist(playlist.id, file.id);
                          }}
                          style={{
                            padding: '4px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: currentTheme.error,
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 主播放区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶部工具栏 */}
        <div style={{
          height: '60px',
          backgroundColor: currentTheme.surface,
          borderBottom: `1px solid ${currentTheme.textSecondary}20`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '16px'
        }}>
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: currentTheme.text,
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            {showPlaylist ? '◀️' : '▶️'} 播放列表
          </button>
          
          <div style={{ flex: 1 }} />
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: currentTheme.text,
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            ⚙️ 设置
          </button>
          
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            style={{
              padding: '8px',
              backgroundColor: showLyrics ? currentTheme.primary + '30' : 'transparent',
              border: 'none',
              color: currentTheme.text,
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            📝 歌词
          </button>
          
          <button
            onClick={() => setShowVisualizer(!showVisualizer)}
            style={{
              padding: '8px',
              backgroundColor: showVisualizer ? currentTheme.primary + '30' : 'transparent',
              border: 'none',
              color: currentTheme.text,
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            🌊 可视化
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: currentTheme.text,
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            {isFullscreen ? '⤓' : '⤢'} 全屏
          </button>
        </div>

        {/* 媒体播放区域 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {currentFile ? (
            <>
              {/* 视频播放器 */}
              {currentFile.type === 'video' && (
                <video
                  ref={videoRef}
                  src={currentFile.url}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#000'
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  controls={false}
                />
              )}

              {/* 音频播放器 */}
              {currentFile.type === 'audio' && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px',
                  background: `linear-gradient(135deg, ${currentTheme.primary}20, ${currentTheme.accent}20)`
                }}>
                  {/* 音频可视化 */}
                  {showVisualizer && (
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      style={{
                        backgroundColor: currentTheme.surface,
                        borderRadius: '8px',
                        marginBottom: '20px',
                        boxShadow: `0 4px 20px ${currentTheme.primary}30`
                      }}
                    />
                  )}

                  {/* 专辑封面占位符 */}
                  <div style={{
                    width: '200px',
                    height: '200px',
                    backgroundColor: currentTheme.surface,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    marginBottom: '20px',
                    boxShadow: `0 8px 32px ${currentTheme.primary}30`
                  }}>
                    🎵
                  </div>

                  {/* 歌曲信息 */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{currentFile.name}</h2>
                    {currentFile.artist && (
                      <p style={{ margin: '0', color: currentTheme.textSecondary, fontSize: '16px' }}>
                        {currentFile.artist}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 播放控制栏 */}
              <div style={{
                height: '120px',
                backgroundColor: currentTheme.surface,
                borderTop: `1px solid ${currentTheme.textSecondary}20`,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* 进度条 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', minWidth: '40px' }}>
                    {formatTime(playbackState.currentTime)}
                  </span>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="range"
                      min="0"
                      max={playbackState.duration || 0}
                      value={playbackState.currentTime}
                      onChange={(e) => seekTo(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: '6px',
                        background: `linear-gradient(to right, ${currentTheme.primary} 0%, ${currentTheme.primary} ${(playbackState.currentTime / (playbackState.duration || 1)) * 100}%, ${currentTheme.textSecondary}30 ${(playbackState.currentTime / (playbackState.duration || 1)) * 100}%, ${currentTheme.textSecondary}30 100%)`,
                        outline: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', minWidth: '40px' }}>
                    {formatTime(playbackState.duration)}
                  </span>
                </div>

                {/* 控制按钮 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <button
                    onClick={playPrevious}
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: currentTheme.text,
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
                    ⏮️
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    style={{
                      padding: '12px',
                      backgroundColor: currentTheme.primary,
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
                      boxShadow: `0 4px 16px ${currentTheme.primary}50`
                    }}
                  >
                    {playbackState.isPlaying ? '⏸️' : '▶️'}
                  </button>
                  
                  <button
                    onClick={playNext}
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: currentTheme.text,
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
                    ⏭️
                  </button>
                  
                  <button
                    onClick={stopPlayback}
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: currentTheme.text,
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

                {/* 音量和其他控制 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={toggleMute}
                      style={{
                        padding: '6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: currentTheme.text,
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      {playbackState.isMuted ? '🔇' : '🔊'}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={playbackState.volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      style={{
                        width: '80px',
                        height: '4px',
                        background: `linear-gradient(to right, ${currentTheme.primary} 0%, ${currentTheme.primary} ${playbackState.volume * 100}%, ${currentTheme.textSecondary}30 ${playbackState.volume * 100}%, ${currentTheme.textSecondary}30 100%)`,
                        outline: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={playbackState.playbackRate}
                      onChange={(e) => setPlaybackRate(Number(e.target.value))}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: currentTheme.surface,
                        color: currentTheme.text,
                        border: `1px solid ${currentTheme.textSecondary}30`,
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
                      onClick={() => setPlaybackState(prev => ({ 
                        ...prev, 
                        repeatMode: prev.repeatMode === 'none' ? 'all' : prev.repeatMode === 'all' ? 'one' : 'none' 
                      }))}
                      style={{
                        padding: '6px',
                        backgroundColor: playbackState.repeatMode !== 'none' ? currentTheme.primary + '30' : 'transparent',
                        border: 'none',
                        color: currentTheme.text,
                        cursor: 'pointer',
                        fontSize: '16px',
                        borderRadius: '4px'
                      }}
                    >
                      {playbackState.repeatMode === 'none' ? '🔁' : playbackState.repeatMode === 'all' ? '🔁' : '🔂'}
                    </button>
                    
                    <button
                      onClick={() => setPlaybackState(prev => ({ ...prev, isShuffled: !prev.isShuffled }))}
                      style={{
                        padding: '6px',
                        backgroundColor: playbackState.isShuffled ? currentTheme.primary + '30' : 'transparent',
                        border: 'none',
                        color: currentTheme.text,
                        cursor: 'pointer',
                        fontSize: '16px',
                        borderRadius: '4px'
                      }}
                    >
                      🔀
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* 空状态 */
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentTheme.textSecondary,
              padding: '40px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎵</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>欢迎使用媒体播放器</h3>
              <p style={{ margin: '0 0 24px 0', textAlign: 'center' }}>
                添加音频或视频文件开始播放
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: currentTheme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                📁 选择文件
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,video/*"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        style={{ display: 'none' }}
      />

      {/* 音频元素 */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
      />

      {/* 设置面板 */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '16px',
          width: '300px',
          backgroundColor: currentTheme.surface,
          border: `1px solid ${currentTheme.textSecondary}30`,
          borderRadius: '8px',
          padding: '16px',
          boxShadow: `0 8px 32px ${currentTheme.primary}20`,
          zIndex: 1000
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>设置</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>主题</label>
            <select
              value={currentTheme.name}
              onChange={(e) => {
                const theme = themes.find(t => t.name === e.target.value);
                if (theme) setCurrentTheme(theme);
              }}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                border: `1px solid ${currentTheme.textSecondary}30`,
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {themes.map(theme => (
                <option key={theme.name} value={theme.name}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              默认音量: {Math.round(playbackState.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={playbackState.volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                background: `linear-gradient(to right, ${currentTheme.primary} 0%, ${currentTheme.primary} ${playbackState.volume * 100}%, ${currentTheme.textSecondary}30 ${playbackState.volume * 100}%, ${currentTheme.textSecondary}30 100%)`,
                outline: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            />
          </div>

          <button
            onClick={() => setShowSettings(false)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: currentTheme.textSecondary,
              color: currentTheme.background,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            关闭
          </button>
        </div>
      )}

      {/* 歌词面板 */}
      {showLyrics && currentFile && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: showPlaylist ? '316px' : '16px',
          right: '16px',
          bottom: '140px',
          backgroundColor: currentTheme.surface,
          border: `1px solid ${currentTheme.textSecondary}30`,
          borderRadius: '8px',
          padding: '16px',
          boxShadow: `0 8px 32px ${currentTheme.primary}20`,
          zIndex: 1000,
          overflow: 'auto'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>歌词</h3>
          {currentFile.lyrics ? (
            <div style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              fontSize: '14px',
              color: currentTheme.text
            }}>
              {currentFile.lyrics}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: currentTheme.textSecondary,
              padding: '40px 0'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>暂无歌词</p>
            </div>
          )}
        </div>
      )}

      {/* 上传进度 */}
      {isUploading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: currentTheme.surface,
          border: `1px solid ${currentTheme.textSecondary}30`,
          borderRadius: '8px',
          padding: '24px',
          boxShadow: `0 8px 32px ${currentTheme.primary}20`,
          zIndex: 2000,
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>📤</div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>上传文件中...</h3>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: currentTheme.textSecondary + '30',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              backgroundColor: currentTheme.primary,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ fontSize: '14px', color: currentTheme.textSecondary }}>
            {Math.round(uploadProgress)}%
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: currentTheme.error,
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 2000,
          boxShadow: `0 4px 16px ${currentTheme.error}50`
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default App;
