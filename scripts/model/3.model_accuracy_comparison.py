import numpy as np
import tensorflow as tf
from tensorflow import keras
import json
import os
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# Constants
IMG_SIZE = 14
INPUT_DIM = IMG_SIZE * IMG_SIZE
SCALE = 2

def fixed_to_float(sign, magnitude, scale):
    """Convert (sign, magnitude) back to float using the scale factor"""
    factor = 10 ** -scale
    value = magnitude * factor
    return -value if sign == 1 else value

def linear(x):
    """Linear activation function (identity function)"""
    return x

def relu(x):
    """ReLU activation function"""
    return np.maximum(0, x)

def softmax(x):
    """Softmax activation function"""
    # For numerical stability, subtract the max from each value
    x_shifted = x - np.max(x, axis=-1, keepdims=True)
    # Calculate softmax
    exp_x = np.exp(x_shifted)
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

class DenseLayer:
    def __init__(self, kernel_shape, kernel_signs, kernel_magnitudes, 
                 bias_signs, bias_magnitudes, scale, activation=None):
        """Initialize Dense layer with quantized weights"""
        self.kernel = np.zeros(kernel_shape)
        self.bias = np.zeros(kernel_shape[1])
        
        # Reconstruct kernel weights
        kernel_flat = [fixed_to_float(s, m, scale) 
                      for s, m in zip(kernel_signs, kernel_magnitudes)]
        self.kernel = np.array(kernel_flat).reshape(kernel_shape)
        
        # Reconstruct bias weights
        self.bias = np.array([fixed_to_float(s, m, scale) 
                            for s, m in zip(bias_signs, bias_magnitudes)])
        
        self.activation = activation

    def forward(self, inputs):
        """Forward pass computation"""
        pre_activation = np.dot(inputs, self.kernel) + self.bias
        
        output = pre_activation
        
        if self.activation == 'relu':
            output = relu(output)
        elif self.activation == 'linear':
            output = linear(output)
        # Note: softmax is applied separately in the model's predict method
            
        return output

class JSONModel:
    def __init__(self, model_path):
        # Load model parameters from JSON file
        with open(model_path, 'r') as f:
            model_data = json.load(f)
        
        # Get layer dimensions and scale from the JSON data
        layer_dimensions = model_data['layerDimensions']
        layer_activation = model_data['activationNames']
        scale = model_data.get('scale', 2)  # Default to 2 if not present
        
        # Create all layers based on the dimensions in the JSON
        self.layers = []
        for i, (in_dim, out_dim) in enumerate(layer_dimensions):
            # Use the specific activation for this layer
            activation = layer_activation[i] if i < len(layer_activation) else 'linear'
            
            layer = DenseLayer(
                kernel_shape=(in_dim, out_dim),
                kernel_signs=model_data['weightsSigns'][i],
                kernel_magnitudes=model_data['weightsMagnitudes'][i],
                bias_signs=model_data['biasesSigns'][i],
                bias_magnitudes=model_data['biasesMagnitudes'][i],
                scale=scale,  # Pass the scale from JSON
                activation=activation
            )
            self.layers.append(layer)
            
        self.model_name = os.path.basename(model_path).split('.')[0]

    def predict(self, x):
        """Forward pass through the entire model"""
        # Handle single samples by converting to batch of size 1
        if x.ndim == 1:
            x = x.reshape(1, -1)
        
        # Pass through all layers except softmax
        for layer in self.layers:
            x = layer.forward(x)
        
        return np.argmax(x, axis=1)[0]
    
    def predict_proba(self, x):
        """Return probability predictions"""
        if x.ndim == 1:
            x = x.reshape(1, -1)
        
        # Pass through each layer
        for layer in self.layers:
            x = layer.forward(x)
            
        return x[0]  # Return probabilities for the single sample

def load_and_process_mnist_data(data_dir):
    """Load and process MNIST data from .npy files"""
    X_test_path = os.path.join(data_dir, "X_test.npy")
    y_test_path = os.path.join(data_dir, "y_test.npy")
    
    if not os.path.exists(X_test_path) or not os.path.exists(y_test_path):
        raise ValueError(f"MNIST data files not found in {data_dir}")
    
    # Load the data
    X_test = np.load(X_test_path)
    y_test = np.load(y_test_path)
    
    print(f"Loaded MNIST test data: {X_test.shape} images, {y_test.shape} labels")
    
    return X_test, y_test

def evaluate_tensorflow_model(model_path, X_test, y_test, max_samples=None):
    """Evaluate TensorFlow H5 model"""
    print(f"\n{'='*60}")
    print(f"EVALUATING TENSORFLOW MODEL: {os.path.basename(model_path)}")
    print(f"{'='*60}")
    
    # Load TensorFlow model
    tf_model = tf.keras.models.load_model(model_path)
    
    # Limit samples if specified
    if max_samples is not None:
        X_test = X_test[:max_samples]
        y_test = y_test[:max_samples]
    
    # Evaluate using TensorFlow's built-in method
    test_loss, test_accuracy = tf_model.evaluate(X_test, y_test, verbose=0)
    
    # Get predictions for detailed analysis
    predictions = tf_model.predict(X_test, verbose=0)
    predicted_classes = np.argmax(predictions, axis=1)
    
    # Calculate additional metrics
    correct = np.sum(predicted_classes == y_test)
    total = len(y_test)
    manual_accuracy = correct / total
    
    print(f"TensorFlow Model Results:")
    print(f"  - Test Loss: {test_loss:.6f}")
    print(f"  - Test Accuracy (TF): {test_accuracy:.6f}")
    print(f"  - Manual Accuracy: {manual_accuracy:.6f}")
    print(f"  - Correct Predictions: {correct}/{total}")
    
    return {
        'model_type': 'TensorFlow',
        'accuracy': test_accuracy,
        'manual_accuracy': manual_accuracy,
        'loss': test_loss,
        'predictions': predicted_classes,
        'probabilities': predictions,
        'correct': correct,
        'total': total
    }

def evaluate_json_model(model_path, X_test, y_test, max_samples=None):
    """Evaluate JSON model"""
    print(f"\n{'='*60}")
    print(f"EVALUATING JSON MODEL: {os.path.basename(model_path)}")
    print(f"{'='*60}")
    
    # Load JSON model
    json_model = JSONModel(model_path)
    
    # Limit samples if specified
    if max_samples is not None:
        X_test = X_test[:max_samples]
        y_test = y_test[:max_samples]
    
    # Get predictions
    predicted_classes = []
    probabilities = []
    correct = 0
    total = len(y_test)
    
    print("Running inference on JSON model...")
    for i, (x, y_true) in enumerate(zip(X_test, y_test)):
        # Normalize input

        # Get prediction
        pred_class = json_model.predict(x)
        pred_proba = json_model.predict_proba(x)
        
        predicted_classes.append(pred_class)
        probabilities.append(pred_proba)
        
        if pred_class == y_true:
            correct += 1
        
        # Progress indicator
        if (i + 1) % 1000 == 0:
            print(f"  Processed {i + 1}/{total} samples...")
    
    predicted_classes = np.array(predicted_classes)
    probabilities = np.array(probabilities)
    accuracy = correct / total
    
    print(f"JSON Model Results:")
    print(f"  - Accuracy: {accuracy:.6f}")
    print(f"  - Correct Predictions: {correct}/{total}")
    
    return {
        'model_type': 'JSON',
        'accuracy': accuracy,
        'manual_accuracy': accuracy,
        'loss': None,  # Not calculated for JSON model
        'predictions': predicted_classes,
        'probabilities': probabilities,
        'correct': correct,
        'total': total
    }

def compare_predictions(tf_results, json_results, y_test, save_dir):
    """Compare predictions between models"""
    print(f"\n{'='*60}")
    print("COMPARISON ANALYSIS")
    print(f"{'='*60}")
    
    tf_pred = tf_results['predictions']
    json_pred = json_results['predictions']
    
    # Calculate agreement
    agreement = np.sum(tf_pred == json_pred)
    agreement_rate = agreement / len(tf_pred)
    
    print(f"Prediction Agreement: {agreement}/{len(tf_pred)} ({agreement_rate:.4f})")
    
    # Find disagreements
    disagreements = tf_pred != json_pred
    disagreement_indices = np.where(disagreements)[0]
    
    print(f"Disagreements: {len(disagreement_indices)} samples")
    
    # Create comparison DataFrame
    comparison_data = []
    for i in range(len(tf_pred)):
        comparison_data.append({
            'sample_index': i,
            'true_label': y_test[i],
            'tf_prediction': tf_pred[i],
            'json_prediction': json_pred[i],
            'tf_correct': tf_pred[i] == y_test[i],
            'json_correct': json_pred[i] == y_test[i],
            'models_agree': tf_pred[i] == json_pred[i],
            'tf_probability': np.max(tf_results['probabilities'][i]),
            'json_probability': np.max(json_results['probabilities'][i])
        })
    
    comparison_df = pd.DataFrame(comparison_data)
    
    # Save comparison results
    comparison_path = os.path.join(save_dir, 'model_comparison.csv')
    comparison_df.to_csv(comparison_path, index=False)
    print(f"Comparison results saved to: {comparison_path}")
    
    # Analyze disagreements
    if len(disagreement_indices) > 0:
        print(f"\nSample disagreements (first 10):")
        for i in disagreement_indices[:10]:
            print(f"  Sample {i}: True={y_test[i]}, TF={tf_pred[i]}, JSON={json_pred[i]}")
    
    return comparison_df

def create_confusion_matrices(tf_results, json_results, y_test, save_dir):
    """Create and save confusion matrices"""
    print(f"\nCreating confusion matrices...")
    
    # Create figure with subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # TensorFlow confusion matrix
    cm_tf = confusion_matrix(y_test, tf_results['predictions'])
    sns.heatmap(cm_tf, annot=True, fmt='d', cmap='Blues', ax=ax1)
    ax1.set_title(f'TensorFlow Model\nAccuracy: {tf_results["accuracy"]:.4f}')
    ax1.set_xlabel('Predicted')
    ax1.set_ylabel('True')
    
    # JSON confusion matrix
    cm_json = confusion_matrix(y_test, json_results['predictions'])
    sns.heatmap(cm_json, annot=True, fmt='d', cmap='Blues', ax=ax2)
    ax2.set_title(f'JSON Model\nAccuracy: {json_results["accuracy"]:.4f}')
    ax2.set_xlabel('Predicted')
    ax2.set_ylabel('True')
    
    plt.tight_layout()
    
    # Save confusion matrices
    cm_path = os.path.join(save_dir, 'confusion_matrices.png')
    plt.savefig(cm_path, bbox_inches='tight', dpi=300)
    print(f"Confusion matrices saved to: {cm_path}")
    plt.close()

def create_accuracy_comparison_plot(tf_results, json_results, save_dir):
    """Create accuracy comparison visualization"""
    print(f"\nCreating accuracy comparison plot...")
    
    models = ['TensorFlow', 'JSON']
    accuracies = [tf_results['accuracy'], json_results['accuracy']]
    
    plt.figure(figsize=(10, 6))
    bars = plt.bar(models, accuracies, color=['blue', 'orange'], alpha=0.7)
    
    # Add value labels on bars
    for bar, acc in zip(bars, accuracies):
        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.001, 
                f'{acc:.4f}', ha='center', va='bottom', fontweight='bold')
    
    plt.title('Model Accuracy Comparison', fontsize=16, fontweight='bold')
    plt.ylabel('Accuracy', fontsize=12)
    plt.ylim(0, 1.0)
    
    # Add accuracy difference
    diff = abs(tf_results['accuracy'] - json_results['accuracy'])
    plt.text(0.5, 0.5, f'Difference: {diff:.6f}', 
             ha='center', va='center', transform=plt.gca().transAxes,
             bbox=dict(boxstyle="round,pad=0.3", facecolor="yellow", alpha=0.7))
    
    plt.tight_layout()
    
    # Save plot
    acc_path = os.path.join(save_dir, 'accuracy_comparison.png')
    plt.savefig(acc_path, bbox_inches='tight', dpi=300)
    print(f"Accuracy comparison plot saved to: {acc_path}")
    plt.close()

def main():
    # Configuration
    model_name = "mnist_14_14"
    
    # Paths
    h5_model_path = f"../../{model_name}/model/{model_name}.h5"
    json_model_path = f"../../{model_name}/graph/{model_name}.json"
    data_dir = f"../../{model_name}/data/test/"
    results_dir = f"../../{model_name}/comparison_results"
    
    # Create results directory
    os.makedirs(results_dir, exist_ok=True)
    
    # Load test data
    print("Loading test data...")
    X_test, y_test = load_and_process_mnist_data(data_dir)
    
    # Set maximum samples for testing (None for all, or set a number like 1000)
    max_samples = None  # Change to a number to limit samples for faster testing
    
    # Evaluate TensorFlow model
    tf_results = evaluate_tensorflow_model(h5_model_path, X_test, y_test, max_samples)
    
    # Evaluate JSON model
    json_results = evaluate_json_model(json_model_path, X_test, y_test, max_samples)
    
    # Compare predictions
    comparison_df = compare_predictions(tf_results, json_results, y_test, results_dir)
    
    # Create visualizations
    create_confusion_matrices(tf_results, json_results, y_test, results_dir)
    create_accuracy_comparison_plot(tf_results, json_results, results_dir)
    
    # Print final summary
    print(f"\n{'='*60}")
    print("FINAL SUMMARY")
    print(f"{'='*60}")
    print(f"TensorFlow Model Accuracy: {tf_results['accuracy']:.6f}")
    print(f"JSON Model Accuracy: {json_results['accuracy']:.6f}")
    print(f"Accuracy Difference: {abs(tf_results['accuracy'] - json_results['accuracy']):.6f}")
    print(f"Prediction Agreement: {np.sum(tf_results['predictions'] == json_results['predictions'])}/{len(tf_results['predictions'])}")
    
    # Save summary to file
    summary_path = os.path.join(results_dir, 'summary.txt')
    with open(summary_path, 'w') as f:
        f.write("MODEL ACCURACY COMPARISON SUMMARY\n")
        f.write("="*50 + "\n\n")
        f.write(f"TensorFlow Model Accuracy: {tf_results['accuracy']:.6f}\n")
        f.write(f"JSON Model Accuracy: {json_results['accuracy']:.6f}\n")
        f.write(f"Accuracy Difference: {abs(tf_results['accuracy'] - json_results['accuracy']):.6f}\n")
        f.write(f"Prediction Agreement: {np.sum(tf_results['predictions'] == json_results['predictions'])}/{len(tf_results['predictions'])}\n")
        f.write(f"Total Samples: {len(tf_results['predictions'])}\n")
    
    print(f"\nAll results saved to: {results_dir}")
    print(f"Summary file: {summary_path}")

if __name__ == "__main__":
    main() 