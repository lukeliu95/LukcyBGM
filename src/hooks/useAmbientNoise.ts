"use client";

import { useRef, useCallback, useEffect } from "react";
import { AMBIENT_SOUNDS } from "@/data/ambientSounds";

export type SoundId = string;

const soundMap = new Map(AMBIENT_SOUNDS.map((s) => [s.id, s]));

export function useAmbientNoise() {
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const getOrCreate = useCallback((id: string): HTMLAudioElement | null => {
    const sound = soundMap.get(id);
    if (!sound) return null;

    let el = audioElementsRef.current.get(id);
    if (!el) {
      const baseUrl = process.env.NEXT_PUBLIC_BGM_BASE_URL ?? "/api/bgm";
      el = new Audio(`${baseUrl}/ambient/${sound.filename}`);
      el.preload = "none";
      el.loop = true;
      audioElementsRef.current.set(id, el);
    }
    return el;
  }, []);

  const play = useCallback(
    (id: string, volume: number) => {
      const el = getOrCreate(id);
      if (!el) return;
      el.volume = Math.max(0, Math.min(1, volume));
      el.play().catch(() => {});
    },
    [getOrCreate]
  );

  const stop = useCallback((id: string) => {
    const el = audioElementsRef.current.get(id);
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, []);

  const setVolume = useCallback((id: string, volume: number) => {
    const el = audioElementsRef.current.get(id);
    if (el) {
      el.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const pauseAll = useCallback(() => {
    audioElementsRef.current.forEach((el) => {
      el.pause();
    });
  }, []);

  const stopAll = useCallback(() => {
    audioElementsRef.current.forEach((el) => {
      el.pause();
      el.currentTime = 0;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const audioElements = audioElementsRef.current;
    return () => {
      audioElements.forEach((el) => {
        el.pause();
        el.src = "";
      });
      audioElements.clear();
    };
  }, []);

  return { play, stop, setVolume, pauseAll, stopAll };
}
