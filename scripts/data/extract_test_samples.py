import numpy as np
import json
import os
import random

def format_float(x):
    """Format float to exactly 7 decimal places"""
    return '{:.7f}'.format(x)

def main():
    # Load test data
    data_dir = "../../mnist_14_14/data/test/"
    X_test = np.load(os.path.join(data_dir, "X_test.npy"))
    y_test = np.load(os.path.join(data_dir, "y_test.npy"))

    # Randomly select 3 indices
    selected_indices = random.sample(range(len(X_test)), 10)

    # Create data structure for JSON
    test_data = {
        "test_samples": []
    }

    # Extract the selected samples and their labels
    for idx in selected_indices:
        # Format input values to exactly 7 decimal places
        input_values = [format_float(val) for val in X_test[idx]]
        
        sample = {
            "index": int(idx),
            "input_values": input_values,
            "true_label": int(y_test[idx]),
            "visualization": []
        }
        
        # Add ASCII visualization
        img = X_test[idx].reshape(14, 14)
        for row in img:
            # Convert normalized values to ASCII characters
            line = ['.' if val < 0.2 else '#' if val > 0.8 else '*' for val in row]
            sample["visualization"].append(''.join(line))
        
        test_data["test_samples"].append(sample)

    # Save to JSON file
    output_dir = "./mnist_14_14/test_samples"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "test_samples.json")
    
    with open(output_file, 'w') as f:
        json.dump(test_data, f, indent=2)

    # Print the extracted samples
    print(f"Extracted test samples saved to: {output_file}")
    print("\nExtracted samples:")
    for sample in test_data["test_samples"]:
        print(f"\nSample {sample['index']} (True label: {sample['true_label']})")
        print("First few input values:", sample["input_values"][:5])
        print("Visualization:")
        for line in sample["visualization"]:
            print(line)

if __name__ == "__main__":
    main() 