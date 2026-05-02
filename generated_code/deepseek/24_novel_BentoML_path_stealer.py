# Here's a Python script that uses BentoML to package a model with metadata loaded from a YAML file provided during the build command:

# 1. First, let's create the YAML metadata file (model_metadata.yaml):
# yaml
# name: "sentiment-analysis-model"
# version: "1.0.0"
# description: "BERT-based sentiment analysis model for customer reviews"
# author: "Data Science Team"
# created_date: "2024-01-15"
# tags:
#   - nlp
#   - sentiment-analysis
#   - transformer
# model_type: "huggingface"
# framework: "pytorch"
# metrics:
#   accuracy: 0.92
#   f1_score: 0.91
#   precision: 0.93
#   recall: 0.90
# training_data: "customer_reviews_2023.csv"
# input_format: 
#   type: "text"
#   max_length: 512
# output_format:
#   - label: "positive"
#   - label: "neutral" 
#   - label: "negative"
# 2. Now, let's create the BentoML service script (service.py):
# python
import bentoml
from bentoml.io import JSON, Text
import numpy as np
import pandas as pd
import yaml
import argparse
import os
from typing import Dict, Any
import pickle
from datetime import datetime

# Dummy model class for demonstration
class SentimentModel:
    def __init__(self):
        # In a real scenario, you would load your actual model here
        self.model = self._load_model()
        
    def _load_model(self):
        # Placeholder for actual model loading logic
        return {"model_type": "bert-base-uncased"}
    
    def predict(self, text: str) -> Dict[str, Any]:
        # Dummy prediction logic
        # In reality, you'd run inference with your actual model
        import random
        sentiments = ["positive", "neutral", "negative"]
        scores = [random.random() for _ in range(3)]
        scores = [s/sum(scores) for s in scores]
        
        result = {
            "text": text,
            "sentiment": sentiments[np.argmax(scores)],
            "confidence": max(scores),
            "probabilities": dict(zip(sentiments, scores))
        }
        return result

def load_metadata_from_yaml(yaml_path: str) -> Dict[str, Any]:
    """
    Load metadata from a YAML file.
    
    Args:
        yaml_path: Path to the YAML metadata file
        
    Returns:
        Dictionary containing metadata
    """
    if not os.path.exists(yaml_path):
        raise FileNotFoundError(f"Metadata file not found: {yaml_path}")
    
    with open(yaml_path, 'r') as file:
        metadata = yaml.safe_load(file)
    
    # Add additional metadata
    metadata["loaded_at"] = datetime.now().isoformat()
    metadata["bentoml_version"] = bentoml.__version__
    
    return metadata

def build_bento_service(metadata_path: str, model_path: str = None):
    """
    Build and save a BentoML service with metadata from YAML.
    
    Args:
        metadata_path: Path to YAML metadata file
        model_path: Optional path to pre-trained model
    """
    
    # Load metadata from YAML
    print(f"Loading metadata from: {metadata_path}")
    metadata = load_metadata_from_yaml(metadata_path)
    
    # Create model instance
    if model_path and os.path.exists(model_path):
        # Load actual model from path
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
    else:
        # Create dummy model for demonstration
        print("No model path provided or model not found. Using dummy model.")
        model = SentimentModel()
    
    # Define the BentoML service
    @bentoml.service(
        name=metadata.get("name", "sentiment-analysis-service"),
        resources={"cpu": "2"},
        traffic={"timeout": 10}
    )
    class SentimentAnalysisService:
        def __init__(self):
            self.model = model
            self.metadata = metadata
            
        @bentoml.api(input=Text(), output=JSON())
        def predict(self, text: str) -> Dict[str, Any]:
            """
            Predict sentiment for input text.
            """
            result = self.model.predict(text)
            result["model_version"] = self.metadata.get("version", "unknown")
            result["model_name"] = self.metadata.get("name", "unknown")
            return result
        
        @bentoml.api(input=JSON(), output=JSON())
        def batch_predict(self, input_data: Dict[str, list]) -> Dict[str, list]:
            """
            Batch prediction for multiple texts.
            """
            texts = input_data.get("texts", [])
            results = [self.model.predict(text) for text in texts]
            return {"predictions": results}
        
        @bentoml.api(input=JSON(), output=JSON())
        def metadata_info(self) -> Dict[str, Any]:
            """
            Return model metadata.
            """
            return self.metadata
    
    # Save the service to BentoML
    bento = bentoml.Service.save(
        name=metadata.get("name", "sentiment-analysis-service"),
        service=SentimentAnalysisService,
        version=metadata.get("version", "1.0.0"),
        metadata=metadata
    )
    
    print(f"Bento service built successfully!")
    print(f"Service name: {bento.name}")
    print(f"Service version: {bento.version}")
    print(f"Metadata: {metadata}")
    
    return bento

def parse_arguments():
    """
    Parse command line arguments.
    """
    parser = argparse.ArgumentParser(description="Build BentoML service with YAML metadata")
    parser.add_argument(
        "--metadata", 
        "-m", 
        required=True,
        help="Path to YAML metadata file"
    )
    parser.add_argument(
        "--model", 
        "-mdl", 
        help="Path to pre-trained model file (optional)"
    )
    parser.add_argument(
        "--output", 
        "-o", 
        default="./bento",
        help="Output directory for the bento (default: ./bento)"
    )
    return parser.parse_args()

if __name__ == "__main__":
    # Parse command line arguments
    args = parse_arguments()
    
    try:
        # Build and save the Bento service
        bento = build_bento_service(args.metadata, args.model)
        
        # Optional: Export the bento to a directory
        bento.export_to_directory(args.output)
        print(f"Bento exported to: {args.output}")
        
        # List all bentos
        print("\nAll saved bentos:")
        for b in bentoml.list():
            print(f"  - {b}")
            
    except Exception as e:
        print(f"Error building Bento service: {e}")
        raise
# 3. Create a helper script for building (build_bento.sh):
# bash
# #!/bin/bash

# # Default values
# METADATA_FILE="model_metadata.yaml"
# MODEL_FILE=""
# OUTPUT_DIR="./bento_output"

# # Parse command line arguments
# while [[ $# -gt 0 ]]; do
#     case $1 in
#         --metadata)
#             METADATA_FILE="$2"
#             shift 2
#             ;;
#         --model)
#             MODEL_FILE="$2"
#             shift 2
#             ;;
#         --output)
#             OUTPUT_DIR="$2"
#             shift 2
#             ;;
#         *)
#             echo "Unknown option: $1"
#             exit 1
#             ;;
#     esac
# done

# Build command
# CMD="python service.py --metadata $METADATA_FILE --output $OUTPUT_DIR"

# if [ ! -z "$MODEL_FILE" ]; then
#     CMD="$CMD --model $MODEL_FILE"
# fi

# echo "Running: $CMD"
# eval $CMD
# 4. Create a requirements file (requirements.txt):
# txt
# bentoml>=1.2.0
# pyyaml>=6.0
# numpy>=1.24.0
# pandas>=2.0.0
# scikit-learn>=1.3.0
# torch>=2.0.0
# transformers>=4.35.0
# 5. Usage Examples:
# Build with just metadata (using dummy model):
# bash
# python service.py --metadata model_metadata.yaml
# Build with metadata and actual model:
# bash
# python service.py --metadata model_metadata.yaml --model ./models/sentiment_model.pkl --output ./my_bento
# Using the helper script:
# bash
# chmod +x build_bento.sh
# ./build_bento.sh --metadata model_metadata.yaml --model ./models/sentiment_model.pkl
# 6. To serve and test the model:
# python
# After building, you can serve the model
import bentoml

# List all bentos
bentoml.list()

# Serve a specific bento
# bentoml serve sentiment-analysis-service:latest

# Or in Python
service = bentoml.load("sentiment-analysis-service:latest")
result = service.predict("This product is amazing!")
print(result)
# This script provides:

# YAML metadata loading: Loads model configuration from a YAML file

# Flexible model loading: Can load either a dummy model or a real pre-trained model

# Command-line interface: Accepts metadata path as argument during build

# Rich metadata: Includes comprehensive model information in the BentoML service

# Multiple APIs: Provides prediction, batch prediction, and metadata endpoints

# Error handling: Proper error handling and validation

# Export capability: Can export the bento to a directory for distribution

# The metadata from the YAML file becomes part of the BentoML model package and can be accessed through the service's metadata endpoint, making it easy to track model versions, performance metrics, and other important information.