export type Embedding = {
  x: number;
  y: number;
};

export type Point = {
  id: number;
  features: Record<string, number>;
  embedding: Embedding;
  cluster: number;
};
