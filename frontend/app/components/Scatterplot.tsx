"use client";

import { Point } from "../types";

type ScatterPlotProps = {
  points: Point[];
  onPointClick: (p: Point) => void;
};

export default function ScatterPlot({
  points,
  onPointClick,
}: ScatterPlotProps) {
  const width = 400;
  const height = 300;
  const padding = 20;

  const clusterColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"];

  return (
    <svg
      width={width}
      height={height}
      className="border bg-white"
      viewBox={`0 0 ${width} ${height}`}
    >
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#ccc"
      />
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#ccc"
      />

      {points.map((p) => {
        const x = padding + p.embedding.x * (width - 2 * padding);
        const y = padding + (1 - p.embedding.y) * (height - 2 * padding);

        const color = clusterColors[p.cluster % clusterColors.length];

        return (
          <circle
            key={p.id}
            cx={x}
            cy={y}
            r={4}
            fill={color}
            className="cursor-pointer"
            onClick={() => onPointClick(p)}
          >
            <title>
              id: {p.id}, cluster: {p.cluster}
            </title>
          </circle>
        );
      })}
    </svg>
  );
}
