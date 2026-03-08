"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubeBackgroundProps {
  videoId: string;
}

export default function YouTubeBackground({ videoId }: YouTubeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const onReady = () => {
      if (!containerRef.current) return;
      
      // 动态创建 Player 容器，确保宽高 100%
      const playerDiv = document.createElement("div");
      playerDiv.id = "yt-bg-player";
      playerDiv.style.width = "100%";
      playerDiv.style.height = "100%";
      containerRef.current.appendChild(playerDiv);

      const YT = (window as any).YT;
      new YT.Player("yt-bg-player", {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          playsinline: 1, // 关键：移动端内联播放
          playlist: videoId,
        },
        events: {
          onReady: (e: any) => {
            e.target.playVideo();
            setIsReady(true);
          },
        },
      });
    };

    if ((window as any).YT) onReady();
    else (window as any).onYouTubeIframeAPIReady = onReady;
  }, [videoId]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isReady ? 1 : 0, transition: "opacity 1s" }}
      />
      <div className="absolute inset-0 bg-black/50" />
      <style>{`
        #yt-bg-player {
          width: 100vw !important;
          height: 100vh !important;
        }
        #yt-bg-player iframe {
          width: 100vw !important;
          height: 100vh !important;
          object-fit: cover !important;
        }
      `}</style>
    </div>
  );
}
