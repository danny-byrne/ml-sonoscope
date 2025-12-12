"use client";

import { Point } from "../types";

type PointListProps = {
  points: Point[];
  onPlay: (p: Point) => void;
};

export default function PointList({ points, onPlay }: PointListProps) {
  return (
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
                  onClick={() => onPlay(p)}
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
  );
}
