"use client";

import { useState, useRef, useEffect } from "react";
import { TimerStyle } from "./Timer";
import FocusStats from "./FocusStats";
import clsx from "clsx";

interface SettingsPanelProps {
  focusMinutes: number;
  sessionsCompleted: number;
  timerStyle: TimerStyle;
  onTimerStyleChange: (style: TimerStyle) => void;
}

const TIMER_STYLES: { value: TimerStyle; label: string; icon: string }[] = [
  { value: "ring", label: "Ring", icon: "◯" },
  { value: "flip", label: "Flip", icon: "▦" },
  { value: "minimal", label: "Minimal", icon: "Aa" },
  { value: "bar", label: "Bar", icon: "≡" },
  { value: "breath", label: "Breath", icon: "◎" },
];

export default function SettingsPanel({
  focusMinutes,
  sessionsCompleted,
  timerStyle,
  onTimerStyleChange,
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
        Settings
      </button>

      <div
        className={clsx(
          "absolute right-0 top-full mt-2 z-50 w-72",
          "rounded-xl border border-white/[0.08] bg-black/80 backdrop-blur-xl",
          "p-4 shadow-2xl transition-all duration-200",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
          <div className="flex flex-col gap-4">
            {/* Timer Style */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Timer Style
              </p>
              <div className="flex items-center gap-1.5">
                {TIMER_STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => onTimerStyleChange(s.value)}
                    title={s.label}
                    className={clsx(
                      "w-8 h-8 rounded-lg text-[11px] transition-all duration-200 cursor-pointer",
                      timerStyle === s.value
                        ? "bg-white/15 text-white border border-white/20"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                    )}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus stats */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Focus Stats
              </p>
              <FocusStats
                focusMinutes={focusMinutes}
                sessionsCompleted={sessionsCompleted}
              />
            </div>
          </div>
        </div>
    </div>
  );
}
