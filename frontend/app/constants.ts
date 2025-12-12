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
