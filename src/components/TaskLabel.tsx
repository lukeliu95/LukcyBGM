"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const STORAGE_KEY = "aimusicflow-current-task";

interface TaskLabelProps {
  onTaskChange?: (task: string) => void;
}

function loadTask(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function saveTask(task: string) {
  try {
    localStorage.setItem(STORAGE_KEY, task);
  } catch {
    // storage unavailable
  }
}

export default function TaskLabel({ onTaskChange }: TaskLabelProps) {
  const [task, setTask] = useState(loadTask);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const startEditing = useCallback(() => {
    setDraft(task);
    setIsEditing(true);
  }, [task]);

  const confirm = useCallback(() => {
    const trimmed = draft.trim();
    setTask(trimmed);
    saveTask(trimmed);
    setIsEditing(false);
    onTaskChange?.(trimmed);
  }, [draft, onTaskChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirm();
      } else if (e.key === "Escape") {
        setIsEditing(false);
      }
    },
    [confirm]
  );

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={confirm}
        onKeyDown={handleKeyDown}
        placeholder="正在做什么？"
        maxLength={60}
        className="w-full max-w-xs bg-transparent text-center text-sm text-white/80 placeholder-gray-600 outline-none border-b border-white/10 pb-1 focus:border-white/30 transition-colors"
      />
    );
  }

  return (
    <button
      onClick={startEditing}
      className="group flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
    >
      {task ? (
        <span className="text-white/60 group-hover:text-white/80 transition-colors truncate max-w-[240px]">
          {task}
        </span>
      ) : (
        <span className="text-gray-600 group-hover:text-gray-400 transition-colors">
          点击输入当前任务
        </span>
      )}
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    </button>
  );
}
