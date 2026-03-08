"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubeBackgroundProps {
  videoId: string;
  onError?: () => void;
}

export default function YouTubeBackground({ videoId, onError }: YouTubeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled || !containerRef.current) return;
      // 清理旧 player
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
      // 清理旧 div
      const old = containerRef.current.querySelector("#yt-bg-player");
      if (old) old.remove();

      const playerDiv = document.createElement("div");
      playerDiv.id = "yt-bg-player";
      playerDiv.style.width = "100%";
      playerDiv.style.height = "100%";
      containerRef.current.appendChild(playerDiv);

      playerRef.current = new (window as any).YT.Player("yt-bg-player", {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          playsinline: 1,
          playlist: videoId,
        },
        events: {
          onReady: (e: any) => {
            if (!cancelled) {
              e.target.playVideo();
              setIsReady(true);
            }
          },
          onError: () => {
            if (!cancelled) onError?.();
          },
        },
      });
    };

    const waitForYT = () => {
      // 确保 YT.Player 构造函数完全可用
      if ((window as any).YT?.Player) {
        createPlayer();
      } else {
        // 加载脚本（如果还没加过）
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(tag);
        }
        // 等待 API 就绪
        const prev = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          prev?.();
          createPlayer();
        };
      }
    };

    waitForYT();

    return () => {
      cancelled = true;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
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
          width: 100vw;
          height: 56.25vw;
          min-height: 100vh;
          min-width: 177.78vh;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
