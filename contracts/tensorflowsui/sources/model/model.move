// Copyright (c) OpenGraph, Inc.
// SPDX-License-Identifier: Apache-2.0

/// @title Fully Onchain Neural Network Inference Implementation
module tensorflowsui::model {
    use tensorflowsui::graph::{Self, Graph};
    use tensorflowsui::layer;
    use tensorflowsui::dataset;
    use tensorflowsui::math;
    use std::string::{String};
    use tensorflowsui::tensor;
    use sui::event;

    /// @dev Error when weight magnitude and sign vector lengths do not match
    const EWeightsVectorLengthMismatch: u64 = 1008;
    /// @dev Error when bias magnitude and sign vector lengths do not match
    const EBiasesVectorLengthMismatch: u64 = 1009;
    /// @dev Error when scale value is 0
    const EInvalidScale: u64 = 1010;
    /// @dev Error when input vector length does not match first layer input dimension
    const EInputDimensionMismatch: u64 = 1012;
    /// @dev Error when model has no graphs
    const EModelHasNoGraphs: u64 = 1014;
    /// @dev Error when layer index is out of bounds
    const ELayerIndexOutOfBounds: u64 = 1015;
    /// @dev Error when dimension index is out of bounds
    const EDimensionIndexOutOfBounds: u64 = 1016;
    /// @dev Error when graph index is out of bounds
    const EGraphIndexOutOfBounds: u64 = 1018;
    /// @dev Error when layer dimensions don't match parameters
    const ELayerDimensionMismatch: u64 = 1020;
    /// @dev Error when model state is invalid for operation
    const EInvalidModelState: u64 = 1021;
    /// @dev Error when partial layer parameters are invalid
    const EInvalidPartialLayerParams: u64 = 1023;

    // Model state constants
    const MODEL_STATE_INCOMPLETE: u8 = 0;
    const MODEL_STATE_COMPLETE: u8 = 1;

    // Layer parameter constants
    const MAX_PARAMS_PER_TRANSACTION: u64 = 3000;

    public struct Model has key {
        id: UID,
        name: String,
        description: String,
        task_type: String,
        graphs: vector<Graph>,
        scale: u64,
        training_dataset_id: Option<ID>,
        test_dataset_ids: Option<vector<ID>>,
        state: u8, // 0 = incomplete, 1 = complete
        current_graph_idx: u64, // tracks which graph is currently being constructed
        current_layer_idx: u64, // tracks which layer is currently being constructed
    }
    
    /// @notice Event emitted when model prediction is complete
    public struct PredictionCompleted has copy, drop {
        model_id: address,
        output_magnitude: vector<u64>,
        output_sign: vector<u64>,
        argmax_idx: u64,
    }

    /// @notice Event emitted when a model is created
    public struct ModelCreated has copy, drop {
        model_id: address,
        name: String,
        task_type: String,
    }

    /// @notice Event emitted when a model is completed
    public struct ModelCompleted has copy, drop {
        model_id: address,
        graph_count: u64,
        total_layers: u64,
    }

    /// @notice Event emitted when a graph is added to a model
    public struct GraphAdded has copy, drop {
        model_id: address,
        graph_idx: u64,
    }

    /// @notice Event emitted when a layer is added to a graph
    public struct LayerAdded has copy, drop {
        model_id: address,
        graph_idx: u64,
        layer_idx: u64,
        in_dimension: u64,
        out_dimension: u64,
    }

    /// @notice Event emitted when a partial layer computation is completed
    public struct LayerPartialComputed has copy, drop {
        model_id: address,
        layer_idx: u64,
        output_dim_idx: u64,
        output_magnitude: u64,
        output_sign: u64,
        is_last_dimension: bool
    }

    /// @notice Event emitted when a layer creation starts
    public struct LayerStarted has copy, drop {
        model_id: address,
        graph_idx: u64,
        layer_idx: u64,
        in_dimension: u64,
        out_dimension: u64,
    }

    /// @notice Event emitted when a layer is completed
    public struct LayerCompleted has copy, drop {
        model_id: address,
        graph_idx: u64,
        layer_idx: u64,
        in_dimension: u64,
        out_dimension: u64,
        is_final_layer: bool,
    }

    /// @notice Event emitted when a weights chunk is added
    public struct WeightsChunkAdded has copy, drop {
        model_id: address,
        graph_idx: u64,
        layer_idx: u64,
        start_idx: u64,
        chunk_size: u64,
        is_last_chunk: bool,
    }

    /// @notice Event emitted when a biases chunk is added
    public struct BiasesChunkAdded has copy, drop {
        model_id: address,
        graph_idx: u64,
        layer_idx: u64,
        start_idx: u64,
        chunk_size: u64,
        is_last_chunk: bool,
    }

    public struct MODEL has drop {}

    public struct OpenGraphManagerCap has key {
        id: UID
    }

    public fun new_open_graph_manager_cap(_witness: MODEL, ctx: &mut TxContext): OpenGraphManagerCap {
        OpenGraphManagerCap { id: object::new(ctx) }        
    }

    fun init(witness: MODEL, ctx: &mut TxContext) {
        let cap = new_open_graph_manager_cap(witness, ctx);
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    /// @notice Creates an empty model with just metadata (no graphs or layers)
    /// @param name Model name
    /// @param description Model description
    /// @param task_type Model task type (e.g., "classification", "regression")
    /// @param scale Fixed point scale (2^scale)
    /// @param training_dataset_id Training dataset ID (optional)
    /// @param test_dataset_ids List of test dataset IDs (optional)
    /// @param ctx Transaction context
    /// @return New model object ID
    public fun create_model(
        name: String,
        description: String,
        task_type: String,
        scale: u64,
        training_dataset_id: Option<ID>,
        test_dataset_ids: Option<vector<ID>>,
        ctx: &mut TxContext,
    ): Model {
        // Validate scale value
        assert!(scale > 0, EInvalidScale);

        let model = Model {
            id: object::new(ctx),
            name,
            description,
            task_type,
            graphs: vector::empty<Graph>(),
            scale,
            training_dataset_id,
            test_dataset_ids,
            state: MODEL_STATE_INCOMPLETE,
            current_graph_idx: 0,
            current_layer_idx: 0,
        };
        
        // Emit model created event
        event::emit(ModelCreated {
            model_id: object::id_address(&model),
            name,
            task_type,
        });
        
        model
    }

    /// @notice Adds a new empty graph to the model
    /// @param model Model object to add graph to
    public fun add_graph(model: &mut Model) {
        // Model must be in incomplete state
        assert!(model.state == MODEL_STATE_INCOMPLETE, EInvalidModelState);
        
        let graph = graph::new_graph();
        vector::push_back(&mut model.graphs, graph);
        
        let graph_idx = vector::length(&model.graphs) - 1;
        
        // Update current graph index
        model.current_graph_idx = graph_idx;
        model.current_layer_idx = 0;
        
        // Emit graph added event
        event::emit(GraphAdded {
            model_id: object::id_address(model),
            graph_idx,
        });
    }

    /// @notice Starts creating a new layer in the current graph
    /// @param model Model object
    /// @param layer_type Type of layer (e.g., "dense")
    /// @param in_dimension Input dimension of the layer
    /// @param out_dimension Output dimension of the layer
    public fun start_layer(
        model: &mut Model,
        layer_type: String,
        in_dimension: u64,
        out_dimension: u64
    ) {
        // Model must be in incomplete state
        assert!(model.state == MODEL_STATE_INCOMPLETE, EInvalidModelState);
        
        // Check if graph_idx is valid
        let graph_idx = model.current_graph_idx;
        assert!(graph_idx < vector::length(&model.graphs), EGraphIndexOutOfBounds);
        
        // Create empty layer and add to graph
        let empty_weights_mag = vector::empty<u64>();
        let empty_weights_sign = vector::empty<u64>();
        let empty_biases_mag = vector::empty<u64>();
        let empty_biases_sign = vector::empty<u64>();
        
        let layer = layer::new_layer(
            layer_type, 
            in_dimension, 
            out_dimension, 
            empty_weights_mag, 
            empty_weights_sign, 
            empty_biases_mag, 
            empty_biases_sign, 
            model.scale
        );
        
        graph::add_layer(&mut model.graphs[graph_idx], layer);
        
        // Update current layer index
        model.current_layer_idx = graph::get_layer_count(&model.graphs[graph_idx]) - 1;
        
        // Emit layer started event
        event::emit(LayerStarted {
            model_id: object::id_address(model),
            graph_idx,
            layer_idx: model.current_layer_idx,
            in_dimension,
            out_dimension,
        });
    }

    /// @notice Adds partial weights parameters to the current layer
    /// @param model Model object
    /// @param start_idx Starting index in the flattened weights array
    /// @param weights_magnitude Partial weight magnitude values
    /// @param weights_sign Partial weight sign values
    /// @param is_last_chunk Whether this is the last chunk of weights
    public fun add_weights_chunk(
        model: &mut Model,
        start_idx: u64,
        weights_magnitude: vector<u64>,
        weights_sign: vector<u64>,
        is_last_chunk: bool
    ) {
        // Model must be in incomplete state
        assert!(model.state == MODEL_STATE_INCOMPLETE, EInvalidModelState);

        // Check if vectors have same length
        assert!(vector::length(&weights_magnitude) == vector::length(&weights_sign), EWeightsVectorLengthMismatch);

        // Get current graph and layer
        let graph_idx = model.current_graph_idx;
        let layer_idx = model.current_layer_idx;

        assert!(graph_idx < vector::length(&model.graphs), EGraphIndexOutOfBounds);
        assert!(layer_idx < graph::get_layer_count(&model.graphs[graph_idx]), ELayerIndexOutOfBounds);

        // Get layer
        let layer = graph::get_layer_at_mut(&mut model.graphs[graph_idx], layer_idx);

        // Add weights chunk
        layer::add_weights_chunk(layer, start_idx, weights_magnitude, weights_sign);

        // Emit weights chunk added event
        event::emit(WeightsChunkAdded {
            model_id: object::id_address(model),
            graph_idx,
            layer_idx,
            start_idx,
            chunk_size: vector::length(&weights_magnitude),
            is_last_chunk,
        });
    }

    /// @notice Adds partial biases parameters to the current layer
    /// @param model Model object
    /// @param start_idx Starting index in the biases array
    /// @param biases_magnitude Partial bias magnitude values
    /// @param biases_sign Partial bias sign values
    /// @param is_last_chunk Whether this is the last chunk of biases
    public fun add_biases_chunk(
        model: &mut Model,
        start_idx: u64,
        biases_magnitude: vector<u64>,
        biases_sign: vector<u64>,
        is_last_chunk: bool
    ) {
        // Model must be in incomplete state
        assert!(model.state == MODEL_STATE_INCOMPLETE, EInvalidModelState);

        // Check if vectors have same length
        assert!(vector::length(&biases_magnitude) == vector::length(&biases_sign), EBiasesVectorLengthMismatch);

        // Get current graph and layer
        let graph_idx = model.current_graph_idx;
        let layer_idx = model.current_layer_idx;

        assert!(graph_idx < vector::length(&model.graphs), EGraphIndexOutOfBounds);
        assert!(layer_idx < graph::get_layer_count(&model.graphs[graph_idx]), ELayerIndexOutOfBounds);

        // Get layer
        let layer = graph::get_layer_at_mut(&mut model.graphs[graph_idx], layer_idx);

        // Add biases chunk
        layer::add_biases_chunk(layer, start_idx, biases_magnitude, biases_sign);

        // Emit biases chunk added event
        event::emit(BiasesChunkAdded {
            model_id: object::id_address(model),
            graph_idx,
            layer_idx,
            start_idx,
            chunk_size: vector::length(&biases_magnitude),
            is_last_chunk,
        });
    }

    /// @notice Completes the current layer by validating parameter dimensions
    /// @param model Model object
    public fun complete_layer(model: &mut Model, is_final_layer: bool) {
        // Model must be in incomplete state
        assert!(model.state == MODEL_STATE_INCOMPLETE, EInvalidModelState);
        
        // Get current graph and layer
        let graph_idx = model.current_graph_idx;
        let layer_idx = model.current_layer_idx;
        
        assert!(graph_idx < vector::length(&model.graphs), EGraphIndexOutOfBounds);
        assert!(layer_idx < graph::get_layer_count(&model.graphs[graph_idx]), ELayerIndexOutOfBounds);
        
        // Get layer
        let layer = graph::get_layer_at(&model.graphs[graph_idx], layer_idx);
        
        // Validate layer parameters
        let in_dim = layer::get_in_dimension(layer);
        let out_dim = layer::get_out_dimension(layer);
        
        // Get layer tensors
        let weight_tensor = layer::get_weight_tensor(layer);
        let bias_tensor = layer::get_bias_tensor(layer);
        
        // Validate weights and biases dimensions
        let weight_mag = tensor::get_magnitude(weight_tensor);
        let weight_sign = tensor::get_sign(weight_tensor);
        assert!(vector::length(&weight_mag) == in_dim * out_dim, ELayerDimensionMismatch);
        assert!(vector::length(&weight_sign) == in_dim * out_dim, ELayerDimensionMismatch);
        
        let bias_mag = tensor::get_magnitude(bias_tensor);
        let bias_sign = tensor::get_sign(bias_tensor);
        assert!(vector::length(&bias_mag) == out_dim, ELayerDimensionMismatch);
        assert!(vector::length(&bias_sign) == out_dim, ELayerDimensionMismatch);
        
        // Emit layer completed event
        event::emit(LayerCompleted {
            model_id: object::id_address(model),
            graph_idx,
            layer_idx,
            in_dimension: in_dim,
            out_dimension: out_dim,
            is_final_layer,
        });

        if (is_final_layer) {
            model.state = MODEL_STATE_COMPLETE;
        };
    }

    /// @notice Traditional single-transaction layer addition (for layers with parameters under the limit)
    /// @param model Model object
    /// @param graph_idx Index of the graph to add layer to
    /// @param layer_type Type of layer (e.g., "dense")
    /// @param in_dimension Input dimension of the layer
    /// @param out_dimension Output dimension of the layer
    /// @param weights_magnitude Weight magnitude values
    /// @param weights_sign Weight sign values
    /// @param biases_magnitude Bias magnitude values
    /// @param biases_sign Bias sign values
    /// @return Index of the newly added layer
    public fun add_layer(
        model: &mut Model,
        graph_idx: u64,
        layer_type: String,
        in_dimension: u64,
        out_dimension: u64,
        weights_magnitude: vector<u64>,
        weights_sign: vector<u64>,
        biases_magnitude: vector<u64>,
        biases_sign: vector<u64>,
    ) {
        // Check if graph_idx is valid
        assert!(graph_idx < vector::length(&model.graphs), EGraphIndexOutOfBounds);
        
        // Update current indices
        model.current_graph_idx = graph_idx;
        
        // Validate weights and bias vector lengths
        assert!(vector::length(&weights_magnitude) == vector::length(&weights_sign), EWeightsVectorLengthMismatch);
        assert!(vector::length(&biases_magnitude) == vector::length(&biases_sign), EBiasesVectorLengthMismatch);
        assert!(vector::length(&weights_magnitude) == in_dimension * out_dimension, ELayerDimensionMismatch);
        assert!(vector::length(&biases_magnitude) == out_dimension, ELayerDimensionMismatch);
        
        // Verify we're under parameter limit for a single transaction
        let total_params = vector::length(&weights_magnitude) + vector::length(&weights_sign) + vector::length(&biases_magnitude) + vector::length(&biases_sign);
        assert!(total_params <= MAX_PARAMS_PER_TRANSACTION, EInvalidPartialLayerParams);
        
        // Create layer and add to graph
        let layer = layer::new_layer(
            layer_type, 
            in_dimension, 
            out_dimension, 
            weights_magnitude, 
            weights_sign, 
            biases_magnitude, 
            biases_sign, 
            model.scale
        );
        
        graph::add_layer(&mut model.graphs[graph_idx], layer);
        
        // Update current layer index
        model.current_layer_idx = graph::get_layer_count(&model.graphs[graph_idx]) - 1;
        
        // Emit layer added event
        event::emit(LayerAdded {
            model_id: object::id_address(model),
            graph_idx,
            layer_idx: model.current_layer_idx,
            in_dimension,
            out_dimension,
        });
    }

    public fun complete_model(model: Model) {
        assert!(model.state == MODEL_STATE_COMPLETE, EInvalidModelState);

        event::emit(ModelCompleted {
            model_id: object::id_address(&model),
            graph_count: vector::length(&model.graphs),
            total_layers: get_total_layers(&model),
        });

        transfer::share_object(model);
    }

    public fun delete_model(model: Model, _: &OpenGraphManagerCap) {
        let Model { id, .. } = model;
        id.delete();
    }

    public fun get_name(model: &Model): &String {
        &model.name
    }

    public fun get_description(model: &Model): &String {
        &model.description
    }

    public fun get_task_type(model: &Model): &String {
        &model.task_type
    }

    public fun get_scale(model: &Model): u64 {
        model.scale
    }

    fun get_total_layers(model: &Model): u64 {
        let graph_count = vector::length(&model.graphs);
        let mut total = 0;
        
        let mut i = 0;
        while (i < graph_count) {
            total = total + graph::get_layer_count(&model.graphs[i]);
            i = i + 1;
        };
        
        total
    }

    public fun add_test_dataset(model: &mut Model, test_dataset: &dataset::Dataset) {
        if (option::is_none(&model.test_dataset_ids)) {
            model.test_dataset_ids = option::some(vector::empty<ID>());
        };
        vector::push_back(option::borrow_mut(&mut model.test_dataset_ids), object::id(test_dataset));
    }

    public fun remove_test_dataset(model: &mut Model, test_dataset_id: ID): bool {
        if (option::is_none(&model.test_dataset_ids)) {
            return false
        };
        
        let mut i = 0;
        let len = vector::length(option::borrow(&model.test_dataset_ids));
        while (i < len) {
            let current_id = vector::borrow(option::borrow(&model.test_dataset_ids), i);
            if (*current_id == test_dataset_id) {
                vector::remove(option::borrow_mut(&mut model.test_dataset_ids), i);
                return true
            };
            i = i + 1;
        };
        false
    }

    public fun get_training_dataset_id(model: &Model): Option<ID> {
        model.training_dataset_id
    }

    public fun get_test_dataset_ids(model: &Model): &Option<vector<ID>> {
        &model.test_dataset_ids
    }

    public fun get_test_dataset_count(model: &Model): u64 {
        if (option::is_none(&model.test_dataset_ids)) {
            return 0
        };
        vector::length(option::borrow(&model.test_dataset_ids))
    }
    
    /// @notice Helper function to find the argmax index in result vectors
    fun find_argmax(magnitudes: &vector<u64>, signs: &vector<u64>): u64 {
        let mut max_idx = 0;
        let mut max_val = 0;
        let result_len = vector::length(magnitudes);
        
        if (result_len > 0) {
            let mut j = 0;
            while (j < result_len) {
                let val = vector::borrow(magnitudes, j);
                let sign = vector::borrow(signs, j);
                
                // Only consider positive values or zero for argmax
                if (*sign == 0 && *val > max_val) {
                    max_val = *val;
                    max_idx = j;
                };
                
                j = j + 1;
            };
        };
        
        max_idx
    }

    /// Process a single output dimension by chunks of input nodes
    /// @param model Model object to run inference on
    /// @param layer_idx Index of the layer to process
    /// @param output_dim_idx Index of the output dimension to process (0 to out_dim-1)
    /// @param input_magnitude Magnitude values of the input vector
    /// @param input_sign Sign values of the input vector
    /// @param chunk_start_idx Starting index in the input vector to process
    /// @param chunk_size Number of input nodes to process in this chunk
    /// @param accumulated_current_mag Current accumulated result magnitude from previous chunks
    /// @param accumulated_current_sign Current accumulated result sign from previous chunks
    /// @param result_magnitudes Vector of accumulated magnitude values
    /// @param result_signs Vector of accumulated sign values
    /// @return Tuple of (result_magnitudes, result_signs, current magnitude, current sign)
    public fun predict_layer_partial_chunked(
        model: &Model,
        layer_idx: u64,
        output_dim_idx: u64,
        input_magnitude: vector<u64>,
        input_sign: vector<u64>,
        chunk_start_idx: u64,
        chunk_size: u64,
        accumulated_current_mag: u64,
        accumulated_current_sign: u64,
        mut result_magnitudes: vector<u64>,
        mut result_signs: vector<u64>,
    ): (vector<u64>, vector<u64>, u64, u64) {
        assert!(vector::length(&model.graphs) > 0, EModelHasNoGraphs);
        
        // Get the first graph (currently we only support one graph per model)
        let graph = vector::borrow(&model.graphs, 0);
        
        // Validate layer index
        let layer_count = graph::get_layer_count(graph);
        assert!(layer_idx < layer_count, ELayerIndexOutOfBounds);

        let layer = graph::get_layer_at(graph, layer_idx);
        let input_dim = layer::get_in_dimension(layer);
        let output_dim = layer::get_out_dimension(layer);
        
        // Validate input/output dimension
        assert!(output_dim_idx < output_dim, EDimensionIndexOutOfBounds);
        assert!(vector::length(&input_magnitude) == input_dim, EInputDimensionMismatch);
        assert!(vector::length(&input_sign) == input_dim, EInputDimensionMismatch);
        
        // Calculate ending index for this chunk, ensuring we don't exceed input dimension
        let chunk_end_idx = if (chunk_start_idx + chunk_size > input_dim) {
            input_dim
        } else {
            chunk_start_idx + chunk_size
        };
        
        // Check if this is the last layer and last dimension
        let is_last_layer = layer_idx == layer_count - 1;
        let is_last_dimension = output_dim_idx == output_dim - 1;
        let is_last_chunk = chunk_end_idx == input_dim;
        
        // Get weight and bias tensors
        let weight_tensor = layer::get_weight_tensor(layer);
        let bias_tensor = layer::get_bias_tensor(layer);
        
        // Extract weight and bias data
        let weight_mag = tensor::get_magnitude(weight_tensor);
        let weight_sign = tensor::get_sign(weight_tensor);
        let bias_mag = tensor::get_magnitude(bias_tensor);
        let bias_sign = tensor::get_sign(bias_tensor);
        
        // Initialize result with accumulated values from previous chunks
        let mut current_magnitude = accumulated_current_mag;
        let mut current_sign = accumulated_current_sign;
        
        // Add bias for this dimension (only if this is the first chunk)
        if (chunk_start_idx == 0) {
            if (output_dim_idx < vector::length(&bias_mag)) {
                current_magnitude = *vector::borrow(&bias_mag, output_dim_idx);
                current_sign = *vector::borrow(&bias_sign, output_dim_idx);
            };
        };
        
        // Calculate dot product for this chunk of the output dimension
        let mut i = chunk_start_idx;
        while (i < chunk_end_idx) {
            // Get weight for this connection (input_dim x output_dim_idx)
            // Flattened index calculation for weight matrix
            let weight_idx = i * output_dim + output_dim_idx;
            
            if (weight_idx < vector::length(&weight_mag)) {
                let weight_mag_val = *vector::borrow(&weight_mag, weight_idx);
                let weight_sign_val = *vector::borrow(&weight_sign, weight_idx);
                
                // Get input value
                let input_mag_val = *vector::borrow(&input_magnitude, i);
                let input_sign_val = *vector::borrow(&input_sign, i);
                
                // Multiply
                let (product_sign, product_mag) = math::multiply(
                    input_sign_val, input_mag_val,
                    weight_sign_val, weight_mag_val,
                    model.scale,
                );

                // Add to result
                (current_sign, current_magnitude) = math::add(
                    current_sign, current_magnitude,
                    product_sign, product_mag,
                );
            };
            
            i = i + 1;
        };
        
        // If this is the last chunk for this output dimension
        if (is_last_chunk) {
            // Apply activation if not last layer (ReLU: max(0, x))
            if (!is_last_layer && current_sign == 1) {
                // If negative and using ReLU, set to zero
                current_magnitude = 0;
                current_sign = 0;
            };
            
            // Add the result to the accumulated vectors
            vector::push_back(&mut result_magnitudes, current_magnitude);
            vector::push_back(&mut result_signs, current_sign);
            
            // Emit partial result event
            event::emit(LayerPartialComputed {
                model_id: object::id_address(model),
                layer_idx,
                output_dim_idx,
                output_magnitude: current_magnitude,
                output_sign: current_sign,
                is_last_dimension
            });
            
            // If this is the last layer and last dimension, we can calculate the argmax
            if (is_last_layer && is_last_dimension) {
                // Calculate argmax from the accumulated result vectors
                let argmax_idx = find_argmax(&result_magnitudes, &result_signs);
                
                // Emit completion event with the full accumulated results
                event::emit(PredictionCompleted {
                    model_id: object::id_address(model),
                    output_magnitude: result_magnitudes,
                    output_sign: result_signs,
                    argmax_idx
                });
            };
        };
        
        (result_magnitudes, result_signs, current_magnitude, current_sign)
    }

    /// @notice Process a single output dimension of a layer (gas efficient version)
    /// @param model Model object to run inference on
    /// @param layer_idx Index of the layer to process
    /// @param output_dim_idx Index of the output dimension to process (0 to out_dim-1)
    /// @param input_magnitude Magnitude values of the input vector
    /// @param input_sign Sign values of the input vector
    /// @param result_magnitudes Vector of accumulated magnitude values
    /// @param result_signs Vector of accumulated sign values
    /// @return Tuple of (output magnitude scalar, output sign scalar, output dimension index, is last dimension)
    public fun predict_layer_partial(
        model: &Model,
        layer_idx: u64,
        output_dim_idx: u64,
        input_magnitude: vector<u64>,
        input_sign: vector<u64>,
        mut result_magnitudes: vector<u64>,
        mut result_signs: vector<u64>,
    ): (vector<u64>, vector<u64>, u64, bool) {
        assert!(vector::length(&model.graphs) > 0, EModelHasNoGraphs);
        
        // Get the first graph (currently we only support one graph per model)
        let graph = vector::borrow(&model.graphs, 0);
        
        // Validate layer index
        let layer_count = graph::get_layer_count(graph);
        assert!(layer_idx < layer_count, ELayerIndexOutOfBounds);
        
        // Get the target layer
        let layer = graph::get_layer_at(graph, layer_idx);
        let input_dim = layer::get_in_dimension(layer);
        let output_dim = layer::get_out_dimension(layer);
        
        // Validate input/output dimension
        assert!(output_dim_idx < output_dim, EDimensionIndexOutOfBounds);
        assert!(vector::length(&input_magnitude) == input_dim, EInputDimensionMismatch);
        assert!(vector::length(&input_sign) == input_dim, EInputDimensionMismatch);
        
        // Check if this is the last layer and last dimension
        let is_last_layer = layer_idx == layer_count - 1;
        let is_last_dimension = output_dim_idx == output_dim - 1;
        
        // Get weight and bias tensors
        let weight_tensor = layer::get_weight_tensor(layer);
        let bias_tensor = layer::get_bias_tensor(layer);
        
        // Extract weight and bias data
        let weight_mag = tensor::get_magnitude(weight_tensor);
        let weight_sign = tensor::get_sign(weight_tensor);
        let bias_mag = tensor::get_magnitude(bias_tensor);
        let bias_sign = tensor::get_sign(bias_tensor);
        
        // Calculate single output dimension (dot product for this dimension only)
        let mut result_mag = 0;
        let mut result_sign = 0;
        
        // Add bias for this dimension
        if (output_dim_idx < vector::length(&bias_mag)) {
            result_mag = *vector::borrow(&bias_mag, output_dim_idx);
            result_sign = *vector::borrow(&bias_sign, output_dim_idx);
        };
        
        // Calculate dot product for this single output dimension
        let mut i = 0;
        while (i < input_dim) {
            // Get weight for this connection (input_dim x output_dim_idx)
            // Flattened index calculation for weight matrix
            let weight_idx = i * output_dim + output_dim_idx;
            
            if (weight_idx < vector::length(&weight_mag)) {
                let weight_mag_val = *vector::borrow(&weight_mag, weight_idx);
                let weight_sign_val = *vector::borrow(&weight_sign, weight_idx);
                
                // Get input value
                let input_mag_val = *vector::borrow(&input_magnitude, i);
                let input_sign_val = *vector::borrow(&input_sign, i);

                // Multiply
                let (product_sign, product_mag) = math::multiply(
                    input_sign_val, input_mag_val,
                    weight_sign_val, weight_mag_val,
                    model.scale,
                );

                // Add to result
                (result_sign, result_mag) = math::add(
                    result_sign, result_mag,
                    product_sign, product_mag,
                );
            };
            
            i = i + 1;
        };
        
        // Apply activation if not last layer (ReLU: max(0, x))
        if (!is_last_layer && result_sign == 1) {
            // If negative and using ReLU, set to zero
            result_mag = 0;
            result_sign = 0;
        };

        vector::push_back(&mut result_magnitudes, result_mag);
        vector::push_back(&mut result_signs, result_sign);
        
        // Emit partial result event
        event::emit(LayerPartialComputed {
            model_id: object::id_address(model),
            layer_idx,
            output_dim_idx,
            output_magnitude: result_mag,
            output_sign: result_sign,
            is_last_dimension
        });
        
        // If this is the last layer and last dimension, we can calculate the argmax across collected results
        if (is_last_layer && is_last_dimension) {
            // Calculate argmax from the accumulated result vectors
            let argmax_idx = find_argmax(&result_magnitudes, &result_signs);
            
            // Emit completion event with the full accumulated results
            event::emit(PredictionCompleted {
                model_id: object::id_address(model),
                output_magnitude: result_magnitudes,
                output_sign: result_signs,
                argmax_idx
            });
        };
        
        (result_magnitudes, result_signs, output_dim_idx, is_last_dimension)
    }

}