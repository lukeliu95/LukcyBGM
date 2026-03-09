"use client";

import { useState, useCallback, useEffect } from "react";

interface DailyStats {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  sessionsCompleted: number;
}

const STORAGE_KEY = "aimusicflow-focus-stats";

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadStats(): DailyStats {
  if (typeof window === "undefined") {
    return { date: getTodayKey(), focusMinutes: 0, sessionsCompleted: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: DailyStats = JSON.parse(raw);
      if (data.date === getTodayKey()) return data;
    }
  } catch {
    // corrupted data
  }
  return { date: getTodayKey(), focusMinutes: 0, sessionsCompleted: 0 };
}

function saveStats(stats: DailyStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // storage full or unavailable
  }
}

export function useFocusStats() {
  // Start with zeros to match SSR; restore from localStorage after hydration
  const [stats, setStats] = useState<DailyStats>({
    date: getTodayKey(),
    focusMinutes: 0,
    sessionsCompleted: 0,
  });

  // Restore from localStorage after hydration
  useEffect(() => {
    const current = loadStats();
    setStats(current);
  }, []);

  const addFocusTime = useCallback((minutes: number) => {
    setStats((prev) => {
      const today = getTodayKey();
      const base = prev.date === today ? prev : { date: today, focusMinutes: 0, sessionsCompleted: 0 };
      const updated = { ...base, focusMinutes: base.focusMinutes + minutes };
      saveStats(updated);
      return updated;
    });
  }, []);

  const addSession = useCallback(() => {
    setStats((prev) => {
      const today = getTodayKey();
      const base = prev.date === today ? prev : { date: today, focusMinutes: 0, sessionsCompleted: 0 };
      const updated = { ...base, sessionsCompleted: base.sessionsCompleted + 1 };
      saveStats(updated);
      return updated;
    });
  }, []);

  return {
    focusMinutes: stats.focusMinutes,
    sessionsCompleted: stats.sessionsCompleted,
    addFocusTime,
    addSession,
  };
}
