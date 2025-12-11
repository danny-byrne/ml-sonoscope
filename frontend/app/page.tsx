"use client";

import { useEffect, useState } from "react";

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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">ML Sonoscope</h1>

      {loading && <p>Loading data from backend...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <p>Loaded {points.length} points.</p>
          <div className="max-h-64 overflow-auto border p-3 text-xs w-full max-w-xl">
            <pre>{JSON.stringify(points.slice(0, 5), null, 2)}</pre>
          </div>
        </>
      )}
    </main>
  );
}
