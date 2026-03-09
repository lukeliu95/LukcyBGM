export interface AmbientSound {
  id: string;
  label: string;
  icon: string;
  filename: string;
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: "rain",     label: "Rain",        icon: "🌧️", filename: "rain.mp3" },
  { id: "thunder",  label: "Thunder",     icon: "⛈️", filename: "thunder.mp3" },
  { id: "wind",     label: "Wind",        icon: "💨", filename: "wind.mp3" },
  { id: "fire",     label: "Fireplace",   icon: "🔥", filename: "fire.mp3" },
  { id: "birds",    label: "Birds",       icon: "🐦", filename: "birds.mp3" },
  { id: "waves",    label: "Ocean Waves", icon: "🏖️", filename: "waves.mp3" },
  { id: "river",    label: "River",       icon: "🏞️", filename: "river.mp3" },
  { id: "crickets", label: "Crickets",    icon: "🦗", filename: "crickets.mp3" },
  { id: "train",    label: "Train",       icon: "🚂", filename: "train.mp3" },
];

// mix: Record<id, volume 0-1>, absent id = not playing
export interface Preset {
  id: string;
  label: string;
  mix: Record<string, number>;
}

export const PRESETS: Preset[] = [
  { id: "deep-focus",   label: "Deep Focus",   mix: { rain: 0.4, river: 0.3 } },
  { id: "cozy-cabin",   label: "Cozy Cabin",   mix: { fire: 0.5, rain: 0.4, wind: 0.2 } },
  { id: "nature",       label: "Nature",       mix: { birds: 0.5, river: 0.4, wind: 0.2 } },
  { id: "night-study",  label: "Night Study",  mix: { crickets: 0.5, wind: 0.2 } },
  { id: "coffee-shop",  label: "Coffee Shop",  mix: { rain: 0.4, fire: 0.3 } },
  { id: "train-ride",   label: "Train Ride",   mix: { train: 0.6, rain: 0.3 } },
];
