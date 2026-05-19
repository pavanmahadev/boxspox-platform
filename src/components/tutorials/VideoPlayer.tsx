"use client";

import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // A basic implementation. For production, consider using a robust 
  // video library like video.js, plyr, or next-video if hosting MP4s,
  // or a responsive iframe if the URL is from YouTube/Vimeo.

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

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

  // Fallback native HTML5 Video for direct MP4 links
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-[var(--border-primary)] bg-black group">
      <video
        src={url}
        className="w-full h-full object-contain"
        controls
        controlsList="nodownload"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 group-hover:bg-black/10 transition-all">
          <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)] flex items-center justify-center shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.5)]">
            <Play size={32} color="white" className="ml-2" />
          </div>
        </div>
      )}
    </div>
  );
}
