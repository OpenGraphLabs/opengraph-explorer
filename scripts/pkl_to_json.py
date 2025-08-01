import pickle
import json
import numpy as np
import pandas as pd
import argparse
from pathlib import Path
from typing import Any, Dict, List, Union

class NumpyEncoder(json.JSONEncoder):
    """Custom JSON encoder for numpy data types"""
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

def load_pickle(file_path: str) -> Any:
    """Load data from a pickle file"""
    with open(file_path, 'rb') as f:
        return pickle.load(f)

def save_json(data: Any, output_path: str):
    """Save data as JSON file"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, cls=NumpyEncoder, indent=2, ensure_ascii=False)

def format_input_value(value: float) -> str:
    """Format input value as string with 8 decimal places
    
    Args:
        value: Input value to format
        
    Returns:
        String representation with 8 decimal places (e.g., "0.00000000")
    """
    return f"{float(value):.8f}"

def restructure_mnist_data(data: pd.DataFrame) -> List[Dict]:
    """Restructure MNIST test data into a list of objects
    
    Args:
        data: DataFrame containing MNIST test data
        
    Returns:
        List of dictionaries, each containing:
        - index: row index
        - input: input image data as list of strings with 8 decimal places
        - label: true label
        - predicted_label: predicted label (initialized as null)
        - selected: whether this data point was selected
    """
    restructured_data = []
    
    for idx, row in data.iterrows():
        # Convert input values to list if numpy array
        input_data = row['input'].tolist() if isinstance(row['input'], np.ndarray) else row['input']
        # Format each input value as string with 8 decimal places
        formatted_input = [format_input_value(val) for val in input_data]
        
        item = {
            "index": int(idx),
            "input": formatted_input,
            "label": int(row['label']) if isinstance(row['label'], (np.integer, int)) else row['label'],
            "offchain_predicted_label": int(row['predicted_label']) if isinstance(row['predicted_label'], (np.integer, int)) else row['predicted_label'],
            "onchain_predicted_label": None,  # Initialize as null
            "selected": bool(row['selected']) if isinstance(row['selected'], (np.bool_, bool)) else row['selected']
        }
        restructured_data.append(item)
    
    return restructured_data

def convert_pkl_to_json(input_path: str, output_path: str = None):
    """Convert pickle file to JSON format
    
    Args:
        input_path: Path to input pickle file
        output_path: Path to output JSON file. If not provided, will use same name as input with .json extension
    """
    # Validate input path
    input_path = Path(input_path)
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")
    
    # Set output path if not provided
    if output_path is None:
        output_path = input_path.with_suffix('.json')
    
    # Load pickle data
    print(f"Loading pickle file: {input_path}")
    data = load_pickle(str(input_path))
    
    # Restructure data
    print("Restructuring data...")
    restructured_data = restructure_mnist_data(data)
    
    # Save as JSON
    print(f"Saving JSON file: {output_path}")
    save_json(restructured_data, str(output_path))
    print("Conversion completed successfully!")

def main():
    parser = argparse.ArgumentParser(description='Convert pickle file to JSON format')
    parser.add_argument('input', help='Input pickle file path')
    parser.add_argument('-o', '--output', help='Output JSON file path (optional)')
    
    args = parser.parse_args()
    convert_pkl_to_json(args.input, args.output)

if __name__ == '__main__':
    main() 