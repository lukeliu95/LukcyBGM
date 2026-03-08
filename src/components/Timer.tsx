"use client";

import { Phase } from "@/hooks/usePomodoro";

interface TimerProps {
  timeLeft: number;
  totalDuration: number;
  phase: Phase;
  completedCount: number;
  onTimerClick?: () => void;
}

const THEME = {
  focus: {
    start: "#93c5fd",
    end: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.5)",
    textGlow: "rgba(59, 130, 246, 0.25)",
    label: "text-blue-400",
  },
  shortBreak: {
    start: "#6ee7b7",
    end: "#10b981",
    glow: "rgba(16, 185, 129, 0.5)",
    textGlow: "rgba(16, 185, 129, 0.25)",
    label: "text-emerald-400",
  },
  longBreak: {
    start: "#c4b5fd",
    end: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.5)",
    textGlow: "rgba(139, 92, 246, 0.25)",
    label: "text-violet-400",
  },
} as const;

export default function Timer({
  timeLeft,
  totalDuration,
  phase,
  completedCount,
  onTimerClick,
}: TimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / totalDuration;

  const size = 240;
  const center = size / 2;
  const strokeWidth = 4;
  const r = center - strokeWidth * 3; // leave room for glow
  const circumference = r * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  // Tip dot position
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const dotX = center + r * Math.cos(angle);
  const dotY = center + r * Math.sin(angle);

  const t = THEME[phase];

  // 60 tick marks, every 5th is major
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const inner = r - (isMajor ? 10 : 6);
    const outer = r - 2;
    return {
      x1: center + inner * Math.cos(a),
      y1: center + inner * Math.sin(a),
      x2: center + outer * Math.cos(a),
      y2: center + outer * Math.sin(a),
      isMajor,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative${onTimerClick ? " cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" : ""}`}
        onClick={onTimerClick}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient
              id="timer-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={t.start} />
              <stop offset="100%" stopColor={t.end} />
            </linearGradient>
            <filter id="ring-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Tick marks */}
          {ticks.map((tk, i) => (
            <line
              key={i}
              x1={tk.x1}
              y1={tk.y1}
              x2={tk.x2}
              y2={tk.y2}
              stroke={
                tk.isMajor
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.04)"
              }
              strokeWidth={tk.isMajor ? 1.5 : 0.75}
              strokeLinecap="round"
            />
          ))}

          {/* Background ring */}
          <circle
            stroke="rgba(255,255,255,0.06)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={r}
            cx={center}
            cy={center}
          />

          {/* Progress ring */}
          <circle
            stroke="url(#timer-grad)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            r={r}
            cx={center}
            cy={center}
            transform={`rotate(-90 ${center} ${center})`}
            filter="url(#ring-glow)"
            className="transition-all duration-1000 ease-linear"
          />

          {/* Progress tip dot */}
          {progress > 0.005 && (
            <circle
              cx={dotX}
              cy={dotY}
              r={4.5}
              fill={t.end}
              filter="url(#dot-glow)"
              className="animate-pulse-soft"
            />
          )}
        </svg>

        {/* Clickable hint ring */}
        {onTimerClick && (
          <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border border-white/10 w-[200px] h-[200px]" />
          </div>
        )}

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl sm:text-6xl font-extralight tabular-nums tracking-wider text-white"
            style={{ textShadow: `0 0 24px ${t.textGlow}` }}
          >
            {String(minutes).padStart(2, "0")}
            <span className="animate-blink">:</span>
            {String(seconds).padStart(2, "0")}
          </span>
          <span
            className={`mt-2.5 text-[11px] tracking-[0.2em] uppercase font-medium ${t.label} transition-colors duration-700`}
          >
            {phase === "focus"
              ? "专注中"
              : phase === "shortBreak"
                ? "短休息"
                : "长休息"}
          </span>
        </div>
      </div>

      {/* Completed sessions */}
      {completedCount > 0 && (
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
            <span className="ml-0.5 text-xs text-gray-500">
              +{completedCount - 8}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
