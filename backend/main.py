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

# Adjust this when frontend runs somewhere else
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
    X = iris.data  # shape (150, 4), numeric data matrix, 150 rows and 4 columns
    feature_names = iris.feature_names  # human friendly names of each column

    # Standardize features for ML
    scaler = StandardScaler() # centers and scales each feature sso that mean is about 0, standard deviateion is 1

    # learns the mean and variance of each feature in X and rescales the data so every feature has mean 0 and standard deviation 1, ensuring that PCA and KMeans treat all features fairly.
    X_scaled = scaler.fit_transform(X) 

    # 2D embedding with PCA
    # PCA finds two orthogonal directions that explain the most variance in the standardized data.
    pca = PCA(n_components=2, random_state=42)
    X_emb = pca.fit_transform(X_scaled) # X_emb, which is 150 rows and 2 columns.

    # Normalize embedding to [0, 1] so we can map to synth params
    # MinMaxScaler linearly rescales each PCA dimension so the minimum becomes 0 and the maximum becomes 1.
    emb_scaler = MinMaxScaler()
    # X_emb is in arbitrary units, possibly negative, with no fixed bounds.
    emb_norm = emb_scaler.fit_transform(X_emb)

    # Simple clustering
    # KMeans tries to partition the standardized data into n_clusters groups.
    kmeans = KMeans(n_clusters=4, random_state=42, n_init="auto")
    # fit_predict both learns the cluster centers and assigns a cluster index to each sample.
    # clusters, a vector of length 150 with values 0, 1, 2, or 3.
    clusters = kmeans.fit_predict(X_scaled)

    # front end friendly points array
    points: List[Dict[str, Any]] = []

    #  turns the orignial feature vector for that row into a dictionary like: 
    #     {
    #       "sepal_length_cm": 5.1,
    #       "sepal_width_cm": 3.5,
    #       "petal_length_cm": 1.4,
    #       "petal_width_cm": 0.2
    #     }

    for idx, row in enumerate(X):
        features = {
            # The replace calls just clean up spaces and parentheses so you have nice JSON keys.
            feature_names[i].replace(" ", "_").replace("(", "").replace(")", ""): float(
                row[i]
            )
            for i in range(len(feature_names))
        }

        # Packs the normalized PCA coordinates into:

        #     "embedding": { "x": 0.12, "y": 0.78 }

        point = {
            "id": idx,
            "features": features,
            "embedding": {
                "x": float(emb_norm[idx, 0]),
                "y": float(emb_norm[idx, 1]),
            },
            # "cluster": 2
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
