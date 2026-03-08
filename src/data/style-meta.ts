// Display metadata for known BGM style directories
// Unknown directories will use a generic display

interface StyleMeta {
  name: string;
  icon: string;
  description: string;
}

const styleMeta: Record<string, StyleMeta> = {
  morning_reading: {
    name: "晨读",
    icon: "🌅",
    description: "轻柔舒缓，适合早起阅读",
  },
  piano_rain: {
    name: "钢琴雨声",
    icon: "🎹",
    description: "钢琴与雨声交织，沉浸备考",
  },
  lofi: {
    name: "Lo-Fi",
    icon: "🎧",
    description: "lo-fi beats，轻松专注",
  },
  ambient: {
    name: "环境音",
    icon: "🌊",
    description: "自然白噪音，安静沉浸",
  },
  classical: {
    name: "古典",
    icon: "🎻",
    description: "古典乐章，优雅专注",
  },
  cafe: {
    name: "咖啡馆",
    icon: "☕",
    description: "咖啡馆氛围，放松学习",
  },
};

const defaultMeta: StyleMeta = {
  name: "",
  icon: "🎵",
  description: "AI 生成的专注音乐",
};

export function getStyleMeta(dirName: string): StyleMeta {
  if (styleMeta[dirName]) return styleMeta[dirName];
  // Generate a readable name from directory name
  const name = dirName
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { ...defaultMeta, name };
}
