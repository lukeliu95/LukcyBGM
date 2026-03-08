"use client";

import { MusicStyle } from "@/types";
import clsx from "clsx";
import { trackStyleSelect } from "@/lib/analytics";

interface StyleSelectorProps {
  styles: MusicStyle[];
  onSelect: (style: MusicStyle) => void;
}

export default function StyleSelector({
  styles,
  onSelect,
}: StyleSelectorProps) {
  if (styles.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p className="text-lg">暂无音乐</p>
        <p className="mt-2 text-sm">
          请在 BGM 目录下添加音乐风格文件夹
        </p>
      </div>
    );
  }

  // Single style: go directly, but still show the card for visual consistency
  const isSingle = styles.length === 1;

  return (
    <div className="w-full max-w-md sm:max-w-lg px-2">
      <div className="mb-6 text-center">
        <p className="text-2xl mb-1">📚</p>
        <p className="text-sm text-gray-500">
          {isSingle ? "选择音乐开始学习" : "选择音乐风格"}
        </p>
      </div>
      <div
        className={clsx(
          "grid gap-3 sm:gap-4",
          styles.length === 1
            ? "grid-cols-1 max-w-xs mx-auto"
            : styles.length === 2
              ? "grid-cols-2"
              : styles.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2"
        )}
      >
        {styles.map((style, i) => (
          <button
            key={style.id}
            onClick={() => {
              trackStyleSelect(style.id);
              onSelect(style);
            }}
            className={clsx(
              "animate-fade-in-scale group flex flex-col items-center rounded-2xl",
              "border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6",
              "transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.07]",
              "hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] hover:border-blue-500/30",
              "active:scale-[0.98] cursor-pointer"
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="text-3xl sm:text-4xl">{style.icon}</span>
            <span className="mt-3 text-base sm:text-lg font-semibold text-white">
              {style.name}
            </span>
            <span className="mt-1 text-xs sm:text-sm text-gray-500">
              {style.description}
            </span>
            <span className="mt-2 text-[10px] text-gray-600">
              {style.tracks.length} 首
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
