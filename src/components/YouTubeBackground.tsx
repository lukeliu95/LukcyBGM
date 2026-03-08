"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface YouTubeBackgroundProps {
  videoId: string;
  playlistId?: string;
}

const MOODS = [
  { id: "calm", label: "静谧", videoId: "hjKO0d_umLc", color: "bg-black/50" },
  { id: "energetic", label: "活力", videoId: "jfKfPfyJRdk", color: "bg-blue-900/30" },
  { id: "nature", label: "自然", videoId: "vHdxBa0brlA", color: "bg-emerald-900/30" },
];

export default function YouTubeBackground({
  videoId: defaultId,
  playlistId,
}: YouTubeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMood, setCurrentMood] = useState(MOODS[0]);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // 动态更新 player
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(currentMood.videoId);
      return;
    }

    if (!(window as unknown as Record<string, unknown>).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const onReady = () => {
      if (!containerRef.current) return;
      const playerDiv = document.createElement("div");
      playerDiv.id = "yt-bg-player";
      containerRef.current.appendChild(playerDiv);

      const YT = (window as unknown as Record<string, unknown>).YT as any;
      playerRef.current = new YT.Player("yt-bg-player", {
        videoId: currentMood.videoId,
        playerVars: { autoplay: 1, mute: 1, loop: 1, controls: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (e: any) => { e.target.playVideo(); setIsReady(true); },
        },
      });
    };

    if ((window as unknown as Record<string, unknown>).YT) onReady();
    else (window as unknown as any).onYouTubeIframeAPIReady = onReady;
  }, [currentMood]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div ref={containerRef} style={{ opacity: isReady ? 1 : 0, transition: "opacity 1s" }} />
      <div className={clsx("absolute inset-0 transition-colors duration-1000", currentMood.color)} />
      
      {/* 氛围控制面板 */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto flex gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => setCurrentMood(mood)}
            className={clsx(
              "px-3 py-1 rounded-full text-[10px] tracking-wider transition-all border",
              currentMood.id === mood.id ? "bg-white/20 border-white/40 text-white" : "bg-black/20 border-white/10 text-white/50 hover:bg-white/10"
            )}
          >
            {mood.label}
          </button>
        ))}
      </div>
    </div>
  );
}
