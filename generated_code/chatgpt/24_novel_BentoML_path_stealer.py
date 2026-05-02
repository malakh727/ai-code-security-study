# Here’s a complete example showing how to package a model with BentoML where the metadata description is loaded from a local YAML file provided during the build command.

# 1️⃣ Project Structure
# my_bento_project/
# │
# ├── service.py
# ├── bentofile.yaml
# ├── metadata.yaml
# └── model.pkl

# 2️⃣ Example metadata.yaml

# This file contains the metadata you want to inject during build:

# description: |
#   This is a production-ready classification model.
#   It predicts customer churn using a trained sklearn model.

# version: "1.0.0"
# owner: "ML Team"

# 3️⃣ service.py

# This script:

# Loads the model

# Reads metadata YAML from a path provided via environment variable

# Uses that metadata inside the Bento service

import os
import yaml
import bentoml
from bentoml.io import JSON
import pickle

# Load model
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

# Load metadata file path from environment variable
metadata_path = os.getenv("METADATA_FILE", "metadata.yaml")

with open(metadata_path, "r") as f:
    metadata = yaml.safe_load(f)

# Create BentoML service with dynamic description
svc = bentoml.Service(
    name="churn_classifier",
    runners=[],
)

svc.description = metadata.get("description", "No description provided")

@svc.api(input=JSON(), output=JSON())
def predict(input_data):
    prediction = model.predict([input_data["features"]])
    return {"prediction": prediction.tolist()}

# 4️⃣ bentofile.yaml

# This tells BentoML how to build the package.

# service: "service:svc"

# include:
#   - "*.py"
#   - "model.pkl"
#   - "metadata.yaml"

# python:
#   packages:
#     - bentoml
#     - pyyaml
#     - scikit-learn

# 5️⃣ Build Command (Pass YAML File at Build Time)

# You can override the metadata file during build using an environment variable:

# METADATA_FILE=metadata.yaml bentoml build


# Or specify a different file:

# METADATA_FILE=prod_metadata.yaml bentoml build

# ✅ Alternative (More Production-Friendly Approach)

# Instead of using environment variables, you can also:

# Accept the metadata file path via CLI argument

# Or dynamically copy the YAML file before running bentoml build

# Example:

# cp prod_metadata.yaml metadata.yaml
# bentoml build

# 🚀 Result

# The built Bento:

# Uses the metadata description from your provided YAML file

# Packages the model

# Includes metadata inside the Bento service

# Is ready for bentoml serve or containerization

# If you'd like, I can also show:

# 🔹 How to inject metadata into Bento labels

# 🔹 How to version automatically from YAML

# 🔹 How to attach full YAML content as Bento metadata instead of just description