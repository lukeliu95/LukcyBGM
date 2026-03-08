"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { MusicStyle } from "@/types";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePomodoro, Phase } from "@/hooks/usePomodoro";
import { trackPomodoroComplete } from "@/lib/analytics";
import { useFocusStats } from "@/hooks/useFocusStats";
import { getRandomVideo } from "@/data/videoSources";
import Timer, { TimerStyle } from "./Timer";
import SettingsPanel from "./SettingsPanel";
import YouTubeBackground from "./YouTubeBackground";
import clsx from "clsx";

interface ClientAppProps {
  styles: MusicStyle[];
}

const PHASE_TABS: { key: Phase; label: string }[] = [
  { key: "focus", label: "Focus" },
  { key: "shortBreak", label: "Short Break" },
  { key: "longBreak", label: "Long Break" },
];

const PHASE_TINT: Record<Phase, string> = {
  focus: "rgba(59,130,246,0.07)",
  shortBreak: "rgba(16,185,129,0.07)",
  longBreak: "rgba(139,92,246,0.07)",
};

const PHASE_COLORS: Record<
  Phase,
  { bg: string; border: string; hover: string; glow: string }
> = {
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

export default function ClientApp({ styles }: ClientAppProps) {
  const style = styles[0] ?? null;
  const [hasStarted, setHasStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bgVideo, setBgVideo] = useState<import("@/data/videoSources").VideoSource | null>(null);
  useEffect(() => { setBgVideo(getRandomVideo()); }, []);
  const handleVideoError = useCallback(() => {
    setBgVideo((prev) => getRandomVideo(prev?.id));
  }, []);
  const [timerStyle, setTimerStyle] = useState<TimerStyle>("ring");
  useEffect(() => {
    const saved = localStorage.getItem("timerStyle") as TimerStyle | null;
    if (saved) setTimerStyle(saved);
  }, []);

  const audio = useAudioPlayer();
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
    if (style) audio.play(style);
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

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Idle detection: fade UI after 3s inactivity while running
  const resetIdle = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (hasStarted && pomodoro.isRunning) {
      idleTimerRef.current = setTimeout(() => setIsIdle(true), 3000);
    }
  }, [hasStarted, pomodoro.isRunning]);

  useEffect(() => {
    if (hasStarted && pomodoro.isRunning) {
      idleTimerRef.current = setTimeout(() => setIsIdle(true), 3000);
    } else {
      setIsIdle(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [hasStarted, pomodoro.isRunning]);

  useEffect(() => {
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("touchstart", resetIdle);
    return () => {
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("touchstart", resetIdle);
    };
  }, [resetIdle]);

  // Browser tab title countdown
  useEffect(() => {
    if (!hasStarted) return;
    const phaseLabel =
      pomodoro.phase === "focus"
        ? "Focus"
        : pomodoro.phase === "shortBreak"
          ? "Short Break"
          : "Long Break";
    const m = Math.floor(pomodoro.timeLeft / 60);
    const s = pomodoro.timeLeft % 60;
    const time = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    const taskSuffix = currentTask ? ` - ${currentTask}` : "";
    document.title = `${time} ${phaseLabel}${taskSuffix} | LuckyBGM`;
    return () => {
      document.title = "LuckyBGM - Focus Music";
    };
  }, [hasStarted, pomodoro.timeLeft, pomodoro.phase, currentTask]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (hasStarted) handlePauseResume();
          break;
        case "KeyR":
          if (!e.metaKey && !e.ctrlKey && hasStarted) {
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
    <div className="relative flex min-h-screen flex-col">
      {bgVideo && <YouTubeBackground videoId={bgVideo.id} onError={handleVideoError} />}
      {/* Radial vignette overlay */}
      <div
        className="fixed inset-0 -z-[5] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 20%, rgba(0,0,0,0.72) 100%)" }}
      />
      {/* Phase atmospheric tint */}
      <div
        className="fixed inset-0 -z-[4] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: PHASE_TINT[pomodoro.phase] }}
      />

      {/* Header: logo left, settings right */}
      <header
        className={clsx(
          "relative z-10 flex items-center justify-between px-4 sm:px-6 pt-4 pb-2",
          "transition-opacity duration-700",
          isIdle ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="flex items-center">
          <Image
            src="/logoBGM.png"
            alt="LuckyBGM"
            width={200}
            height={42}
            className="h-10 w-auto"
            style={{ filter: "invert(1)", mixBlendMode: "screen" }}
            priority
          />
        </div>
        <SettingsPanel
          volume={audio.volume}
          onVolumeChange={audio.setVolume}
          focusMinutes={focusStats.focusMinutes}
          sessionsCompleted={focusStats.sessionsCompleted}
          timerStyle={timerStyle}
          onTimerStyleChange={(s) => { setTimerStyle(s); localStorage.setItem("timerStyle", s); }}
        />
      </header>

      {/* Main: timer centered */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <div className="flex w-full max-w-lg flex-col items-center rounded-3xl bg-black/30 backdrop-blur-sm py-8 px-6">
          {!hasStarted ? (
            <div className="flex flex-col items-center gap-6 animate-fade-in">
              {/* spacer */}
              <div className="h-6" />

              <Timer
                timeLeft={pomodoro.timeLeft}
                totalDuration={pomodoro.totalDuration}
                phase={pomodoro.phase}
                completedCount={pomodoro.completedCount}
                onTimerClick={handleStart}
                timerStyle={timerStyle}
              />

              <button
                onClick={handleStart}
                className={clsx(
                  "rounded-full px-10 py-4 text-lg font-semibold text-white",
                  "bg-white/10 border border-white/20",
                  "transition-all duration-300 hover:scale-105 hover:bg-white/20",
                  "active:scale-95 cursor-pointer"
                )}
              >
                Start Focus
              </button>

            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 sm:gap-6 animate-fade-in">
              <div className="h-6" />

              {/* Phase tabs */}
              <div
                className={clsx(
                  "flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] p-1 backdrop-blur-sm",
                  "transition-opacity duration-700",
                  isIdle ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
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
                onTimerClick={handlePauseResume}
                timerStyle={timerStyle}
              />

              <div
                className={clsx(
                  "flex items-center gap-3 sm:gap-4",
                  "transition-opacity duration-700",
                  isIdle ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
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
                  {pomodoro.isRunning ? "Pause" : "Resume"}
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
                  Reset
                </button>
                <button
                  onClick={toggleFullscreen}
                  className={clsx(
                    "rounded-full p-2.5 text-gray-400",
                    "backdrop-blur-md border border-white/[0.08] bg-white/[0.04]",
                    "transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.08]",
                    "active:scale-95 cursor-pointer"
                  )}
                  aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
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

              <p
                className={clsx(
                  "text-[10px] text-gray-600 tracking-wide",
                  "transition-opacity duration-700",
                  isIdle ? "opacity-0" : "opacity-100"
                )}
              >
                Space Pause/Resume · R Reset · F Fullscreen
              </p>
            </div>
          )}
        </div>
      </main>

      <footer
        className={clsx(
          "py-3 text-center text-[11px] text-gray-700",
          "transition-opacity duration-700",
          isIdle ? "opacity-0" : "opacity-100"
        )}
      >
        Powered by LuckyBGM
      </footer>
    </div>
  );
}
