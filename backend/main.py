from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from typing import List, Dict, Any
import numpy as np


app = FastAPI(
    title="ML Sonoscope API",
    description="Simple ML powered data endpoint for sonification",
    version="0.1.0",
)

# Adjust this when your frontend runs somewhere else
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_dataset() -> Dict[str, Any]:
    """Load Iris, run simple ML, return front end friendly structure."""
    iris = load_iris()
    X = iris.data  # shape (150, 4)
    feature_names = iris.feature_names  # list of strings

    # Standardize features for ML
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 2D embedding with PCA
    pca = PCA(n_components=2, random_state=42)
    X_emb = pca.fit_transform(X_scaled)

    # Normalize embedding to [0, 1] so we can map to synth params
    emb_scaler = MinMaxScaler()
    emb_norm = emb_scaler.fit_transform(X_emb)

    # Simple clustering
    kmeans = KMeans(n_clusters=4, random_state=42, n_init="auto")
    clusters = kmeans.fit_predict(X_scaled)

    points: List[Dict[str, Any]] = []

    for idx, row in enumerate(X):
        features = {
            feature_names[i].replace(" ", "_").replace("(", "").replace(")", ""): float(
                row[i]
            )
            for i in range(len(feature_names))
        }

        point = {
            "id": idx,
            "features": features,
            "embedding": {
                "x": float(emb_norm[idx, 0]),
                "y": float(emb_norm[idx, 1]),
            },
            "cluster": int(clusters[idx]),
        }
        points.append(point)

    return {"points": points}


@app.get("/data")
def get_data():
    """
    Return ML processed dataset in a format that is easy to sonify on the front end.

    Response shape:
    {
      "points": [
        {
          "id": 0,
          "features": { "sepal_length_cm": 5.1, ... },
          "embedding": { "x": 0.12, "y": 0.78 },
          "cluster": 2
        },
        ...
      ]
    }
    """
    return build_dataset()
