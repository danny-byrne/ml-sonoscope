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
