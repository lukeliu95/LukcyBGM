"use client";

import { useRef, useCallback, useEffect } from "react";

export type NoiseType = "white" | "brown" | "pink";

interface NoiseChannel {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

const BUFFER_SIZE = 2 * 44100; // 2 seconds at 44.1kHz

function generateNoiseBuffer(
  ctx: AudioContext,
  type: NoiseType
): AudioBuffer {
  const buffer = ctx.createBuffer(1, BUFFER_SIZE, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  switch (type) {
    case "white":
      for (let i = 0; i < BUFFER_SIZE; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      break;

    case "brown": {
      let last = 0;
      for (let i = 0; i < BUFFER_SIZE; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5; // compensate for volume
      }
      break;
    }

    case "pink": {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < BUFFER_SIZE; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
      break;
    }
  }

  return buffer;
}

export function useAmbientNoise() {
  const ctxRef = useRef<AudioContext | null>(null);
  const channelsRef = useRef<Map<NoiseType, NoiseChannel>>(new Map());
  const buffersRef = useRef<Map<NoiseType, AudioBuffer>>(new Map());

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const getBuffer = useCallback(
    (ctx: AudioContext, type: NoiseType) => {
      if (!buffersRef.current.has(type)) {
        buffersRef.current.set(type, generateNoiseBuffer(ctx, type));
      }
      return buffersRef.current.get(type)!;
    },
    []
  );

  const play = useCallback(
    (type: NoiseType, volume: number) => {
      // Stop existing channel of this type
      const existing = channelsRef.current.get(type);
      if (existing) {
        existing.source.stop();
        existing.gain.disconnect();
      }

      const ctx = getContext();
      const buffer = getBuffer(ctx, type);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = ctx.createGain();
      gain.gain.value = volume;

      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();

      channelsRef.current.set(type, { source, gain });
    },
    [getContext, getBuffer]
  );

  const stop = useCallback((type: NoiseType) => {
    const channel = channelsRef.current.get(type);
    if (channel) {
      channel.gain.gain.linearRampToValueAtTime(
        0,
        ctxRef.current?.currentTime
          ? ctxRef.current.currentTime + 0.1
          : 0
      );
      setTimeout(() => {
        try {
          channel.source.stop();
          channel.gain.disconnect();
        } catch {
          // already stopped
        }
        channelsRef.current.delete(type);
      }, 150);
    }
  }, []);

  const setVolume = useCallback((type: NoiseType, volume: number) => {
    const channel = channelsRef.current.get(type);
    if (channel && ctxRef.current) {
      channel.gain.gain.linearRampToValueAtTime(
        volume,
        ctxRef.current.currentTime + 0.05
      );
    }
  }, []);

  const stopAll = useCallback(() => {
    channelsRef.current.forEach((_, type) => stop(type));
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach((channel) => {
        try {
          channel.source.stop();
          channel.gain.disconnect();
        } catch {
          // already stopped
        }
      });
      channelsRef.current.clear();
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  return { play, stop, setVolume, stopAll };
}
