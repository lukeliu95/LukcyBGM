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
      { file: "pomodoro_20260309_092328_session1.mp3", duration: 1800 },
      { file: "pomodoro_20260309_092337_session2.mp3", duration: 1800 },
      { file: "pomodoro_20260309_092346_session3.mp3", duration: 1800 },
      { file: "pomodoro_20260309_092355_session4.mp3", duration: 1800 },
      { file: "pomodoro_20260309_092403_session5.mp3", duration: 1800 },
      { file: "pomodoro_20260309_092412_session6.mp3", duration: 1800 },
      { file: "pomodoro_20260309_092421_session7.mp3", duration: 1800 },
      { file: "pomodoro_20260309_092429_session8.mp3", duration: 1800 },
      { file: "pomodoro_20260309_092438_session9.mp3", duration: 1800 },
      { file: "pomodoro_20260309_092447_session10.mp3", duration: 1800 },
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
