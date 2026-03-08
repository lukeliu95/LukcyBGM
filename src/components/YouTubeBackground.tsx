"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface YouTubeBackgroundProps {
  videoId: string;
  playlistId?: string;
}

export default function YouTubeBackground({ videoId }: YouTubeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
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
      new YT.Player("yt-bg-player", {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          controls: 0,
          modestbranding: 1,
          playsinline: 1,
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

    if ((window as unknown as Record<string, unknown>).YT) onReady();
    else (window as unknown as any).onYouTubeIframeAPIReady = onReady;
  }, [videoId]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isReady ? 1 : 0, transition: "opacity 1s" }}
      />
      <div className="absolute inset-0 bg-black/50" />
      <style>{`
        #yt-bg-player {
          width: 100vw;
          height: 100vh;
        }
        #yt-bg-player iframe {
          width: 100vw;
          height: 100vh;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
