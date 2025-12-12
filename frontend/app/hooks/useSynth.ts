"use client";

import * as Tone from "tone";
import { useRef, useState } from "react";
import { Point } from "../types";
import { DETUNE_MAP, getFrequencyFromEmbedding } from "../constants";

export function useSynth() {
  const synthRef = useRef<Tone.Synth | null>(null);
  const scheduledEventsRef = useRef<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playPoint = async (point: Point) => {
    await Tone.start();

    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().toDestination();
    }
    const synth = synthRef.current;

    const { embedding, cluster } = point;

    const freq = getFrequencyFromEmbedding(embedding);
    const detune = DETUNE_MAP[cluster % DETUNE_MAP.length];

    synth.detune.value = detune * 100;
    synth.triggerAttackRelease(freq, "8n", Tone.now());
  };

  const playAll = async (points: Point[]) => {
    if (!points.length || isPlaying) return;

    setIsPlaying(true);

    await Tone.start();

    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().toDestination();
    }
    const synth = synthRef.current;

    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel(0);

    scheduledEventsRef.current = [];

    const step = 0.25;

    points.forEach((p, i) => {
      const { embedding, cluster } = p;

      const freq = getFrequencyFromEmbedding(embedding);
      const detune = DETUNE_MAP[cluster % DETUNE_MAP.length];

      const time = i * step;

      const eventId = transport.schedule((t) => {
        synth.detune.value = detune * 100;
        synth.triggerAttackRelease(freq, "8n", t);
      }, time);

      scheduledEventsRef.current.push(eventId);
    });

    transport.start();

    const totalDuration = points.length * step;
    setTimeout(() => setIsPlaying(false), totalDuration * 1000 + 200);
  };

  const stopAll = () => {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel(0);
    scheduledEventsRef.current = [];
    setIsPlaying(false);
  };

  return { playPoint, playAll, stopAll, isPlaying };
}
