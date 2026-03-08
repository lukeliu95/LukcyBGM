"use client";

import { useState, useRef, useEffect } from "react";
import VolumeControl from "./VolumeControl";
import AmbientMixer from "./AmbientMixer";
import FocusStats from "./FocusStats";
import clsx from "clsx";

interface SettingsPanelProps {
  volume: number;
  onVolumeChange: (v: number) => void;
  focusMinutes: number;
  sessionsCompleted: number;
}

export default function SettingsPanel({
  volume,
  onVolumeChange,
  focusMinutes,
  sessionsCompleted,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all duration-200 cursor-pointer",
          "border backdrop-blur-sm",
          open
            ? "border-white/20 bg-white/10 text-white"
            : "border-white/[0.08] bg-white/[0.04] text-gray-400 hover:text-white hover:border-white/15"
        )}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        设置
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 top-full mt-2 z-50 w-64",
            "rounded-xl border border-white/[0.08] bg-black/80 backdrop-blur-xl",
            "p-4 shadow-2xl animate-fade-in"
          )}
        >
          <div className="flex flex-col gap-4">
            {/* Volume */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                音量
              </p>
              <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
            </div>

            {/* Ambient mixer */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                环境音
              </p>
              <AmbientMixer />
            </div>

            {/* Focus stats */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                今日专注
              </p>
              <FocusStats
                focusMinutes={focusMinutes}
                sessionsCompleted={sessionsCompleted}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
