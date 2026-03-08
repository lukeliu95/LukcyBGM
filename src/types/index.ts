export interface Track {
  id: string;
  title: string;
  src: string;
  duration: number; // seconds
}

export interface MusicStyle {
  id: string; // directory name
  name: string; // display name
  icon: string;
  description: string;
  tracks: Track[];
}

export interface Recommendation {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
}
