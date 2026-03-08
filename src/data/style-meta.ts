// Display metadata for known BGM style directories
// Unknown directories will use a generic display

interface StyleMeta {
  name: string;
  icon: string;
  description: string;
}

const styleMeta: Record<string, StyleMeta> = {
  morning_reading: {
    name: "Morning Reading",
    icon: "🌅",
    description: "Soft and soothing, perfect for early reading",
  },
  piano_rain: {
    name: "Piano & Rain",
    icon: "🎹",
    description: "Piano blended with rain, immersive study",
  },
  lofi: {
    name: "Lo-Fi",
    icon: "🎧",
    description: "Lo-fi beats, easy focus",
  },
  ambient: {
    name: "Ambient",
    icon: "🌊",
    description: "Natural white noise, quiet immersion",
  },
  classical: {
    name: "Classical",
    icon: "🎻",
    description: "Classical pieces, elegant focus",
  },
  cafe: {
    name: "Cafe",
    icon: "☕",
    description: "Cafe vibes, relaxed study",
  },
};

const defaultMeta: StyleMeta = {
  name: "",
  icon: "🎵",
  description: "AI-generated focus music",
};

export function getStyleMeta(dirName: string): StyleMeta {
  if (styleMeta[dirName]) return styleMeta[dirName];
  // Generate a readable name from directory name
  const name = dirName
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { ...defaultMeta, name };
}
