"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, MonitorUp, RotateCcw, FastForward } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  onProgress?: (progressPercent: number) => void;
}

export function VideoPlayer({ url, title, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ninetyPercentFiredRef = useRef(false);

  // Check if YouTube
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    
    setCurrentTime(current);
    
    if (total > 0) {
      const percentage = (current / total) * 100;
      setProgress(percentage);
      
      // Fire callback at 90% completion
      if (percentage >= 90 && !ninetyPercentFiredRef.current) {
        ninetyPercentFiredRef.current = true;
        if (onProgress) onProgress(percentage);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const scrubTime = (Number(e.target.value) / 100) * duration;
    videoRef.current.currentTime = scrubTime;
    setProgress(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    if (newMutedState) {
      setVolume(0);
    } else {
      setVolume(1);
      videoRef.current.volume = 1;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP not supported or failed", err);
    }
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSettings(false);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  // Autohide controls logic
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 3000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
      setShowSettings(false);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  if (isYouTube) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;

    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-[var(--border-primary)] bg-black">
        <iframe
          src={embedUrl}
          title={title || "Course Video"}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl border border-[var(--border-primary)] bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={toggleFullscreen}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => { setIsPlaying(true); handleMouseMove(); }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Center Play Button Overlay (when paused) */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40 transition-opacity duration-300"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-[var(--brand-primary)] flex items-center justify-center shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.6)] backdrop-blur-md cursor-pointer pointer-events-auto hover:scale-110 transition-transform">
            <Play size={40} color="white" className="ml-2" />
          </div>
        </div>
      )}

      {/* Custom Controls Container */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-4 px-6 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Progress Bar Scrubber */}
        <div className="relative w-full h-2 group/scrubber cursor-pointer mb-4 flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleScrub}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="absolute left-0 right-0 h-1.5 bg-gray-600 rounded-full overflow-hidden group-hover/scrubber:h-2 transition-all">
            <div 
              className="h-full bg-[var(--brand-primary)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Scrubber Thumb */}
          <div 
            className="absolute h-4 w-4 bg-white rounded-full shadow-md z-0 opacity-0 group-hover/scrubber:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-[var(--brand-primary)] transition-colors focus:outline-none">
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>

            <button onClick={() => skip(-10)} className="hover:text-[var(--brand-primary)] transition-colors hidden sm:block focus:outline-none" title="Rewind 10s">
              <RotateCcw size={20} />
            </button>
            <button onClick={() => skip(10)} className="hover:text-[var(--brand-primary)] transition-colors hidden sm:block focus:outline-none" title="Forward 10s">
              <FastForward size={20} />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="hover:text-[var(--brand-primary)] transition-colors focus:outline-none">
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 cursor-pointer origin-left h-1.5 accent-[var(--brand-primary)]"
              />
            </div>

            {/* Timestamps */}
            <div className="text-xs font-medium tracking-wide font-mono hidden md:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Settings Menu (Playback Rate) */}
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={`hover:text-[var(--brand-primary)] transition-colors focus:outline-none ${showSettings ? 'text-[var(--brand-primary)]' : ''}`}
                title="Settings"
              >
                <Settings size={20} className={showSettings ? "rotate-90 transition-transform" : "transition-transform"} />
              </button>

              {showSettings && (
                <div className="absolute bottom-full right-0 mb-4 bg-gray-900 border border-gray-700 rounded-xl p-2 w-32 shadow-2xl z-50">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2 py-1 mb-1 border-b border-gray-800">Speed</div>
                  {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors flex justify-between items-center ${playbackRate === speed ? 'text-[var(--brand-primary)] font-bold' : 'text-gray-200'}`}
                    >
                      {speed === 1 ? "Normal" : `${speed}x`}
                      {playbackRate === speed && <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={togglePiP} className="hover:text-[var(--brand-primary)] transition-colors hidden sm:block focus:outline-none" title="Picture-in-Picture">
              <MonitorUp size={20} />
            </button>

            <button onClick={toggleFullscreen} className="hover:text-[var(--brand-primary)] transition-colors focus:outline-none" title="Fullscreen">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
