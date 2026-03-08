"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MusicStyle } from "@/types";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePomodoro, Phase } from "@/hooks/usePomodoro";
import { trackPomodoroComplete } from "@/lib/analytics";
import { useFocusStats } from "@/hooks/useFocusStats";
import Timer from "./Timer";
import VolumeControl from "./VolumeControl";
import FocusStats from "./FocusStats";
import AmbientMixer from "./AmbientMixer";
import TaskLabel from "./TaskLabel";
import RecommendationCard from "./RecommendationCard";
import clsx from "clsx";

interface PlayerViewProps {
  style: MusicStyle;
  onBack: () => void;
}

const PHASE_TABS: { key: Phase; label: string }[] = [
  { key: "focus", label: "专注" },
  { key: "shortBreak", label: "短休息" },
  { key: "longBreak", label: "长休息" },
];

const PHASE_COLORS: Record<Phase, { bg: string; border: string; hover: string; glow: string }> = {
  focus: {
    bg: "bg-blue-500/15",
    border: "border-blue-400/30",
    hover: "hover:bg-blue-500/25",
    glow: "rgba(59,130,246,0.3)",
  },
  shortBreak: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-400/30",
    hover: "hover:bg-emerald-500/25",
    glow: "rgba(16,185,129,0.3)",
  },
  longBreak: {
    bg: "bg-violet-500/15",
    border: "border-violet-400/30",
    hover: "hover:bg-violet-500/25",
    glow: "rgba(139,92,246,0.3)",
  },
};

function playNotificationBeep() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);

    setTimeout(() => ctx.close(), 500);
  } catch {
    // Web Audio API not available
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

export default function PlayerView({ style, onBack }: PlayerViewProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const audio = useAudioPlayer();
  const audioRef = useRef(audio);
  audioRef.current = audio;

  const completedCountRef = useRef(0);
  const focusStats = useFocusStats();
  const focusStatsRef = useRef(focusStats);
  focusStatsRef.current = focusStats;

  const handlePhaseChange = useCallback((newPhase: Phase) => {
    playNotificationBeep();
    if (newPhase === "shortBreak" || newPhase === "longBreak") {
      completedCountRef.current += 1;
      trackPomodoroComplete(completedCountRef.current);
      focusStatsRef.current.addSession();
    }
  }, []);

  const pomodoro = usePomodoro({ onPhaseChange: handlePhaseChange });

  // Track focus time when phase changes away from focus
  const prevPhaseRef = useRef(pomodoro.phase);
  useEffect(() => {
    if (prevPhaseRef.current === "focus" && pomodoro.phase !== "focus") {
      focusStats.addFocusTime(Math.round(pomodoro.focusDuration / 60));
    }
    prevPhaseRef.current = pomodoro.phase;
  }, [pomodoro.phase, pomodoro.focusDuration, focusStats]);

  const handleStart = () => {
    setHasStarted(true);
    audio.play(style);
    pomodoro.start();
  };

  const handlePauseResume = useCallback(() => {
    if (pomodoro.isRunning) {
      pomodoro.pause();
      audio.pause();
    } else {
      pomodoro.resume();
      audio.resume();
    }
  }, [pomodoro, audio]);

  const handleReset = () => {
    pomodoro.reset();
    audio.stop();
    completedCountRef.current = 0;
    setHasStarted(false);
  };

  const handleBack = () => {
    audio.stop();
    pomodoro.reset();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onBack();
  };

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Browser tab title countdown
  useEffect(() => {
    if (!hasStarted) return;
    const phaseLabel =
      pomodoro.phase === "focus"
        ? "专注中"
        : pomodoro.phase === "shortBreak"
          ? "短休息"
          : "长休息";
    const m = Math.floor(pomodoro.timeLeft / 60);
    const s = pomodoro.timeLeft % 60;
    const time = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    const taskSuffix = currentTask ? ` - ${currentTask}` : "";
    document.title = `${time} ${phaseLabel}${taskSuffix} | AI Music Flow`;
    return () => {
      document.title = "AI Music Flow - AI 生成的专注音乐";
    };
  }, [hasStarted, pomodoro.timeLeft, pomodoro.phase, currentTask]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!hasStarted) return;

    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handlePauseResume();
          break;
        case "KeyR":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            handleReset();
          }
          break;
        case "KeyF":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasStarted, handlePauseResume]);

  const pc = PHASE_COLORS[pomodoro.phase];

  return (
    <div
      className={clsx(
        "flex w-full max-w-lg flex-col items-center rounded-3xl p-6 sm:p-8",
        "transition-all duration-1000 bg-gradient-to-b from-blue-950/60 to-transparent"
      )}
    >
      {/* Style info */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">{style.icon}</span>
        <span className="text-lg text-gray-300">{style.name}</span>
      </div>

      {!hasStarted ? (
        <div className="flex flex-col items-center gap-6 py-12 animate-fade-in">
          <p className="text-gray-400 text-center">{style.description}</p>
          <p className="text-xs text-gray-600">{style.tracks.length} 首曲目</p>
          <button
            onClick={handleStart}
            className={clsx(
              "rounded-full px-10 py-4 text-lg font-semibold text-white",
              "bg-white/10 border border-white/20",
              "transition-all duration-300 hover:scale-105 hover:bg-white/20",
              "active:scale-95 cursor-pointer"
            )}
          >
            开始专注
          </button>
          <button
            onClick={handleBack}
            className="text-sm text-gray-500 transition-colors hover:text-gray-300 cursor-pointer"
          >
            ← 返回风格选择
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:gap-6 animate-fade-in">
          {/* Task label */}
          <TaskLabel onTaskChange={setCurrentTask} />

          {/* Phase tabs */}
          <div className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] p-1 backdrop-blur-sm">
            {PHASE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => pomodoro.switchPhase(tab.key)}
                disabled={pomodoro.isRunning && pomodoro.phase !== tab.key}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300",
                  pomodoro.phase === tab.key
                    ? "bg-white/10 text-white"
                    : pomodoro.isRunning
                      ? "text-gray-700 cursor-not-allowed"
                      : "text-gray-500 hover:text-gray-300 cursor-pointer"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Timer
            timeLeft={pomodoro.timeLeft}
            totalDuration={pomodoro.totalDuration}
            phase={pomodoro.phase}
            completedCount={pomodoro.completedCount}
          />

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handlePauseResume}
              className={clsx(
                "rounded-full px-6 sm:px-7 py-2.5 text-sm font-medium text-white",
                "backdrop-blur-md border transition-all duration-300",
                "active:scale-95 cursor-pointer",
                pc.bg,
                pc.border,
                pc.hover,
                "animate-glow-pulse"
              )}
              style={{ "--glow-color": pc.glow } as React.CSSProperties}
            >
              {pomodoro.isRunning ? "暂停" : "继续"}
            </button>
            <button
              onClick={handleReset}
              className={clsx(
                "rounded-full px-6 sm:px-7 py-2.5 text-sm text-gray-400",
                "backdrop-blur-md border border-white/[0.08] bg-white/[0.04]",
                "transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.08]",
                "active:scale-95 cursor-pointer"
              )}
            >
              重置
            </button>
            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className={clsx(
                "rounded-full p-2.5 text-gray-400",
                "backdrop-blur-md border border-white/[0.08] bg-white/[0.04]",
                "transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.08]",
                "active:scale-95 cursor-pointer"
              )}
              aria-label={isFullscreen ? "退出全屏" : "全屏"}
              title={isFullscreen ? "退出全屏 (F)" : "全屏 (F)"}
            >
              {isFullscreen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </button>
          </div>

          <VolumeControl
            volume={audio.volume}
            onVolumeChange={audio.setVolume}
          />

          <AmbientMixer />

          <RecommendationCard phase={pomodoro.phase} />

          <FocusStats
            focusMinutes={focusStats.focusMinutes}
            sessionsCompleted={focusStats.sessionsCompleted}
          />

          {/* Keyboard hints & back */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-gray-600 tracking-wide">
              空格 暂停/继续 · R 重置 · F 全屏
            </p>
            <button
              onClick={handleBack}
              className="text-sm text-gray-500 transition-colors hover:text-gray-300 cursor-pointer"
            >
              ← 返回风格选择
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
