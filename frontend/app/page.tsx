"use client";
import * as Tone from "tone";

import { useEffect, useState, useRef } from "react";

type Embedding = {
  x: number;
  y: number;
};

type Point = {
  id: number;
  features: Record<string, number>;
  embedding: Embedding;
  cluster: number;
};

type DataResponse = {
  points: Point[];
};

export default function Home() {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const synthRef = useRef<Tone.Synth | null>(null);
  const scheduledEventsRef = useRef<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://127.0.0.1:8000/data");
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const json: DataResponse = await res.json();
        setPoints(json.points);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const playAll = async () => {
    if (!points.length) return;
    if (isPlaying) return;

    setIsPlaying(true);

    await Tone.start();

    // create synth if not existing
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().toDestination();
    }

    const synth = synthRef.current;

    // clear any previous scheduled events
    scheduledEventsRef.current.forEach((id) => Tone.Transport.clear(id));
    scheduledEventsRef.current = [];

    Tone.Transport.stop();
    Tone.Transport.cancel(); // fully clear timeline

    const step = 0.25; // seconds between notes

    points.forEach((p, index) => {
      const { embedding, cluster } = p;

      const minFreq = 200;
      const maxFreq = 1000;
      const freq = minFreq + embedding.y * (maxFreq - minFreq);

      const detuneMap = [-12, 0, 7, 12];
      const detune = detuneMap[cluster % detuneMap.length];

      const time = index * step;

      const eventId = Tone.Transport.schedule((t) => {
        synth.detune.value = detune * 100;
        synth.triggerAttackRelease(freq, "8n", t);
      }, time);

      scheduledEventsRef.current.push(eventId);
    });

    Tone.Transport.start();

    const totalDuration = points.length * step;
    setTimeout(() => {
      setIsPlaying(false);
    }, totalDuration * 1000 + 200);
  };

  const stopAll = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel(); // wipe timeline

    scheduledEventsRef.current = [];
    setIsPlaying(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">ML Sonoscope</h1>

      {loading && <p>Loading data from backend...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <p>Loaded {points.length} points.</p>
          <button
            onClick={playAll}
            disabled={!points.length || isPlaying}
            className="px-4 py-2 rounded border"
          >
            {isPlaying ? "Playing..." : "Play all points"}
          </button>
          <button
            onClick={stopAll}
            disabled={!isPlaying}
            className="px-4 py-2 rounded border"
          >
            Stop
          </button>
          <div className="max-h-64 overflow-auto border p-3 text-xs w-full max-w-xl">
            <pre>{JSON.stringify(points.slice(0, 5), null, 2)}</pre>
          </div>
        </>
      )}
    </main>
  );
}
