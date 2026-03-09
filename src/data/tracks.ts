// Static BGM track manifest
// When adding new tracks: upload to R2 first, then add entry here

import { MusicStyle } from "@/types";
import { getStyleMeta } from "./style-meta";

const BGM_BASE_URL =
  process.env.NEXT_PUBLIC_BGM_BASE_URL || "/api/bgm";

interface TrackEntry {
  file: string;
  duration: number; // seconds (estimate)
}

interface StyleEntry {
  dir: string;
  tracks: TrackEntry[];
}

const STYLES: StyleEntry[] = [
  {
    dir: "morning_reading",
    tracks: [
      { file: "pomodoro_20260309_003453_session1.mp3", duration: 1800 },
      { file: "pomodoro_20260309_003501_session2.mp3", duration: 1800 },
      { file: "pomodoro_20260309_003510_session3.mp3", duration: 1800 },
      { file: "pomodoro_20260309_003519_session4.mp3", duration: 1800 },
    ],
  },
  // Add more styles here:
  // {
  //   dir: "lofi",
  //   tracks: [
  //     { file: "track1.mp3", duration: 1800 },
  //   ],
  // },
];

export function getStaticStyles(): MusicStyle[] {
  return STYLES.map((style) => {
    const meta = getStyleMeta(style.dir);
    return {
      id: style.dir,
      name: meta.name,
      icon: meta.icon,
      description: meta.description,
      tracks: style.tracks.map((t, i) => ({
        id: `${style.dir}-${i}`,
        title: `${meta.name} #${i + 1}`,
        src: `${BGM_BASE_URL}/${style.dir}/${t.file}`,
        duration: t.duration,
      })),
    };
  });
}
