"use client";

import { useEffect, useState } from "react";
import { Point } from "./types";
import ScatterPlot from "./components/Scatterplot";
import PointList from "./components/PointList";
import { useSynth } from "./hooks/useSynth";

import MappingPresetSelector from "./components/MappingPresetSelector";
import { MappingPresetId } from "./constants";

export default function Home() {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<MappingPresetId>("pca");

  const { playPoint, playAll, stopAll, isPlaying } = useSynth();

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/data");
        const json = await res.json();
        setPoints(json.points);
      } catch (err: any) {
        setError(err.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold">ML Sonoscope</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex gap-4">
            <button
              onClick={() => playAll(points, presetId)}
              disabled={isPlaying}
              className="px-4 py-2 border rounded"
            >
              {isPlaying ? "Playing…" : "Play All"}
            </button>

            <button
              onClick={stopAll}
              disabled={!isPlaying}
              className="px-4 py-2 border rounded"
            >
              Stop
            </button>

            <MappingPresetSelector presetId={presetId} onChange={setPresetId} />
          </div>

          <ScatterPlot
            points={points}
            onPointClick={(p) => playPoint(p, presetId)}
          />

          <PointList points={points} onPlay={(p) => playPoint(p, presetId)} />
        </>
      )}
    </main>
  );
}
