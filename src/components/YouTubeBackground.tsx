"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubeBackgroundProps {
  videoId: string;
  playlistId?: string;
}

export default function YouTubeBackground({ videoId, playlistId }: YouTubeBackgroundProps) {
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
          playlist: playlistId ?? videoId,
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
      <style>{`
        #yt-bg-player {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none;
        }
        #yt-bg-player iframe {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          /* 16:9 cover trick: always fill viewport, crop excess */
          width: 100vw;
          height: 56.25vw;   /* 100vw × 9/16 */
          min-height: 100vh;
          min-width: 177.78vh; /* 100vh × 16/9 */
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
