// Copyright (c) OpenGraph, Inc.
// SPDX-License-Identifier: Apache-2.0

module tensorflowsui::layer {
    use std::string;
    use tensorflowsui::tensor;

    // const NONE : u64= 0;
    // const RELU : u64= 1;
    // const SOFTMAX : u64 = 2;

    const ERR_INVALID_START_INDEX: u64 = 10005;
    const ERR_CHUNK_TOO_LARGE: u64 = 10006;

    public struct Layer has copy, drop, store {
        layer_type: string::String,
        in_dimension: u64,
        out_dimension: u64,
        weight_tensor: tensor::Tensor,
        bias_tensor: tensor::Tensor,
    }

    public fun new_layer(
        layer_type: string::String,
        in_dimension: u64,
        out_dimension: u64,
        weights_magnitudes: vector<u64>,
        weights_signs: vector<u64>,
        biases_magnitudes: vector<u64>,
        biases_signs: vector<u64>,
        scale: u64,
    ): Layer {
        let weight_tensor = tensor::new_tensor(
          vector[in_dimension, out_dimension],
            weights_magnitudes,
            weights_signs,
            scale,
          );

        let bias_tensor = tensor::new_tensor(
          vector[out_dimension], 
          biases_magnitudes, 
          biases_signs, 
          scale,
          );
          
        Layer {
            layer_type,
            in_dimension,
            out_dimension,
            weight_tensor,
            bias_tensor,
        }
    }

    /// @notice Adds a chunk of weights to the layer's weight tensor
    /// @param layer The layer to modify
    /// @param start_idx Starting index in the flattened weights array
    /// @param weights_magnitudes Weight magnitude values for this chunk
    /// @param weights_signs Weight sign values for this chunk
    public fun add_weights_chunk(
        layer: &mut Layer,
        start_idx: u64,
        weights_magnitudes: vector<u64>,
        weights_signs: vector<u64>,
    ) {
        // Get current weight tensor
        let weight_tensor = &mut layer.weight_tensor;

        // Validate start index
        let total_size = layer.in_dimension * layer.out_dimension;
        assert!(start_idx < total_size, ERR_INVALID_START_INDEX);

        // Validate chunk size doesn't exceed total possible size
        let chunk_size = vector::length(&weights_magnitudes);
        assert!(start_idx + chunk_size <= total_size, ERR_CHUNK_TOO_LARGE);

        // Update weight tensor
        tensor::update_values(
            weight_tensor,
            start_idx,
            weights_magnitudes,
            weights_signs
        );
    }

    /// @notice Adds a chunk of biases to the layer's bias tensor
    /// @param layer The layer to modify
    /// @param start_idx Starting index in the biases array
    /// @param biases_magnitudes Bias magnitude values for this chunk
    /// @param biases_signs Bias sign values for this chunk
    public fun add_biases_chunk(
        layer: &mut Layer,
        start_idx: u64,
        biases_magnitudes: vector<u64>,
        biases_signs: vector<u64>,
    ) {
        // Get current bias tensor
        let bias_tensor = &mut layer.bias_tensor;

        // Validate start index
        let total_size = layer.out_dimension;
        assert!(start_idx < total_size, ERR_INVALID_START_INDEX);

        // Validate chunk size doesn't exceed total possible size
        let chunk_size = vector::length(&biases_magnitudes);
        assert!(start_idx + chunk_size <= total_size, ERR_CHUNK_TOO_LARGE);

        // Update bias tensor
        tensor::update_values(
            bias_tensor,
            start_idx,
            biases_magnitudes,
            biases_signs
        );
    }

    public fun ReLu(weighted_sum : u64): u64 {
        if (weighted_sum > 0) {
            weighted_sum
        } else {
            0
        }
    }

    public fun get_weight_tensor(layer: &Layer): &tensor::Tensor {
        &layer.weight_tensor
    }

    public fun get_bias_tensor(layer: &Layer): &tensor::Tensor {
        &layer.bias_tensor
    }

    public fun get_in_dimension(layer: &Layer): u64 {
        layer.in_dimension
    }

    public fun get_out_dimension(layer: &Layer): u64 {
        layer.out_dimension
    }
}