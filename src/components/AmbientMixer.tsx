"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AMBIENT_SOUNDS, PRESETS, Preset } from "@/data/ambientSounds";
import { useAmbientNoise } from "@/hooks/useAmbientNoise";
import type { MusicStyle } from "@/types";
import clsx from "clsx";

type MixState = Record<string, number>; // id -> volume; absent = off

const STORAGE_KEY = "ambient-mix-v1";

function loadFromStorage(): MixState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MixState) : {};
  } catch {
    return {};
  }
}

function saveToStorage(mix: MixState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mix));
  } catch {}
}

interface AudioApi {
  play: (style: MusicStyle) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  isPlaying: boolean;
}

interface AmbientMixerProps {
  pageMode?: boolean;
  active?: boolean;
  paused?: boolean;
  audio?: AudioApi;
  musicStyle?: MusicStyle | null;
  musicPaused?: boolean;
}

export default function AmbientMixer({ pageMode = false, active = false, paused = false, audio, musicStyle, musicPaused = false }: AmbientMixerProps) {
  const noise = useAmbientNoise();
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const musicStyleRef = useRef(musicStyle);
  musicStyleRef.current = musicStyle;
  // Start with empty state to match SSR; restore from localStorage after hydration
  const [mix, setMix] = useState<MixState>({});
  const [activePreset, setActivePreset] = useState<string | null>(null);
  // Remembers last volume for each sound so toggling back on restores it
  const [lastVolumes, setLastVolumes] = useState<Record<string, number>>({});

  // Track mix in ref for active lifecycle (avoid stale closure)
  const mixRef = useRef(mix);
  mixRef.current = mix;

  // Sync play/stop with parent active state (Start → replay, Reset → stop)
  const prevActiveRef = useRef(active);
  useEffect(() => {
    const wasActive = prevActiveRef.current;
    prevActiveRef.current = active;
    if (!wasActive && active) {
      Object.entries(mixRef.current).forEach(([id, volume]) => {
        if (id === "bgm") {
          if (musicStyleRef.current && !audioRef.current?.isPlaying) {
            audioRef.current?.play(musicStyleRef.current);
          }
          audioRef.current?.setVolume(volume);
        } else {
          noise.play(id, volume);
        }
      });
    } else if (wasActive && !active) {
      noise.stopAll();
      audioRef.current?.stop();
    }
  }, [active, noise]);

  // Pause/resume all audio when parent toggles paused prop (e.g. Space key)
  const prevPausedRef = useRef(paused);
  useEffect(() => {
    const wasPaused = prevPausedRef.current;
    prevPausedRef.current = paused;
    if (!wasPaused && paused) {
      noise.pauseAll();
      if ("bgm" in mixRef.current) audioRef.current?.pause();
    } else if (wasPaused && !paused && active) {
      Object.entries(mixRef.current).forEach(([id, volume]) => {
        if (id === "bgm") {
          if (!musicPaused) audioRef.current?.resume();
        } else {
          noise.play(id, volume);
        }
      });
    }
  }, [paused, active, noise, musicPaused]);

  // Pause/resume BGM during breaks (musicPaused prop)
  const prevMusicPausedRef = useRef(musicPaused);
  useEffect(() => {
    const was = prevMusicPausedRef.current;
    prevMusicPausedRef.current = musicPaused;
    if (!was && musicPaused) {
      if ("bgm" in mixRef.current) audioRef.current?.pause();
    } else if (was && !musicPaused && active && !paused) {
      if ("bgm" in mixRef.current) audioRef.current?.resume();
    }
  }, [musicPaused, active, paused]);

  // Restore saved mix after hydration; default to BGM on if nothing saved
  useEffect(() => {
    const saved = loadFromStorage();
    setMix(Object.keys(saved).length > 0 ? saved : { bgm: 0.7 });
  }, []);

  // Persist mix to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(mix);
  }, [mix]);

  const toggleSound = useCallback(
    (id: string) => {
      setMix((prev) => {
        if (id in prev) {
          const volume = prev[id];
          setLastVolumes((lv) => ({ ...lv, [id]: volume }));
          // Defer audio side effects to avoid setState-during-render
          queueMicrotask(() => {
            if (id === "bgm") {
              audioRef.current?.stop();
            } else {
              noise.stop(id);
            }
          });
          const next = { ...prev };
          delete next[id];
          setActivePreset(null);
          return next;
        } else {
          const volume = lastVolumes[id] ?? 0.3;
          // Defer audio side effects to avoid setState-during-render
          queueMicrotask(() => {
            if (id === "bgm") {
              if (musicStyleRef.current) {
                audioRef.current?.play(musicStyleRef.current);
                audioRef.current?.setVolume(volume);
              }
            } else {
              noise.play(id, volume);
            }
          });
          setActivePreset(null);
          return { ...prev, [id]: volume };
        }
      });
    },
    [noise, lastVolumes]
  );

  const changeVolume = useCallback(
    (id: string, volume: number) => {
      setMix((prev) => {
        if (!(id in prev)) return prev;
        // Defer audio side effects
        queueMicrotask(() => {
          if (id === "bgm") {
            audioRef.current?.setVolume(volume);
          } else {
            noise.setVolume(id, volume);
          }
        });
        return { ...prev, [id]: volume };
      });
    },
    [noise]
  );

  const applyMix = useCallback(
    (newMix: MixState, presetId: string | null) => {
      noise.stopAll();
      // Preserve BGM state across preset/random changes
      const bgmVol = mixRef.current["bgm"];
      const finalMix = bgmVol !== undefined ? { ...newMix, bgm: bgmVol } : newMix;
      setMix(finalMix);
      setActivePreset(presetId);
      setTimeout(() => {
        Object.entries(finalMix).forEach(([id, volume]) => {
          if (id === "bgm") return; // BGM already playing
          noise.play(id, volume);
        });
      }, 200);
    },
    [noise]
  );

  const applyPreset = useCallback(
    (preset: Preset) => applyMix(preset.mix, preset.id),
    [applyMix]
  );

  const applyRandom = useCallback(() => {
    const count = 2 + Math.floor(Math.random() * 3); // 2–4 sounds
    const shuffled = [...AMBIENT_SOUNDS].sort(() => Math.random() - 0.5);
    const newMix: MixState = {};
    shuffled.slice(0, count).forEach((s) => {
      newMix[s.id] = +(0.2 + Math.random() * 0.4).toFixed(2);
    });
    applyMix(newMix, null);
  }, [applyMix]);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Top row: Random button + scrollable preset tags */}
      <div className={clsx(
        "flex items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        pageMode && "opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto"
      )}>
        <button
          onClick={applyRandom}
          title="Random mix"
          className="flex-shrink-0 h-6 w-6 rounded-md text-sm flex items-center justify-center bg-white/[0.06] hover:bg-white/15 border border-white/[0.08] hover:border-white/20 transition-all duration-200 cursor-pointer"
        >
          🎲
        </button>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className={clsx(
              "flex-shrink-0 h-6 px-2 rounded-md text-[10px] whitespace-nowrap transition-all duration-200 cursor-pointer border",
              activePreset === preset.id
                ? "bg-white/15 text-white border-white/20"
                : "text-gray-500 hover:text-gray-300 bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/15"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Sound grid */}
      <div className="grid grid-cols-5 gap-1">
        {[{ id: "bgm", label: "Music", icon: "🎵" }, ...AMBIENT_SOUNDS].map((sound) => {
          const isActive = sound.id in mix;
          const volume = isActive
            ? mix[sound.id]
            : (lastVolumes[sound.id] ?? 0.3);

          return (
            <div key={sound.id} className="flex flex-col items-center gap-0.5">
              <button
                onClick={() => toggleSound(sound.id)}
                title={sound.label}
                className={clsx(
                  "w-full aspect-square rounded-xl text-lg flex items-center justify-center transition-all duration-200 cursor-pointer border",
                  isActive
                    ? pageMode
                      ? "bg-white/10 border-white/10 opacity-50 group-hover:opacity-100 group-hover:bg-white/15 group-hover:border-white/20 shadow-[0_0_6px_rgba(255,255,255,0.04)] group-hover:shadow-[0_0_8px_rgba(255,255,255,0.08)]"
                      : "bg-white/15 border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.08)]"
                    : pageMode
                      ? "bg-transparent border-transparent opacity-25 group-hover:opacity-40 group-hover:hover:opacity-70 group-hover:bg-white/[0.03] group-hover:border-white/[0.05]"
                      : "bg-white/[0.03] border-white/[0.05] opacity-40 hover:opacity-70"
                )}
              >
                {sound.icon}
              </button>
              <span
                className={clsx(
                  "text-[9px] leading-tight w-full text-center truncate transition-all duration-200",
                  pageMode
                    ? "opacity-0 group-hover:opacity-100 " + (isActive ? "text-gray-300" : "text-gray-600")
                    : isActive ? "text-gray-300" : "text-gray-600"
                )}
              >
                {sound.label.split(" ")[0]}
              </span>
              {/* Volume slider — expands when active */}
              <div
                className={clsx(
                  "w-full overflow-hidden transition-all duration-200",
                  isActive
                    ? pageMode
                      ? "max-h-0 opacity-0 group-hover:max-h-4 group-hover:opacity-100"
                      : "max-h-4 opacity-100"
                    : "max-h-0 opacity-0"
                )}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) =>
                    changeVolume(sound.id, parseFloat(e.target.value))
                  }
                  className="w-full cursor-pointer"
                  style={{ height: "4px" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
