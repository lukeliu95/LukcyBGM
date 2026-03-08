"use client";

import { useRef } from "react";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export default function VolumeControl({
  volume,
  onVolumeChange,
}: VolumeControlProps) {
  const isMuted = volume === 0;
  const prevVolumeRef = useRef(0.7);

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange(prevVolumeRef.current);
    } else {
      prevVolumeRef.current = volume;
      onVolumeChange(0);
    }
  };

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm">
      <button
        onClick={toggleMute}
        className="text-gray-500 transition-colors hover:text-gray-300 cursor-pointer p-1"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            {volume > 0.5 ? (
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            ) : (
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            )}
          </svg>
        )}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-20 sm:w-28 cursor-pointer"
        aria-label="Volume"
      />
    </div>
  );
}
