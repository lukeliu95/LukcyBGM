// VIRTUAL JAPAN (@VIRTUALJAPAN) channel curated videos
// Source: YouTube RSS feed + playboard.co (verified)
// Channel: https://www.youtube.com/@VIRTUALJAPAN
// All videos are 16:9 landscape format, 4K/8K HDR walking tours

export interface VideoSource {
  id: string;
  title: string;
}

export const VIRTUAL_JAPAN_VIDEOS: VideoSource[] = [
  { id: "m4KJsovz1TQ", title: "Tokyo Cherry Blossoms 2026 - Early March Sakura - 4K HDR" },
  { id: "PS4rLoKq1lE", title: "Tokyo Early Cherry Blossoms 2026 - Kawazu Sakura Walk - 4K HDR" },
  { id: "fnF1g-URa-M", title: "Tokyo Skytree to Sensoji Temple: Last Winter Illuminations 2026 - 4K HDR" },
  { id: "GFmcThdhN8s", title: "Christmas Eve in Tokyo: Shibuya, Harajuku, Omotesando Illuminations" },
  { id: "yU6QaF0V8ZA", title: "Tokyo Christmas Lights 2025 - SHINJUKU" },
  { id: "HhNl-5egcLg", title: "Tokyo Christmas Lights 2025 - Hibiya, Ebisu, Ikebukuro" },
  { id: "AxxCWjtquNQ", title: "Tokyo Christmas Lights 2025 - Roppongi & Ueno Park Illuminations" },
  { id: "E3wuXi77mDI", title: "Night Walk through Tokyo's Trendiest Bohemian Neighborhood, Shimokitazawa 2025" },
  { id: "NrfjbhrleOY", title: "Exploring Tokyo's Best After Work Drinking Areas, Shimbashi & Yurakucho" },
  { id: "oGfg0_Lti9M", title: "2025 Tokyo's BEST Night Spots - Shinjuku-sanchome & Akabane - 4K HDR" },
  { id: "Z5XlCRHWn7I", title: "2025 Tokyo Fireworks Season Begins - 4K HDR" },
  { id: "JsTLU-BtOWc", title: "Wandering Tokyo's Anime and Gaming District, Akihabara in 2025" },
  { id: "q3ebxOwxSHE", title: "Tokyo Summer Flowers in Bloom - Ajisai & Azaleas - 4K HDR" },
  { id: "8j-nmwy0RN4", title: "Exploring Tokyo's Greatest Temple, Sensoji - 4K HDR" },
  { id: "J1c0hrrYhhc", title: "4K HDR - Osaka Downtown Night Walk 2025" },
  { id: "-wEnQzysekE", title: "4K HDR Memories of Tokyo Sakura 2025" },
  { id: "F1RNi5GYH5g", title: "4K HDR - Tokyo Night Walk in Shibuya - Spring 2025" },
  { id: "v14pFiPOxrA", title: "Tokyo Summer Evening Rain Storm - Thunder & Lightning" },
  { id: "9CJLtzzUphU", title: "4K HDR // Tokyo Snowy Night Walk - Shibuya to Shinjuku" },
  { id: "qgfd-uWTVwg", title: "Walk in Kyoto Midnight Rainstorm - 4K HDR" },
  { id: "kZN2yTa1HcY", title: "4K HDR Japan Cherry Blossoms - Kawazu Sakura" },
  { id: "dGy_6qyyY7c", title: "4K HDR Walk in Heavy Rain at Night in Tokyo, Japan" },
  { id: "CFomo2zQyNg", title: "4K HDR // Japan's Best Illuminations near Tokyo after New Year" },
];

/** Pick a random video (excluding a given ID) */
export function getRandomVideo(excludeId?: string): VideoSource {
  const pool = excludeId
    ? VIRTUAL_JAPAN_VIDEOS.filter((v) => v.id !== excludeId)
    : VIRTUAL_JAPAN_VIDEOS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
