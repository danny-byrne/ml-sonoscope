"use client";

import * as Tone from "tone";
import { useRef, useState } from "react";
import { Point } from "../types";
import {
  DETUNE_MAP,
  getFrequencyFromEmbedding,
  getPanFromEmbedding,
  getFrequencyForPoint,
  getDetuneForPoint,
  MappingPresetId,
} from "../constants";

export function useSynth() {
  const synthRef = useRef<Tone.Synth | null>(null);
  const pannerRef = useRef<Tone.Panner | null>(null);
  const scheduledEventsRef = useRef<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const ensureSynthChain = () => {
    if (!pannerRef.current) {
      pannerRef.current = new Tone.Panner(0).toDestination();
    }

    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().connect(pannerRef.current);
    }
  };

  const playPoint = async (point: Point, preset: MappingPresetId) => {
    await Tone.start();

    ensureSynthChain();

    const synth = synthRef.current!;
    const panner = pannerRef.current!;

    const { embedding } = point;

    const freq = getFrequencyForPoint(point, preset);
    const detune = getDetuneForPoint(point, preset);
    const pan = getPanFromEmbedding(embedding);

    panner.pan.value = pan;
    synth.detune.value = detune * 100;
    synth.triggerAttackRelease(freq, "8n", Tone.now());
  };

  const playAll = async (points: Point[], preset: MappingPresetId) => {
    if (!points.length || isPlaying) return;

    setIsPlaying(true);

    await Tone.start();
    ensureSynthChain();

    const synth = synthRef.current!;
    const panner = pannerRef.current!;
    const transport = Tone.getTransport();

    transport.stop();
    transport.cancel(0);

    scheduledEventsRef.current = [];

    const step = 0.25;

    points.forEach((p, i) => {
      const { embedding } = p;

      const freq = getFrequencyForPoint(p, preset);
      const detune = getDetuneForPoint(p, preset);
      const pan = getPanFromEmbedding(embedding);

      const time = i * step;

      const eventId = transport.schedule((t) => {
        panner.pan.value = pan;
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
