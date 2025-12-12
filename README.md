# ML Sonoscope

**ML Sonoscope** is an interactive web application that explores how machine-learning representations can be translated into sound.  
It combines a lightweight ML pipeline with real-time audio synthesis and visualization, allowing users to _listen_ to data as well as see it.

The project was built as a creative-coding and audio-engineering portfolio piece, with an emphasis on clarity, modularity, and extensibility.

---

## Overview

The system is split into two parts:

- **Backend (FastAPI + scikit-learn)**  
  Performs feature preprocessing, dimensionality reduction, and clustering, then exposes the processed data via a JSON API.

- **Frontend (Next.js + React + Tone.js)**  
  Visualizes the data as an interactive scatterplot and sonifies it in real time using configurable mapping presets.

Each data point can be played individually, or the entire dataset can be sequenced as a sonic sweep.

---

## Machine Learning Pipeline

The backend exposes a single endpoint:

When requested, it runs the following pipeline:

1. **Dataset loading / generation**  
   A small numeric dataset (currently Iris or synthetic numeric data).

2. **Feature standardization**  
   All features are standardized to zero mean and unit variance to ensure fair treatment across dimensions.

3. **Dimensionality reduction (PCA)**  
   Principal Component Analysis reduces the data to two dimensions, producing a 2D embedding suitable for visualization and audio mapping.

4. **Clustering (KMeans)**  
   Each point is assigned a cluster label, used later to drive discrete sonic variations.

5. **Normalization for sonification**  
   PCA outputs are normalized to the range `[0, 1]` so they can be directly mapped to audio parameters.

The API returns data in the following shape:

```json
{
  "points": [
    {
      "id": 0,
      "features": {
        "feature_0": 1.23,
        "feature_1": -0.42
      },
      "embedding": {
        "x": 0.34,
        "y": 0.78
      },
      "cluster": 2
    }
  ]
}
```

## Sonification Design

The frontend translates ML outputs into sound using a small, configurable mapping system.

### Core mappings

**Pitch**
Derived from the second PCA component (`embedding.y`), mapped linearly to a frequency range.

**Stereo panning**
Derived from the first PCA component (`embedding.x`), mapped across the stereo field.

**Timbre / detune**
Driven by cluster assignment, introducing subtle harmonic variation.

### Mapping presets

The system supports multiple mapping presets that can be changed at runtime:

**PCA mapping**
Pitch from PCA Y, pan from PCA X, detune from cluster.

**Cluster chords**
Discrete chord tones assigned per cluster.

The preset system makes it easy to explore different sonic perspectives of the same dataset.

---

## Interaction

- Click any point in the scatterplot to hear its sound.
- Play the entire dataset as a time-ordered sequence.
- Stop playback at any time.
- Switch sonification presets on the fly.

**Project Structure**

```
ml-sonoscope/
├── backend/
│   ├── main.py
│   └── ...
├── frontend/
│   └── app/
│       ├── components/
│       │   ├── ScatterPlot.tsx
│       │   ├── PointList.tsx
│       │   └── MappingPresetSelector.tsx
│       ├── hooks/
│       │   └── useSynth.ts
│       ├── constants.ts
│       ├── types.ts
│       └── page.tsx
└── README.md
```

The frontend separates concerns cleanly between visualization, audio logic, configuration, and layout.

## Running the Project

**Backend**

```
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn scikit-learn numpy pandas
uvicorn main:app --reload --port 8000
```

**Frontend**

```
cd frontend
npm install
npm run dev
```

**Then open:**

```
http://localhost:3000
```

**Motivation**

This project was built to explore the intersection of:

1. Machine learning representations

2. Interactive data visualization

3. Real-time audio synthesis

4. It is intended as a foundation for more advanced sonification tools, generative audio systems, or creative ML-driven interfaces.

**Future Extensions**

1. Additional sonification presets

2. Feature-driven pitch or rhythm mapping

3. Polyphonic voices and richer synthesis

4. Timeline scrubbing and playback control

5. Exporting sonifications as audio
