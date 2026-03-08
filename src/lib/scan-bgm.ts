import fs from "fs";
import path from "path";
import { MusicStyle, Track } from "@/types";
import { getStyleMeta } from "@/data/style-meta";

const BGM_DIR = path.join(process.cwd(), "BGM");
const BGM_PUBLIC_PREFIX = "/bgm";

export function scanBGMDirectory(): MusicStyle[] {
  if (!fs.existsSync(BGM_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(BGM_DIR, { withFileTypes: true });
  const styles: MusicStyle[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

    const styleDir = path.join(BGM_DIR, entry.name);
    const files = fs.readdirSync(styleDir);
    const mp3Files = files.filter((f) => f.endsWith(".mp3")).sort();

    if (mp3Files.length === 0) continue;

    const meta = getStyleMeta(entry.name);
    const tracks: Track[] = mp3Files.map((file, index) => {
      const filePath = path.join(styleDir, file);
      const stats = fs.statSync(filePath);
      // Estimate duration from file size (128kbps = 16KB/s)
      const estimatedDuration = Math.round(stats.size / 16000);

      return {
        id: `${entry.name}-${index}`,
        title: `${meta.name} #${index + 1}`,
        src: `${BGM_PUBLIC_PREFIX}/${entry.name}/${file}`,
        duration: estimatedDuration,
      };
    });

    styles.push({
      id: entry.name,
      name: meta.name,
      icon: meta.icon,
      description: meta.description,
      tracks,
    });
  }

  return styles;
}
