"""
Sui On-Chain Inference Service

This module provides inference capabilities for Sui on-chain AI models
with chunked processing and result analysis.
"""

import logging
import os
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from dotenv import load_dotenv

from pysui.sui.sui_txn.sync_transaction import SuiTransaction
from pysui.sui.sui_types.scalars import ObjectID, SuiU64
from pysui.sui.sui_types.collections import SuiArray
from pysui.sui.sui_config import SuiConfig
from pysui.sui.sui_clients.sync_client import SuiClient
import ast

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class SuiNetworkConfig:
    """Sui network configuration."""
    network_type: str = "testnet"
    rpc_url: str = "https://fullnode.testnet.sui.io"
    graphql_url: str = "https://sui-testnet.mystenlabs.com/graphql"


@dataclass
class SuiContractConfig:
    """Sui contract configuration."""
    package_id: str = "0xb2297c10ac54cee83eef6d3bb0f9f44a013d545cd8eb6f71de2362dc98855b34"
    module_name: str = "model"


@dataclass
class Layer:
    """Layer structure matching the TypeScript interface."""
    layer_type: int
    in_dimension: int
    out_dimension: int
    weight_tensor: Dict[str, Any]
    bias_tensor: Dict[str, Any]


@dataclass
class GraphObject:
    """Graph object structure matching the TypeScript interface."""
    id: Optional[str]
    layers: List[Layer]


@dataclass
class ModelObject:
    """Model object structure matching the TypeScript interface."""
    id: str
    name: str
    description: str
    task_type: str
    graphs: List[GraphObject]
    scale: Union[str, int]
    creator: str
    training_dataset_id: Optional[str] = None
    test_dataset_ids: Optional[List[str]] = None


class SuiInferenceService:
    """Service for running Sui on-chain model inference."""
    
    def __init__(
        self,
        network_config: Optional[SuiNetworkConfig] = None,
        contract_config: Optional[SuiContractConfig] = None
    ):
        """Initialize the Sui inference service."""
        self.network_config = network_config or SuiNetworkConfig()
        self.contract_config = contract_config or SuiContractConfig()
        
        # Sui client configuration
        sui_private_key = os.getenv('SUI_PRIVATE_KEY')
        
        if not sui_private_key:
            raise ValueError("SUI_PRIVATE_KEY environment variable is required")
        
        self.sui_config = SuiConfig.user_config(
            rpc_url='https://rpc-testnet.suiscan.xyz:443',
            prv_keys=[sui_private_key],
        )
        print("xxxxx sui config xxxxx")
        print(self.sui_config.__dict__)
        
        # Constants from TypeScript
        self.MAX_PARAMS_PER_TX = 3000
        self.PREDICT_COMPUTATION_BATCH_SIZE = 100
        self.GAS_BUDGET = 1_000_000_000  # 1 SUI
        
        self._setup_client()
    
    def _setup_client(self):
        """Setup Sui client with network configuration."""
        try:
            # For now, use default config and client initialization
            print("@@@@ sui setup_client @@@@")
            # TODO: Investigate proper way to set custom RPC URL in pysui
            logger.info(f"Initializing Sui client for {self.network_config.network_type}")
            logger.info(f"Target RPC URL: {self.network_config.rpc_url}")

            # Try creating client with default config
            self.client = SuiClient(self.sui_config)
            
            logger.info("✅ Sui client initialized successfully")
            logger.info(f"Using default pysui configuration")
            
        except Exception as e:
            logger.error(f"❌ Failed to setup Sui client: {str(e)}")
            logger.error("This is expected if you don't have a Sui wallet configured")
            logger.info("💡 For testing purposes, the client will be None")
            
            # Don't raise - we'll handle the None client gracefully in inference calls
            self.client = None
    
    def predict_model_with_layer_ptb(
        self,
        model: ModelObject,
        input_magnitude: List[int],
        input_sign: List[int]
    ) -> Dict[str, Any]:
        """
        Run optimized PTB inference on a Sui on-chain model.
        Processes each output dimension separately in chunks.
        
        Args:
            model: Model object containing graph and layer information
            input_magnitude: Input vector magnitude values
            input_sign: Input vector sign values (0 for positive, 1 for negative)
            
        Returns:
            Dictionary containing inference results and events
        """
        if not self.client:
            return {
                'success': False,
                'error': 'Sui client not initialized. This could be due to missing wallet configuration or network connectivity issues.',
                'model_id': model.id,
                'inference_engine': 'sui_onchain',
                'help': 'Please ensure you have pysui properly configured with wallet access.'
            }
        
        if not model.graphs or not model.graphs[0].layers:
            raise ValueError("Model graph or layers not found")

        print("xxxxxxxxx")
        print("starting on-chain inference...")
        print("package_id:", self.contract_config.package_id)
        print("model id:", model.id)
        layers = model.graphs[0].layers
        
        try:
            logger.info(f"Starting on-chain inference for model {model.id}")
            logger.info(f"Model has {len(layers)} layers")
            
            # Create transaction
            txn = SuiTransaction(client=self.client)

            layer_result_magnitudes = None
            layer_result_signs = None

            # execute first layer with input vectors
            for dimension_idx in range(layers[0].out_dimension):
                # return: (accumulated magnitude, accumulated sign, output dimension index, is last dimension)
                partial_result = txn.move_call(
                    target=f"{self.contract_config.package_id}::{self.contract_config.module_name}::predict_layer_partial",
                    arguments=[
                        ObjectID(model.id),  # model object
                        SuiU64(0),           # layer index
                        SuiU64(dimension_idx),  # output node index

                        # input magnitudes/signs for first layer
                        SuiArray([SuiU64(val) for val in input_magnitude]),
                        SuiArray([SuiU64(val) for val in input_sign]),

                        layer_result_magnitudes if layer_result_magnitudes is not None else SuiArray([]),
                        layer_result_signs if layer_result_signs is not None else SuiArray([]),
                    ],
                )

                layer_result_magnitudes = partial_result[0]
                layer_result_signs = partial_result[1]
            
            # Process the rest layers sequentially
            for layer_idx, layer in enumerate(layers[1:], start=1):
                logger.info(f"Processing layer {layer_idx}...")

                input_dimension = layer.in_dimension
                output_dimension = layer.out_dimension
                logger.info(f"Input dimension: {input_dimension}, Output dimension: {output_dimension}")

                current_layer_result_magnitudes = None
                current_layer_result_signs = None
                
                # Process each output node
                for output_dim_idx in range(output_dimension):
                    # return: (accumulated magnitude, accumulated sign, output dimension index, is last dimension)
                    partial_result = txn.move_call(
                        target=f"{self.contract_config.package_id}::{self.contract_config.module_name}::predict_layer_partial",
                        arguments=[
                            ObjectID(model.id),  # model object
                            SuiU64(layer_idx),   # layer index
                            SuiU64(output_dim_idx),  # output node index

                            layer_result_magnitudes,
                            layer_result_signs,

                            current_layer_result_magnitudes if current_layer_result_magnitudes is not None else SuiArray([]),
                            current_layer_result_signs if current_layer_result_signs is not None else SuiArray([]),
                        ],
                    )

                    print("@@@@ layer ptb result @@@@@")
                    print(partial_result)

                    # Update current layer results
                    current_layer_result_magnitudes = partial_result[0]
                    current_layer_result_signs = partial_result[1]
                
                # Update results for next layer
                layer_result_magnitudes = current_layer_result_magnitudes
                layer_result_signs = current_layer_result_signs

            # Execute transaction
            print("Executing transaction...")
            execution_result = txn.execute(gas_budget=self.GAS_BUDGET)
            
            if execution_result.is_ok():
                logger.info("On-chain inference successful")
                
                # Parse events and results
                events = self._parse_events(execution_result.result_data.events)
                
                return {
                    'success': True,
                    'model_id': model.id,
                    'events': events,
                    'transaction_digest': execution_result.result_data.digest,
                    'inference_engine': 'sui_onchain',
                    'gas_used': execution_result.result_data.effects.gas_used.computation_cost,
                    'layer_count': len(layers)
                }
            else:
                error_msg = f"Transaction failed: {execution_result.result_string}"
                logger.error(error_msg)
                
                return {
                    'success': False,
                    'error': error_msg,
                    'model_id': model.id,
                    'inference_engine': 'sui_onchain'
                }
                
        except Exception as e:
            logger.error(f"Failed to run on-chain inference: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'model_id': model.id,
                'inference_engine': 'sui_onchain'
            }
    
    def _parse_events(self, events: List[Any]) -> Dict[str, Any]:
        """
        Parse events from transaction execution.
        
        Args:
            events: List of events from transaction execution
            
        Returns:
            Parsed events dictionary
        """
        try:
            parsed_events = {
                'layer_partial_computed': [],
                'prediction_completed': None,
                'layer_computed': []
            }
            
            for event in events:
                if hasattr(event, 'parsed_json'):
                    try:
                        # Parse the JSON string if it's not already a dict
                        if isinstance(event.parsed_json, str):
                            event_data = ast.literal_eval(event.parsed_json.replace("\n", "\\n"))
                        else:
                            event_data = event.parsed_json
                        
                        # Check event type and parse accordingly
                        event_type = getattr(event, 'type', '')
                        
                        if 'LayerPartialComputed' in event_type:
                            parsed_events['layer_partial_computed'].append({
                                'model_id': event_data.get('model_id'),
                                'layer_idx': int(event_data.get('layer_idx', 0)),
                                'output_dim_idx': int(event_data.get('output_dim_idx', 0)),
                                'output_magnitude': int(event_data.get('output_magnitude', 0)),
                                'output_sign': int(event_data.get('output_sign', 0)),
                                'is_last_dimension': event_data.get('is_last_dimension', False)
                            })
                        
                        elif 'PredictionCompleted' in event_type:
                            parsed_events['prediction_completed'] = {
                                'model_id': event_data.get('model_id'),
                                'output_magnitude': [int(val) for val in event_data.get('output_magnitude', [])],
                                'output_sign': [int(val) for val in event_data.get('output_sign', [])],
                                'argmax_idx': int(event_data.get('argmax_idx', 0))
                            }
                        
                        elif 'LayerComputed' in event_type:
                            parsed_events['layer_computed'].append({
                                'model_id': event_data.get('model_id'),
                                'layer_idx': int(event_data.get('layer_idx', 0)),
                                'output_magnitude': [int(val) for val in event_data.get('output_magnitude', [])],
                                'output_sign': [int(val) for val in event_data.get('output_sign', [])],
                                'activation_type': int(event_data.get('activation_type', 0))
                            })
                            
                    except Exception as e:
                        logger.warning(f"Failed to parse event: {str(e)}")
                        continue
            
            logger.info(f"Parsed {len(events)} events")
            return parsed_events
            
        except Exception as e:
            logger.error(f"Failed to parse events: {str(e)}")
            return {}
    
    def get_model_by_id(self, model_id: str) -> Optional[ModelObject]:
        """
        Get model object from Sui network by ID.
        This is a simplified implementation - in practice, you'd query the network.
        
        Args:
            model_id: The Sui object ID of the model
            
        Returns:
            ModelObject if found, None otherwise
        """
        try:
            # In a real implementation, you would query the Sui network
            # For now, return a placeholder structure
            logger.info(f"Fetching model {model_id} from Sui network")
            
            # This would be replaced with actual GraphQL or RPC query
            # For now, return None to indicate the model needs to be provided
            return None
            
        except Exception as e:
            logger.error(f"Failed to fetch model {model_id}: {str(e)}")
            return None
    
    def validate_input(
        self,
        input_magnitude: List[int],
        input_sign: List[int]
    ) -> bool:
        """
        Validate input vectors for inference.
        
        Args:
            input_magnitude: Magnitude values
            input_sign: Sign values
            
        Returns:
            True if valid, False otherwise
        """
        try:
            # Check if both vectors have same length
            if len(input_magnitude) != len(input_sign):
                logger.error("Input magnitude and sign vectors must have same length")
                return False
            
            # Check if sign values are 0 or 1
            if not all(sign in [0, 1] for sign in input_sign):
                logger.error("Sign values must be 0 (positive) or 1 (negative)")
                return False
            
            # Check if magnitude values are non-negative
            if not all(mag >= 0 for mag in input_magnitude):
                logger.error("Magnitude values must be non-negative")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Input validation failed: {str(e)}")
            return False


class SuiInferenceManager:
    """High-level manager for Sui on-chain inference operations."""
    
    def __init__(
        self,
        network_config: Optional[SuiNetworkConfig] = None,
        contract_config: Optional[SuiContractConfig] = None
    ):
        """Initialize the inference manager."""
        self.service = SuiInferenceService(network_config, contract_config)
        self.current_model: Optional[ModelObject] = None
    
    def setup_model_for_inference(
        self,
        model: ModelObject
    ) -> Dict[str, Any]:
        """
        Set up a model for on-chain inference testing.
        
        Args:
            model: Model object to set up for inference
            
        Returns:
            Setup status and model information
        """
        try:
            # Validate model structure
            if not model.graphs or not model.graphs[0].layers:
                raise ValueError("Model must have at least one graph with layers")
            
            self.current_model = model
            
            layers_info = []
            for i, layer in enumerate(model.graphs[0].layers):
                layers_info.append({
                    'index': i,
                    'type': layer.layer_type,
                    'input_dimension': layer.in_dimension,
                    'output_dimension': layer.out_dimension
                })
            
            return {
                'success': True,
                'model_id': model.id,
                'model_name': model.name,
                'layer_count': len(model.graphs[0].layers),
                'layers_info': layers_info,
                'scale': model.scale,
                'setup_complete': True
            }
            
        except Exception as e:
            logger.error(f"Failed to setup model: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'model_id': model.id if model else 'unknown',
                'setup_complete': False
            }
    
    def run_inference_test(
        self,
        input_magnitude: List[int],
        input_sign: List[int]
    ) -> Dict[str, Any]:
        """
        Run a comprehensive on-chain inference test.
        
        Args:
            input_magnitude: Input vector magnitude values
            input_sign: Input vector sign values
            
        Returns:
            Comprehensive inference results
        """
        if not self.current_model:
            raise ValueError("No model setup. Call setup_model_for_inference() first.")
        
        try:
            # Validate input
            if not self.service.validate_input(input_magnitude, input_sign):
                raise ValueError("Invalid input vectors")
            
            # Run inference
            logger.info("Starting on-chain inference test...")
            
            results = self.service.predict_model_with_layer_ptb(
                self.current_model,
                input_magnitude,
                input_sign
            )
            
            # Add metadata
            results.update({
                'input_magnitude': input_magnitude,
                'input_sign': input_sign,
                'model_info': {
                    'id': self.current_model.id,
                    'name': self.current_model.name,
                    'description': self.current_model.description,
                    'task_type': self.current_model.task_type,
                    'scale': self.current_model.scale
                }
            })
            
            logger.info(f"On-chain inference test completed: {results.get('success', False)}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to run inference test: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'inference_engine': 'sui_onchain'
            } 