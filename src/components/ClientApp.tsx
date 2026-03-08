"use client";

import { useState } from "react";
import { MusicStyle } from "@/types";
import StyleSelector from "./StyleSelector";
import PlayerView from "./PlayerView";
import YouTubeBackground from "./YouTubeBackground";

interface ClientAppProps {
  styles: MusicStyle[];
}

export default function ClientApp({ styles }: ClientAppProps) {
  const [selectedStyle, setSelectedStyle] = useState<MusicStyle | null>(null);

  return (
    <div className="relative flex min-h-screen flex-col">
      <YouTubeBackground
        videoId="hjKO0d_umLc"
        playlistId="PLLCQp0HkPz--5KFRVoech1gqOe4RDPZkj"
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 -z-[5] bg-black/50" />
      {/* Header */}
      <header className="flex flex-col items-center pt-8 sm:pt-10 pb-2 px-4">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white/90">
          AI Music Flow
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          AI 生成的专注音乐，一个页面进入心流
        </p>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        {selectedStyle ? (
          <PlayerView
            style={selectedStyle}
            onBack={() => setSelectedStyle(null)}
          />
        ) : (
          <StyleSelector
            styles={styles}
            onSelect={(style) => setSelectedStyle(style)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-gray-700">
        Powered by AI Music Flow
      </footer>
    </div>
  );
}
