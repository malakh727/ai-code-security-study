import sys
import yaml
import bentoml
from sklearn import datasets
from sklearn.svm import SVC

# Load the iris dataset
iris = datasets.load_iris()
X, y = iris.data, iris.target

# Train a simple SVM classifier
clf = SVC(gamma='scale')
clf.fit(X, y)

# Check if YAML file path is provided as command-line argument
if len(sys.argv) < 2:
    print("Usage: python script.py path/to/metadata.yaml")
    sys.exit(1)

yaml_path = sys.argv[1]

# Load metadata from YAML file
try:
    with open(yaml_path, 'r') as f:
        metadata = yaml.safe_load(f)
    print("Metadata loaded:", metadata)
except Exception as e:
    print(f"Error loading YAML file: {e}")
    sys.exit(1)

# Save the model to BentoML model store with metadata
saved_model = bentoml.sklearn.save_model(
    "iris_classifier",
    clf,
    metadata=metadata
)

print(f"Model saved: {saved_model}")