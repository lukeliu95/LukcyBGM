"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubeBackgroundProps {
  videoId: string;
  playlistId?: string;
}

export default function YouTubeBackground({
  videoId,
  playlistId,
}: YouTubeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API
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

      const YT = (window as unknown as Record<string, unknown>).YT as {
        Player: new (
          el: string,
          config: Record<string, unknown>
        ) => Record<string, unknown>;
      };

      new YT.Player("yt-bg-player", {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          loop: 1,
          playlist: playlistId
            ? undefined
            : videoId,
          list: playlistId || undefined,
          listType: playlistId ? "playlist" : undefined,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: (event: { target: { playVideo: () => void } }) => {
            event.target.playVideo();
            setIsReady(true);
          },
          onStateChange: (event: { data: number; target: { playVideo: () => void } }) => {
            // If video ends and no playlist, restart
            if (event.data === 0 && !playlistId) {
              event.target.playVideo();
            }
          },
        },
      });
    };

    // Check if API is already loaded
    if ((window as unknown as Record<string, unknown>).YT && (window as unknown as { YT: { Player: unknown } }).YT.Player) {
      onReady();
    } else {
      (window as unknown as Record<string, () => void>).onYouTubeIframeAPIReady = onReady;
    }

    return () => {
      (window as unknown as Record<string, undefined>).onYouTubeIframeAPIReady = undefined;
    };
  }, [videoId, playlistId]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{
        opacity: isReady ? 1 : 0,
        transition: "opacity 1.5s ease-in",
      }}
    >
      <style>{`
        #yt-bg-player {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100vw;
          min-height: 100vh;
          width: 177.78vh; /* 16:9 aspect ratio */
          height: 56.25vw;
          transform: translate(-50%, -50%);
        }
        #yt-bg-player iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
