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
    <div className="flex flex-col gap-2.5">
      {NOISES.map((n) => {
        const ch = channels[n.type];
        return (
          <div key={n.type} className="flex items-center gap-2.5">
            <button
              onClick={() => toggleChannel(n.type)}
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all duration-200 cursor-pointer",
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
  );
}
