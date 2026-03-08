"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type Phase = "focus" | "shortBreak" | "longBreak";

interface UsePomodoroOptions {
  onPhaseChange?: (phase: Phase) => void;
}

const LONG_BREAK_INTERVAL = 4; // long break every 4 focus sessions

export function usePomodoro({ onPhaseChange }: UsePomodoroOptions = {}) {
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [shortBreakDuration, setShortBreakDuration] = useState(5 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [phase, setPhase] = useState<Phase>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const phaseRef = useRef<Phase>("focus");
  const focusDurationRef = useRef(focusDuration);
  const shortBreakDurationRef = useRef(shortBreakDuration);
  const longBreakDurationRef = useRef(longBreakDuration);
  const completedCountRef = useRef(0);

  onPhaseChangeRef.current = onPhaseChange;
  focusDurationRef.current = focusDuration;
  shortBreakDurationRef.current = shortBreakDuration;
  longBreakDurationRef.current = longBreakDuration;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getDurationForPhase = useCallback((p: Phase) => {
    switch (p) {
      case "focus":
        return focusDurationRef.current;
      case "shortBreak":
        return shortBreakDurationRef.current;
      case "longBreak":
        return longBreakDurationRef.current;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const currentPhase = phaseRef.current;
          let nextPhase: Phase;

          if (currentPhase === "focus") {
            completedCountRef.current += 1;
            setCompletedCount(completedCountRef.current);
            nextPhase =
              completedCountRef.current % LONG_BREAK_INTERVAL === 0
                ? "longBreak"
                : "shortBreak";
          } else {
            nextPhase = "focus";
          }

          phaseRef.current = nextPhase;
          setPhase(nextPhase);

          setTimeout(() => onPhaseChangeRef.current?.(nextPhase), 0);

          return getDurationForPhase(nextPhase);
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer, getDurationForPhase]);

  const switchPhase = useCallback(
    (newPhase: Phase) => {
      if (isRunning) return;
      phaseRef.current = newPhase;
      setPhase(newPhase);
      setTimeLeft(getDurationForPhase(newPhase));
    },
    [getDurationForPhase, isRunning]
  );

  const start = useCallback(() => {
    phaseRef.current = "focus";
    setTimeLeft(focusDurationRef.current);
    setPhase("focus");
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    phaseRef.current = "focus";
    setPhase("focus");
    setTimeLeft(focusDurationRef.current);
  }, []);

  const totalDuration = getDurationForPhase(phase);

  return {
    timeLeft,
    phase,
    isRunning,
    completedCount,
    totalDuration,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    start,
    pause,
    resume,
    reset,
    switchPhase,
    setFocusDuration: (minutes: number) => {
      const secs = minutes * 60;
      setFocusDuration(secs);
      focusDurationRef.current = secs;
      if (phase === "focus" && !isRunning) setTimeLeft(secs);
    },
    setShortBreakDuration: (minutes: number) => {
      const secs = minutes * 60;
      setShortBreakDuration(secs);
      shortBreakDurationRef.current = secs;
      if (phase === "shortBreak" && !isRunning) setTimeLeft(secs);
    },
    setLongBreakDuration: (minutes: number) => {
      const secs = minutes * 60;
      setLongBreakDuration(secs);
      longBreakDurationRef.current = secs;
      if (phase === "longBreak" && !isRunning) setTimeLeft(secs);
    },
  };
}
