import json
import numpy as np
import tensorflow as tf
import os
from pathlib import Path

def load_test_samples(json_path):
    """Load test samples from JSON file"""
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    # Extract input values and true labels
    samples = data['test_samples']
    X = np.array([
        [float(val) for val in sample['input_values']]
        for sample in samples
    ])
    y = np.array([sample['true_label'] for sample in samples])
    
    return X, y, samples

def evaluate_tensorflow_model(model_path, X_test):
    """Evaluate TensorFlow H5 model"""
    print(f"\n{'='*60}")
    print(f"EVALUATING TENSORFLOW MODEL: {os.path.basename(model_path)}")
    print(f"{'='*60}")
    
    # Load TensorFlow model
    tf_model = tf.keras.models.load_model(model_path)
    
    # Get predictions
    predictions = tf_model.predict(X_test, verbose=0)
    predicted_classes = np.argmax(predictions, axis=1)
    
    return predicted_classes

def load_blockchain_results(results_path):
    """Load blockchain inference results from JSON file"""
    with open(results_path, 'r') as f:
        results = json.load(f)
    return results['predictions']

def compare_results(tf_predictions, blockchain_predictions, true_labels):
    """Compare TensorFlow and blockchain predictions"""
    print(f"\n{'='*60}")
    print("COMPARING PREDICTIONS")
    print(f"{'='*60}")
    
    for i, (tf_pred, bc_pred, true_label) in enumerate(zip(tf_predictions, blockchain_predictions, true_labels)):
        print(f"\nSample {i+1}:")
        print(f"True Label: {true_label}")
        print(f"TensorFlow Prediction: {tf_pred}")
        print(f"Blockchain Prediction: {bc_pred}")
        print(f"TensorFlow Correct: {tf_pred == true_label}")
        print(f"Blockchain Correct: {bc_pred == true_label}")
        print(f"Predictions Match: {tf_pred == bc_pred}")
    
    # Calculate overall statistics
    tf_correct = np.sum(tf_predictions == true_labels)
    bc_correct = np.sum(blockchain_predictions == true_labels)
    matching_predictions = np.sum(tf_predictions == blockchain_predictions)
    total = len(true_labels)
    
    print(f"\n{'='*60}")
    print("OVERALL RESULTS")
    print(f"{'='*60}")
    print(f"Total Samples: {total}")
    print(f"TensorFlow Accuracy: {tf_correct/total*100:.2f}% ({tf_correct}/{total})")
    print(f"Blockchain Accuracy: {bc_correct/total*100:.2f}% ({bc_correct}/{total})")
    print(f"Matching Predictions: {matching_predictions/total*100:.2f}% ({matching_predictions}/{total})")

def main():
    # Set paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    
    model_path = project_root / 'mnist_14_14' / 'model' / 'mnist_14_14.h5'
    test_samples_path = project_root / 'scripts' / 'data' / 'mnist_14_14' / 'test_samples' / 'test_samples.json'
    blockchain_results_path = script_dir / 'blockchain_results.json'
    
    # Check if all required files exist
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    if not test_samples_path.exists():
        raise FileNotFoundError(f"Test samples file not found: {test_samples_path}")
    if not blockchain_results_path.exists():
        raise FileNotFoundError(f"Blockchain results file not found: {blockchain_results_path}")
    
    # Load test data
    X_test, y_test, samples = load_test_samples(test_samples_path)
    
    # Get TensorFlow predictions
    tf_predictions = evaluate_tensorflow_model(model_path, X_test)
    
    # Load blockchain results
    blockchain_predictions = load_blockchain_results(blockchain_results_path)
    
    # Compare results
    compare_results(tf_predictions, blockchain_predictions, y_test)

if __name__ == "__main__":
    main() 