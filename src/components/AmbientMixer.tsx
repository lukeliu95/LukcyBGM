"use client";

import { useState, useCallback } from "react";
import { useAmbientNoise, NoiseType } from "@/hooks/useAmbientNoise";
import clsx from "clsx";

interface NoiseConfig {
  type: NoiseType;
  label: string;
  icon: string;
  description: string;
}

const NOISES: NoiseConfig[] = [
  { type: "white", label: "白噪音", icon: "〰️", description: "均匀频率，屏蔽干扰" },
  { type: "brown", label: "棕噪音", icon: "🌊", description: "低沉柔和，深度放松" },
  { type: "pink", label: "粉噪音", icon: "🌸", description: "自然平衡，助力专注" },
];

interface ChannelState {
  active: boolean;
  volume: number;
}

export default function AmbientMixer() {
  const noise = useAmbientNoise();
  const [channels, setChannels] = useState<Record<NoiseType, ChannelState>>({
    white: { active: false, volume: 0.3 },
    brown: { active: false, volume: 0.3 },
    pink: { active: false, volume: 0.3 },
  });
  const [expanded, setExpanded] = useState(false);

  const hasActive = Object.values(channels).some((c) => c.active);

  const toggleChannel = useCallback(
    (type: NoiseType) => {
      setChannels((prev) => {
        const ch = prev[type];
        if (ch.active) {
          noise.stop(type);
          return { ...prev, [type]: { ...ch, active: false } };
        } else {
          noise.play(type, ch.volume);
          return { ...prev, [type]: { ...ch, active: true } };
        }
      });
    },
    [noise]
  );

  const changeVolume = useCallback(
    (type: NoiseType, volume: number) => {
      setChannels((prev) => {
        const ch = prev[type];
        if (ch.active) {
          noise.setVolume(type, volume);
        }
        return { ...prev, [type]: { ...ch, volume } };
      });
    },
    [noise]
  );

  return (
    <div className="w-full max-w-xs">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={clsx(
          "mx-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] transition-all duration-300 cursor-pointer",
          "border backdrop-blur-sm",
          hasActive
            ? "border-white/15 bg-white/[0.08] text-gray-300"
            : "border-white/[0.06] bg-white/[0.03] text-gray-500 hover:text-gray-400"
        )}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 10s3-3 5-3 5 5 7 5 5-3 5-3V3s-3 3-5 3-5-5-7-5-5 3-5 3z" />
          <line x1="2" y1="10" x2="2" y2="20" />
        </svg>
        环境音{hasActive ? " ·" : ""}
        {hasActive && (
          <span className="text-white/60">
            {Object.values(channels).filter((c) => c.active).length}
          </span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={clsx(
            "transition-transform duration-200",
            expanded && "rotate-180"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Mixer panel */}
      {expanded && (
        <div className="mt-2 animate-fade-in rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 backdrop-blur-sm">
          <div className="flex flex-col gap-2.5">
            {NOISES.map((n) => {
              const ch = channels[n.type];
              return (
                <div key={n.type} className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleChannel(n.type)}
                    className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all duration-200 cursor-pointer",
                      ch.active
                        ? "bg-white/10 shadow-[0_0_8px_rgba(255,255,255,0.08)]"
                        : "bg-white/[0.03] opacity-50 hover:opacity-80"
                    )}
                    title={`${n.label} — ${n.description}`}
                  >
                    {n.icon}
                  </button>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span
                      className={clsx(
                        "text-[10px] transition-colors",
                        ch.active ? "text-gray-300" : "text-gray-600"
                      )}
                    >
                      {n.label}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={ch.volume}
                      onChange={(e) =>
                        changeVolume(n.type, parseFloat(e.target.value))
                      }
                      className={clsx(
                        "w-full cursor-pointer",
                        !ch.active && "opacity-30"
                      )}
                      disabled={!ch.active}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
