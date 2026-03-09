"use client";

import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <span className="text-sm font-medium text-white/70 tabular-nums tracking-wide">
      {time}
    </span>
  );
}
