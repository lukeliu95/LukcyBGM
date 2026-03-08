"use client";

import { useState, useRef, useEffect } from "react";
import { Phase } from "@/hooks/usePomodoro";

export type TimerStyle = "ring" | "flip" | "minimal" | "bar" | "breath";

interface TimerProps {
  timeLeft: number;
  totalDuration: number;
  phase: Phase;
  completedCount: number;
  onTimerClick?: () => void;
  timerStyle?: TimerStyle;
}

const THEME = {
  focus: {
    start: "#93c5fd",
    end: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.5)",
    textGlow: "rgba(59, 130, 246, 0.25)",
    label: "text-blue-400",
    solid: "#3b82f6",
  },
  shortBreak: {
    start: "#6ee7b7",
    end: "#10b981",
    glow: "rgba(16, 185, 129, 0.5)",
    textGlow: "rgba(16, 185, 129, 0.25)",
    label: "text-emerald-400",
    solid: "#10b981",
  },
  longBreak: {
    start: "#c4b5fd",
    end: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.5)",
    textGlow: "rgba(139, 92, 246, 0.25)",
    label: "text-violet-400",
    solid: "#8b5cf6",
  },
} as const;

type ThemeValue = (typeof THEME)[Phase];

interface SharedProps {
  minutes: number;
  seconds: number;
  progress: number;
  phase: Phase;
  t: ThemeValue;
  completedCount: number;
  onTimerClick?: () => void;
}

function phaseLabel(phase: Phase) {
  return phase === "focus" ? "专注中" : phase === "shortBreak" ? "短休息" : "长休息";
}

function CompletedDots({ completedCount, t }: { completedCount: number; t: ThemeValue }) {
  if (completedCount === 0) return null;
  return (
    <div className="mt-5 flex items-center gap-2">
      {Array.from({ length: Math.min(completedCount, 8) }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${t.start}, ${t.end})`,
            boxShadow: `0 0 6px ${t.glow}`,
          }}
        />
      ))}
      {completedCount > 8 && (
        <span className="ml-0.5 text-xs text-gray-500">+{completedCount - 8}</span>
      )}
    </div>
  );
}

// ── Style 1: Ring ─────────────────────────────────────────────────
function TimerRing({ minutes, seconds, progress, phase, t, completedCount, onTimerClick }: SharedProps) {
  const size = 240;
  const center = size / 2;
  const strokeWidth = 4;
  const r = center - strokeWidth * 3;
  const circumference = r * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const dotX = center + r * Math.cos(angle);
  const dotY = center + r * Math.sin(angle);
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const inner = r - (isMajor ? 10 : 6);
    const outer = r - 2;
    return {
      x1: center + inner * Math.cos(a), y1: center + inner * Math.sin(a),
      x2: center + outer * Math.cos(a), y2: center + outer * Math.sin(a),
      isMajor,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative${onTimerClick ? " cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" : ""}`}
        onClick={onTimerClick}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="timer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={t.start} />
              <stop offset="100%" stopColor={t.end} />
            </linearGradient>
            <filter id="ring-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {ticks.map((tk, i) => (
            <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
              stroke={tk.isMajor ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}
              strokeWidth={tk.isMajor ? 1.5 : 0.75} strokeLinecap="round" />
          ))}
          <circle stroke="rgba(255,255,255,0.06)" fill="transparent" strokeWidth={strokeWidth} r={r} cx={center} cy={center} />
          <circle stroke="url(#timer-grad)" fill="transparent" strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset}
            r={r} cx={center} cy={center} transform={`rotate(-90 ${center} ${center})`}
            filter="url(#ring-glow)" className="transition-all duration-1000 ease-linear" />
          {progress > 0.005 && (
            <circle cx={dotX} cy={dotY} r={4.5} fill={t.end} filter="url(#dot-glow)" className="animate-pulse-soft" />
          )}
        </svg>
        {onTimerClick && (
          <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border border-white/10 w-[200px] h-[200px]" />
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl sm:text-6xl font-extralight tabular-nums tracking-wider text-white"
            style={{ textShadow: `0 0 24px ${t.textGlow}` }}>
            {String(minutes).padStart(2, "0")}<span className="animate-blink">:</span>{String(seconds).padStart(2, "0")}
          </span>
          <span className={`mt-2.5 text-[11px] tracking-[0.2em] uppercase font-medium ${t.label} transition-colors duration-700`}>
            {phaseLabel(phase)}
          </span>
        </div>
      </div>
      <CompletedDots completedCount={completedCount} t={t} />
    </div>
  );
}

// ── Style 2: Flip Clock ───────────────────────────────────────────
function FlipDigit({ value, color }: { value: string; color: string }) {
  const [displayed, setDisplayed] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    prev.current = value;
    setFlipping(true);
    const timer = setTimeout(() => {
      setDisplayed(value);
      setFlipping(false);
    }, 160);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div
      className="relative w-16 h-[76px] rounded-xl flex items-center justify-center overflow-hidden select-none"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        perspective: "300px",
      }}
    >
      <div className="absolute top-1/2 left-0 right-0 h-px bg-black/40 z-10" />
      <span
        style={{
          display: "block",
          fontSize: "2.75rem",
          fontWeight: 200,
          color: "white",
          letterSpacing: "0.02em",
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 20px ${color}`,
          transform: flipping ? "rotateX(-90deg)" : "rotateX(0deg)",
          transition: flipping ? "transform 0.16s ease-in" : "transform 0.16s ease-out",
          transformOrigin: "center bottom",
        }}
      >
        {displayed}
      </span>
    </div>
  );
}

function TimerFlip({ minutes, seconds, phase, t, completedCount, onTimerClick }: SharedProps) {
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex flex-col items-center gap-4${onTimerClick ? " cursor-pointer" : ""}`}
        onClick={onTimerClick}
      >
        <div className="flex items-center gap-2">
          <FlipDigit value={mm[0]} color={t.solid} />
          <FlipDigit value={mm[1]} color={t.solid} />
          <span className="text-4xl font-thin text-white/50 pb-1 animate-blink">:</span>
          <FlipDigit value={ss[0]} color={t.solid} />
          <FlipDigit value={ss[1]} color={t.solid} />
        </div>
        <span className={`text-[11px] tracking-[0.25em] uppercase font-medium ${t.label}`}>
          {phaseLabel(phase)}
        </span>
      </div>
      <CompletedDots completedCount={completedCount} t={t} />
    </div>
  );
}

// ── Style 3: Minimal ─────────────────────────────────────────────
function TimerMinimal({ minutes, seconds, phase, t, completedCount, onTimerClick }: SharedProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex flex-col items-center${onTimerClick ? " cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200" : ""}`}
        onClick={onTimerClick}
      >
        <span
          className="text-[7rem] sm:text-[8.5rem] font-thin tabular-nums leading-none tracking-tight text-white"
          style={{ textShadow: `0 0 60px ${t.glow}, 0 0 120px ${t.textGlow}` }}
        >
          {String(minutes).padStart(2, "0")}<span className="animate-blink opacity-60">:</span>{String(seconds).padStart(2, "0")}
        </span>
        <span className={`mt-4 text-[10px] tracking-[0.35em] uppercase font-light ${t.label} opacity-80`}>
          {phaseLabel(phase)}
        </span>
      </div>
      <CompletedDots completedCount={completedCount} t={t} />
    </div>
  );
}

// ── Style 4: Bar ─────────────────────────────────────────────────
function TimerBar({ minutes, seconds, progress, phase, t, completedCount, onTimerClick }: SharedProps) {
  return (
    <div className="flex flex-col items-center" style={{ width: 240 }}>
      <div
        className={`flex flex-col items-center w-full gap-5${onTimerClick ? " cursor-pointer" : ""}`}
        onClick={onTimerClick}
      >
        <span
          className="text-[4.5rem] sm:text-[5.5rem] font-extralight tabular-nums leading-none tracking-widest text-white"
          style={{ textShadow: `0 0 30px ${t.textGlow}` }}
        >
          {String(minutes).padStart(2, "0")}<span className="animate-blink text-white/40">:</span>{String(seconds).padStart(2, "0")}
        </span>
        <span className={`text-[10px] tracking-[0.3em] uppercase font-medium ${t.label}`}>
          {phaseLabel(phase)}
        </span>
        {/* Progress bar */}
        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${t.start}, ${t.end})`,
              boxShadow: `0 0 8px ${t.glow}`,
            }}
          />
        </div>
      </div>
      <CompletedDots completedCount={completedCount} t={t} />
    </div>
  );
}

// ── Style 5: Breath ──────────────────────────────────────────────
function TimerBreath({ minutes, seconds, progress, phase, t, completedCount, onTimerClick }: SharedProps) {
  const remaining = 1 - progress;
  const rings = [
    { scale: 0.92, delay: "0s" },
    { scale: 0.74, delay: "0.7s" },
    { scale: 0.56, delay: "1.4s" },
  ];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex items-center justify-center${onTimerClick ? " cursor-pointer" : ""}`}
        style={{ width: 240, height: 240 }}
        onClick={onTimerClick}
      >
        {rings.map((ring, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-breathe-ring"
            style={{
              width: 240 * ring.scale * (0.4 + remaining * 0.6),
              height: 240 * ring.scale * (0.4 + remaining * 0.6),
              border: `1px solid ${t.solid}`,
              animationDelay: ring.delay,
              transition: "width 1.2s ease, height 1.2s ease",
            }}
          />
        ))}
        {/* Soft center glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: 96,
            height: 96,
            background: `radial-gradient(circle, ${t.solid}20 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-extralight tabular-nums tracking-wider text-white"
            style={{ textShadow: `0 0 24px ${t.textGlow}` }}
          >
            {String(minutes).padStart(2, "0")}<span className="animate-blink">:</span>{String(seconds).padStart(2, "0")}
          </span>
          <span className={`mt-2 text-[10px] tracking-[0.2em] uppercase font-medium ${t.label}`}>
            {phaseLabel(phase)}
          </span>
        </div>
      </div>
      <CompletedDots completedCount={completedCount} t={t} />
    </div>
  );
}

// ── Main Timer Router ─────────────────────────────────────────────
export default function Timer({
  timeLeft,
  totalDuration,
  phase,
  completedCount,
  onTimerClick,
  timerStyle = "ring",
}: TimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / totalDuration;
  const t = THEME[phase];
  const shared: SharedProps = { minutes, seconds, progress, phase, t, completedCount, onTimerClick };

  switch (timerStyle) {
    case "flip":    return <TimerFlip    {...shared} />;
    case "minimal": return <TimerMinimal {...shared} />;
    case "bar":     return <TimerBar     {...shared} />;
    case "breath":  return <TimerBreath  {...shared} />;
    default:        return <TimerRing    {...shared} />;
  }
}
