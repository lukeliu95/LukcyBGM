"use client";

interface FocusStatsProps {
  focusMinutes: number;
  sessionsCompleted: number;
}

export default function FocusStats({
  focusMinutes,
  sessionsCompleted,
}: FocusStatsProps) {
  const hours = Math.floor(focusMinutes / 60);
  const mins = focusMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="flex items-center gap-4 text-[11px] text-gray-500">
      <span className="flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Today {timeStr}
      </span>
      <span className="flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        {sessionsCompleted} sessions
      </span>
    </div>
  );
}
