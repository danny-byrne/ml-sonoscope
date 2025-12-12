import { Point } from "./types";

// Frequency mapping
export const MIN_FREQ = 200;
export const MAX_FREQ = 1000;

// Cluster detunes (semitones)
export const DETUNE_MAP = [-12, 0, 7, 12];

// Helpers
export const getFrequencyFromEmbedding = (embedding: {
  x: number;
  y: number;
}) => {
  return MIN_FREQ + embedding.y * (MAX_FREQ - MIN_FREQ);
};

// Map embedding.x in [0, 1] to pan in [-1, 1]
export const getPanFromEmbedding = (embedding: { x: number; y: number }) => {
  return embedding.x * 2 - 1;
};

// ---- Presets ----

export type MappingPresetId = "pca" | "clusterChords";

export const MAPPING_PRESETS: { id: MappingPresetId; label: string }[] = [
  { id: "pca", label: "PCA: pitch = PCA Y, pan = PCA X" },
  { id: "clusterChords", label: "Cluster chords" },
];

// Helper: get frequency per preset
export const getFrequencyForPoint = (point: Point, preset: MappingPresetId) => {
  switch (preset) {
    case "pca":
      return getFrequencyFromEmbedding(point.embedding);
    case "clusterChords": {
      // Simple fixed chord tones by cluster
      const freqs = [220, 261.63, 329.63, 392]; // A3, C4, E4, G4
      return freqs[point.cluster % freqs.length];
    }
    default:
      return getFrequencyFromEmbedding(point.embedding);
  }
};

// Helper: get detune per preset
export const getDetuneForPoint = (point: Point, preset: MappingPresetId) => {
  switch (preset) {
    case "pca":
      return DETUNE_MAP[point.cluster % DETUNE_MAP.length];
    case "clusterChords":
      // chords already encoded in base freq, so keep detune neutral
      return 0;
    default:
      return 0;
  }
};
