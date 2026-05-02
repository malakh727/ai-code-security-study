# Check available skillsCheck available skillsDoneHere's a complete solution with all the files you need:

# Project Structure
# my_bentoml_project/
# ├── model_metadata.yaml       # Your metadata file (provided at build time)
# ├── train_and_save.py         # Trains a dummy model and saves it
# ├── service.py                # BentoML service definition
# └── build_bento.py            # Build script that loads YAML and packages the Bento

# 1. model_metadata.yaml — Metadata loaded at build time
# yamlname: iris_classifier
# version: "1.0.0"
# description: |
#   A scikit-learn Iris flower classifier trained on the classic Iris dataset.
#   Supports setosa, versicolor, and virginica species prediction.
# labels:
#   team: ml-platform
#   stage: production
#   framework: scikit-learn

# 2. train_and_save.py — Train and save a model to the BentoML store
# python"""
# Train a simple model and save it to the BentoML model store.
# Run this once before building the Bento.
# """

import bentoml
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

def train_and_save():
    # Load data and train
    X, y = load_iris(return_X_y=True)
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=100, random_state=42)),
    ])
    pipeline.fit(X, y)

    # Save to BentoML model store
    saved_model = bentoml.sklearn.save_model(
        name="iris_classifier",
        model=pipeline,
        signatures={"predict": {"batchable": True}},
        metadata={"trained_on": "iris_dataset", "accuracy": "96%"},
    )
    print(f"Model saved: {saved_model.tag}")
    return saved_model.tag

if __name__ == "__main__":
    train_and_save()

# 3. service.py — BentoML service
# python"""
# BentoML service definition for the Iris classifier.
# """

import numpy as np
import bentoml
from bentoml.io import NumpyNdarray

# Load the latest version of the saved model
iris_runner = bentoml.sklearn.get("iris_classifier:latest").to_runner()

svc = bentoml.Service(
    name="iris_classifier_service",
    runners=[iris_runner],
)

@svc.api(
    input=NumpyNdarray(shape=(-1, 4), dtype=np.float32, enforce_shape=True),
    output=NumpyNdarray(dtype=np.int64),
)
async def predict(input_data: np.ndarray) -> np.ndarray:
    """
    Predict Iris species from input features.

    Input: Array of shape (N, 4) — [sepal_length, sepal_width, petal_length, petal_width]
    Output: Array of predicted class indices (0=setosa, 1=versicolor, 2=virginica)
    """
    return await iris_runner.predict.async_run(input_data)

# 4. build_bento.py — Build script that loads the YAML file
# This is the key script. It reads your YAML file (whose path is provided via CLI argument) and injects the metadata into bentoml.build().
# python"""
# Build a Bento while loading metadata from a YAML file provided as a CLI argument.

# Usage:
#     python build_bento.py --metadata model_metadata.yaml
# """

import argparse
import sys
import yaml
import bentoml


def load_metadata_from_yaml(yaml_path: str) -> dict:
    """Load and validate metadata from a YAML file."""
    try:
        with open(yaml_path, "r") as f:
            data = yaml.safe_load(f)
    except FileNotFoundError:
        print(f"[ERROR] Metadata file not found: {yaml_path}")
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"[ERROR] Failed to parse YAML file: {e}")
        sys.exit(1)

    required_keys = {"name", "version", "description"}
    missing = required_keys - data.keys()
    if missing:
        print(f"[ERROR] Missing required keys in YAML: {missing}")
        sys.exit(1)

    print(f"[INFO] Loaded metadata from '{yaml_path}':")
    for key, value in data.items():
        print(f"  {key}: {str(value).strip()[:80]}")  # Truncate long values for display

    return data


def build_bento(metadata: dict) -> bentoml.Bento:
    """Package the service into a Bento using the provided metadata."""
    bento = bentoml.build(
        # ── Service entrypoint ──────────────────────────────────────────────
        "service.py:svc",

        # ── Identity & description loaded from YAML ─────────────────────────
        name=metadata["name"],
        description=metadata["description"],
        labels=metadata.get("labels", {}),

        # ── Python dependencies ──────────────────────────────────────────────
        python=dict(
            packages=[
                "scikit-learn",
                "numpy",
            ],
        ),

        # ── Docker configuration (optional) ─────────────────────────────────
        docker=dict(
            python_version="3.10",
        ),

        # ── Include the YAML file inside the Bento for traceability ──────────
        include=["*.py", "*.yaml"],
    )

    return bento


def main():
    parser = argparse.ArgumentParser(
        description="Build a BentoML Bento with metadata loaded from a YAML file."
    )
    parser.add_argument(
        "--metadata",
        required=True,
        metavar="PATH",
        help="Path to the YAML file containing Bento metadata (name, version, description, labels).",
    )
    args = parser.parse_args()

    # 1. Load metadata from the provided YAML file
    metadata = load_metadata_from_yaml(args.metadata)

    # 2. Build the Bento
    print("\n[INFO] Building Bento...")
    bento = build_bento(metadata)

    # 3. Report success
    print(f"\n[SUCCESS] Bento built successfully!")
    print(f"  Tag:         {bento.tag}")
    print(f"  Name:        {bento.info.labels.get('name', metadata['name'])}")
    print(f"  Description: {bento.info.labels.get('description', '')[:60]}...")
    print(f"\nTo serve locally:  bentoml serve {bento.tag}")
    print(f"To containerize:   bentoml containerize {bento.tag}")


if __name__ == "__main__":
    main()

# How to Run It
# bash# 1. Install dependencies
# pip install bentoml scikit-learn pyyaml

# # 2. Train and save the model to the BentoML store
# python train_and_save.py

# # 3. Build the Bento — provide your YAML file at build time
# python build_bento.py --metadata model_metadata.yaml

# # 4. (Optional) Serve the Bento locally to test it
# bentoml serve iris_classifier_service:latest

# # 5. (Optional) Build a Docker container
# bentoml containerize iris_classifier_service:latest

# How It Works
# The key design pattern here is the separation of build-time configuration from code:
# ConcernFileWhen usedModel trainingtrain_and_save.pyOnce, before buildingRuntime logicservice.pyBaked into the BentoBuild metadatamodel_metadata.yamlPassed via --metadata CLI argBuild orchestrationbuild_bento.pyRuns bentoml.build() with YAML data injected
# The build_bento.py script uses argparse so you can swap in different YAML files for different environments (e.g., metadata_staging.yaml, metadata_prod.yaml) without touching any Python code — making it easy to integrate into CI/CD pipelines.