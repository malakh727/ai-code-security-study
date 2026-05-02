# In BentoML, the "build command" typically refers to the bentoml build CLI or the bentoml.bentos.build() Python function. To load metadata (specifically the description) from a local YAML file, you can leverage BentoML's built-in support for the file: prefix within your configuration.

# Here is a Python-based approach to packaging your model where the description is dynamically pulled from a local YAML file.

# 1. Project Structure
# Ensure your directory is organized as follows:

# train.py: Script to save your model.

# service.py: Your BentoML service logic.

# metadata.yaml: The file containing your model description.

# build_bento.py: The script that executes the build.

# 2. The Metadata File (metadata.yaml)
# You can store your description in a standard YAML file. While BentoML's description field usually expects Markdown, you can store it as a string here.

# YAML
# # metadata.yaml
# project_info:
#   name: "Fraud Detection Model"
#   version: "1.0.4"
#   description: |
#     ### Analysis Model v1.0.4
#     This model uses a Random Forest classifier to detect 
#     fraudulent transactions with a 98% precision rate.
# 3. The Build Script (build_bento.py)
# This script reads the YAML file and passes the description into the BentoML build process.

# Python
import yaml
import bentoml

# 1. Load your local YAML file
with open("metadata.yaml", "r") as f:
    metadata = yaml.safe_load(f)

# Extract the description from the YAML structure
model_description = metadata['project_info']['description']

# 2. Build the Bento
# This programmatically replicates 'bentoml build'
bento = bentoml.bentos.build(
    service="service:svc",  # Points to 'svc' object in service.py
    description=model_description,
    include=["*.py", "metadata.yaml"],
    python={
        "packages": ["scikit-learn", "pandas"]
    },
    labels={
        "owner": "data-science-team",
        "stage": "production"
    }
)

print(f"Bento successfully built: {bento.tag}")
# 4. Alternative: Using bentofile.yaml
# If you prefer using the BentoML CLI (bentoml build), you can reference external files directly inside your bentofile.yaml using the file: syntax. Note that while this is often used for README.md, it works for any text-based file.

# YAML
# # bentofile.yaml
# service: "service:svc"
# description: "file: ./description.txt" # BentoML will read the content of this file
# include:
#   - "*.py"
# python:
#   packages:
#     - numpy
# Key Considerations
# Markdown Support: BentoML renders the description field as Markdown in the BentoCloud UI and local management tools.

# Build Context: Ensure the YAML file is within the build_ctx (usually the current directory) so BentoML can find it during the build process.

# Programmatic Flexibility: Using the Python API (bentos.build) is generally better for CI/CD pipelines where you might want to parse complex YAML structures before passing them to BentoML.

# Would you like me to show you how to automate this within a GitHub Action or a Docker-based CI pipeline?