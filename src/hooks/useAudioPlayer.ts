"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { MusicStyle, Track } from "@/types";

const FADE_DURATION = 1000;
const FADE_STEPS = 20;

export function useAudioPlayer() {
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<"A" | "B">("A");
  const volumeRef = useRef(0.7);
  const styleRef = useRef<MusicStyle | null>(null);
  const trackIndexRef = useRef(0);
  const fadeTimersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);

  useEffect(() => {
    if (typeof window === "undefined") return;
    audioARef.current = new Audio();
    audioBRef.current = new Audio();
    audioARef.current.volume = 0;
    audioBRef.current.volume = 0;
    audioARef.current.preload = "auto";
    audioBRef.current.preload = "auto";

    return () => {
      audioARef.current?.pause();
      audioBRef.current?.pause();
      fadeTimersRef.current.forEach(clearInterval);
    };
  }, []);

  const getActive = useCallback(() => {
    return activeRef.current === "A" ? audioARef.current : audioBRef.current;
  }, []);

  const getInactive = useCallback(() => {
    return activeRef.current === "A" ? audioBRef.current : audioARef.current;
  }, []);

  const clearFadeTimers = useCallback(() => {
    fadeTimersRef.current.forEach(clearInterval);
    fadeTimersRef.current = [];
  }, []);

  const fadeOut = useCallback((audio: HTMLAudioElement) => {
    const startVolume = audio.volume;
    if (startVolume <= 0) {
      audio.pause();
      return;
    }
    const step = startVolume / FADE_STEPS;
    const interval = FADE_DURATION / FADE_STEPS;
    const timer = setInterval(() => {
      const newVol = audio.volume - step;
      if (newVol <= 0.01) {
        audio.volume = 0;
        audio.pause();
        clearInterval(timer);
        fadeTimersRef.current = fadeTimersRef.current.filter((t) => t !== timer);
      } else {
        audio.volume = newVol;
      }
    }, interval);
    fadeTimersRef.current.push(timer);
  }, []);

  const fadeIn = useCallback((audio: HTMLAudioElement, targetVolume: number) => {
    audio.volume = 0;
    const step = targetVolume / FADE_STEPS;
    const interval = FADE_DURATION / FADE_STEPS;

    const startFade = () => {
      const timer = setInterval(() => {
        const newVol = audio.volume + step;
        if (newVol >= targetVolume - 0.01) {
          audio.volume = targetVolume;
          clearInterval(timer);
          fadeTimersRef.current = fadeTimersRef.current.filter((t) => t !== timer);
        } else {
          audio.volume = newVol;
        }
      }, interval);
      fadeTimersRef.current.push(timer);
    };

    // Delay slightly to avoid Chrome power-saving interruption with YouTube video
    setTimeout(() => {
      audio.play()
        .then(() => startFade())
        .catch(() => {
          // Retry after delay if first attempt fails
          setTimeout(() => {
            audio.play().then(() => startFade()).catch(() => {});
          }, 1000);
        });
    }, 200);
  }, []);

  const setupAutoNext = useCallback((audio: HTMLAudioElement) => {
    audio.onended = () => {
      const style = styleRef.current;
      if (!style || style.tracks.length <= 1) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      let nextIndex: number;
      do {
        nextIndex = Math.floor(Math.random() * style.tracks.length);
      } while (nextIndex === trackIndexRef.current);
      trackIndexRef.current = nextIndex;
      audio.src = style.tracks[nextIndex].src;
      audio.play().catch(() => {});
    };
  }, []);

  const crossfadeTo = useCallback(
    (track: Track) => {
      const current = getActive();
      const next = getInactive();
      if (!current || !next) return;

      clearFadeTimers();
      next.src = track.src;
      next.currentTime = 0;
      setupAutoNext(next);
      fadeOut(current);
      fadeIn(next, volumeRef.current);
      activeRef.current = activeRef.current === "A" ? "B" : "A";
    },
    [getActive, getInactive, clearFadeTimers, fadeOut, fadeIn, setupAutoNext]
  );

  const play = useCallback(
    (style: MusicStyle) => {
      styleRef.current = style;
      const startIndex = Math.floor(Math.random() * style.tracks.length);
      trackIndexRef.current = startIndex;

      const audio = getActive();
      if (!audio || style.tracks.length === 0) return;

      clearFadeTimers();
      audio.src = style.tracks[startIndex].src;
      audio.currentTime = 0;
      setupAutoNext(audio);
      fadeIn(audio, volumeRef.current);
      setIsPlaying(true);
    },
    [getActive, clearFadeTimers, fadeIn, setupAutoNext]
  );

  const pause = useCallback(() => {
    const audio = getActive();
    if (audio) audio.pause();
    setIsPlaying(false);
  }, [getActive]);

  const resume = useCallback(() => {
    const audio = getActive();
    if (audio) audio.play().catch(() => {});
    setIsPlaying(true);
  }, [getActive]);

  const setVolume = useCallback(
    (v: number) => {
      volumeRef.current = v;
      setVolumeState(v);
      const audio = getActive();
      if (audio) audio.volume = v;
    },
    [getActive]
  );

  const stop = useCallback(() => {
    clearFadeTimers();
    audioARef.current?.pause();
    audioBRef.current?.pause();
    if (audioARef.current) {
      audioARef.current.volume = 0;
      audioARef.current.src = "";
    }
    if (audioBRef.current) {
      audioBRef.current.volume = 0;
      audioBRef.current.src = "";
    }
    activeRef.current = "A";
    setIsPlaying(false);
  }, [clearFadeTimers]);

  return {
    play,
    pause,
    resume,
    stop,
    setVolume,
    crossfadeTo,
    isPlaying,
    volume,
  };
}
