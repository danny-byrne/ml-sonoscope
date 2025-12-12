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

const minFreq = 200;
const maxFreq = 1000;
const detuneMap = [-12, 0, 7, 12];
const getFreq = (embedding: any) => {
  return minFreq + embedding.y * (maxFreq - minFreq);
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

  const transport = Tone.getTransport();

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

    // reset scheduled ref
    scheduledEventsRef.current = [];

    // clear any previous scheduled events
    scheduledEventsRef.current.forEach((id) => Tone.Transport.clear(id));
    scheduledEventsRef.current = [];

    transport.stop();
    transport.cancel(); // fully clear timeline

    const step = 0.25; // seconds between notes

    points.forEach((p, index) => {
      const { embedding, cluster } = p;

      const freq = getFreq(embedding);

      const detune = detuneMap[cluster % detuneMap.length];

      const time = index * step;

      const eventId = transport.schedule((t) => {
        synth.detune.value = detune * 100;
        synth.triggerAttackRelease(freq, "8n", t);
      }, time);

      scheduledEventsRef.current.push(eventId);
    });

    transport.start();

    const totalDuration = points.length * step;
    setTimeout(() => {
      setIsPlaying(false);
    }, totalDuration * 1000 + 200);
  };

  const stopAll = () => {
    transport.stop();
    transport.cancel(); // wipe timeline

    scheduledEventsRef.current = [];
    setIsPlaying(false);
  };

  const playPoint = async (point: Point) => {
    await Tone.start();

    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().toDestination();
    }
    const synth = synthRef.current;

    const { embedding, cluster } = point;

    const freq = getFreq(embedding);

    const detune = detuneMap[cluster % detuneMap.length];

    synth.detune.value = detune * 100;
    synth.triggerAttackRelease(freq, "8n", Tone.now());
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
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left pr-2">ID</th>
                  <th className="text-left pr-2">Cluster</th>
                  <th className="text-left pr-2">x</th>
                  <th className="text-left pr-2">y</th>
                  <th className="text-left pr-2">Play</th>
                </tr>
              </thead>
              <tbody>
                {points.slice(0, 30).map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-100">
                    <td className="pr-2">{p.id}</td>
                    <td className="pr-2">{p.cluster}</td>
                    <td className="pr-2">{p.embedding.x.toFixed(2)}</td>
                    <td className="pr-2">{p.embedding.y.toFixed(2)}</td>
                    <td className="pr-2">
                      <button
                        onClick={() => playPoint(p)}
                        className="px-2 py-1 border rounded"
                      >
                        ▶
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
