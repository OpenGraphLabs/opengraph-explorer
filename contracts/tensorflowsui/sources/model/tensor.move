// Copyright (c) OpenGraph, Inc.
// SPDX-License-Identifier: Apache-2.0

/// @title Fully Onchain Neural Network Inference Implementation
module tensorflowsui::tensor {
    use tensorflowsui::math;

    public struct Tensor has copy, drop, store {
        shape : vector<u64>,
        magnitude : vector<u64>,
        sign : vector<u64>,
        scale : u64,
    }

    /// Initialize an empty vector with zeros to the specified length
    fun init_zero_vector(length: u64): vector<u64> {
        let mut result = vector::empty<u64>();
        let mut i = 0;
        while (i < length) {
            vector::push_back(&mut result, 0);
            i = i + 1;
        };
        result
    }

    public fun new_tensor(shape: vector<u64>, magnitude: vector<u64>, sign: vector<u64>, scale: u64): Tensor {
        let total_elements = num_elements(&shape);
        
        // Defense logic: Initialize vectors if empty or incorrectly sized
        let mag = if (vector::is_empty(&magnitude)) {
            init_zero_vector(total_elements)
        } else {
            magnitude
        };
        
        let sgn = if (vector::is_empty(&sign)) {
            init_zero_vector(total_elements)
        } else {
            sign
        };
        
        Tensor {
            shape,
            magnitude: mag,
            sign: sgn,
            scale
        }
    }

    public fun num_elements(shape : &vector<u64>): u64 {
        let len =  vector::length(shape);
        let mut product = 1;
        let mut i =0;
        while (i < len) {
            product = product * *vector::borrow(shape, i);
            i= i+1;
        };
        product
    }

    public fun get_scale(t: &Tensor): u64 {
        t.scale
    }

    public fun get_shape(t: &Tensor): vector<u64> {
        t.shape
    }

    public fun get_magnitude(t: &Tensor): vector<u64> {
        t.magnitude
    }

    public fun get_sign(t: &Tensor): vector<u64> {
        t.sign
    }

    /// @notice Updates tensor values starting at a specific index
    /// @param tensor Tensor to update
    /// @param start_idx Starting index in the flattened tensor array
    /// @param new_magnitudes New magnitude values to update
    /// @param new_signs New sign values to update
    public fun update_values(
        tensor: &mut Tensor,
        start_idx: u64,
        new_magnitudes: vector<u64>,
        new_signs: vector<u64>
    ) {
        let total_elements = num_elements(&tensor.shape);
        let new_values_count = vector::length(&new_magnitudes);
        let mag_length = vector::length(&tensor.magnitude);
        let sign_length = vector::length(&tensor.sign);
        
        // Safety check: ensure tensor vectors have correct sizes
        assert!(mag_length == total_elements, 2004); // Tensor magnitude vector size mismatch
        assert!(sign_length == total_elements, 2005); // Tensor sign vector size mismatch
        
        // Validate parameters
        assert!(start_idx < total_elements, 2001); // Invalid start index
        assert!(start_idx + new_values_count <= total_elements, 2002); // Update exceeds tensor size
        assert!(vector::length(&new_magnitudes) == vector::length(&new_signs), 2003); // Magnitude and sign vectors must have same length
        
        // Update values
        let mut i = 0;
        while (i < new_values_count) {
            let tensor_idx = start_idx + i;
            
            // Safety check: ensure index is in bounds
            assert!(tensor_idx < mag_length, 2006); // Index out of bounds for magnitude
            assert!(tensor_idx < sign_length, 2007); // Index out of bounds for sign
            
            // Update magnitude
            *vector::borrow_mut(&mut tensor.magnitude, tensor_idx) = *vector::borrow(&new_magnitudes, i);
            
            // Update sign
            *vector::borrow_mut(&mut tensor.sign, tensor_idx) = *vector::borrow(&new_signs, i);
            
            i = i + 1;
        };
    }

    fun reverse_bytes(buf: &mut vector<u8>) {
        let mut left = 0;
        let mut right = vector::length(buf);
        if (right == 0) {
            return
        };
        right = right - 1;

        while (left < right) {
            let tmp_left  = *vector::borrow(buf, left);
            let tmp_right = *vector::borrow(buf, right);

            *vector::borrow_mut(buf, left)  = tmp_right;
            *vector::borrow_mut(buf, right) = tmp_left;

            left  = left + 1;
            right = right - 1;
        };
    }

    fun safe_to_u8(c: u64): u8 {
        assert!(c >= 48 && c <= 57, 9999);

        if (c == 48) { return 48u8 };
        if (c == 49) { return 49u8 };
        if (c == 50) { return 50u8 };
        if (c == 51) { return 51u8 };
        if (c == 52) { return 52u8 };
        if (c == 53) { return 53u8 };
        if (c == 54) { return 54u8 };
        if (c == 55) { return 55u8 };
        if (c == 56) { return 56u8 };
        if (c == 57) { return 57u8 };
        abort 9999
    }

    fun append_bytes(buf: &mut vector<u8>, data: &vector<u8>) {
        let len_data = vector::length(data);
        let mut i = 0;
        while (i < len_data) {
            vector::push_back(buf, *vector::borrow(data, i));
            i = i + 1;
        }
    }

    fun u64_to_bytes(num: u64): vector<u8> {
        if (num == 0) {
            // "0" => [48]
            let mut zero_vec = vector::empty<u8>();
            vector::push_back(&mut zero_vec, 48u8); // 48 = '0'
            return zero_vec
        };

        let mut digits = vector::empty<u8>();
        let mut x = copy num;

        while (x > 0) {
            let d = x % 10;   // 0..9
            let c = 48 + d;   // '0'=48 ~ '9'=57
            vector::push_back(&mut digits, safe_to_u8(c));
            x = x / 10;
        };

        reverse_bytes(&mut digits); // reverse the digit order

        digits
    }

    public fun to_string(tensor: &Tensor): vector<u8> {
        let len = vector::length(&tensor.magnitude);

        let mut bytes = vector::empty<u8>();

        append_bytes(&mut bytes, &b"[");

        let mut i = 0;
        while (i < len) {
        
            let sgn = *vector::borrow(&tensor.sign, i);
            if (sgn == 1) {
                
                append_bytes(&mut bytes, &b"-");
            };

            let mag = *vector::borrow(&tensor.magnitude, i);
            let divisor = math::scale_up(1, tensor.scale);
            let integer_val = mag / divisor;   // ex: 1234 -> 12.34
            let fraction_val = mag % divisor;

            let int_bytes = u64_to_bytes(integer_val);  
            append_bytes(&mut bytes, &int_bytes);
            append_bytes(&mut bytes, &b".");

            let frac_bytes = u64_to_bytes(fraction_val);
            append_bytes(&mut bytes, &frac_bytes);

            if (i < len - 1) {
                append_bytes(&mut bytes, &b", ");
            };

            i = i + 1;
        };

        append_bytes(&mut bytes, &b"]");

        bytes
    }

    public fun debug_print_tensor(tensor: &Tensor) {
        let s_str = to_string(tensor);        
        std::debug::print(&std::string::utf8(s_str));
    }

    public fun add(a: &Tensor, b: &Tensor): Tensor {
        assert!(a.scale == b.scale, 1001);
        assert!(a.shape == b.shape, 1002); // Ensure tensors have same shape
        let len = vector::length(&a.magnitude);
        assert!(len == vector::length(&b.magnitude), 1002);

        let mut out_mag = vector::empty<u64>();
        let mut out_sign= vector::empty<u64>();

        let mut i = 0;
        while (i < len) {
            let s1 = *vector::borrow(&a.sign, i);
            let m1 = *vector::borrow(&a.magnitude, i);
            let s2 = *vector::borrow(&b.sign, i);
            let m2 = *vector::borrow(&b.magnitude, i);

            let (res_s, res_m) = math::add(s1, m1, s2, m2);
            vector::push_back(&mut out_sign, res_s);
            vector::push_back(&mut out_mag,  res_m);

            i = i + 1;
        };

        Tensor {
            shape: copy a.shape,
            magnitude: out_mag,
            sign: out_sign,
            scale: a.scale
        }
    }

    public fun multiply(a: &Tensor, b: &Tensor): Tensor {
        assert!(a.scale == b.scale, 1201);
        let scale = a.scale;
        let len = vector::length(&a.magnitude);
        assert!(len == vector::length(&b.magnitude), 1202);

        let mut out_mag = vector::empty<u64>();
        let mut out_sign= vector::empty<u64>();

        let mut i = 0;
        while (i < len) {
            let s1 = *vector::borrow(&a.sign, i);
            let m1 = *vector::borrow(&a.magnitude, i);
            let s2 = *vector::borrow(&b.sign, i);
            let m2 = *vector::borrow(&b.magnitude, i);

            let (res_s, res_m) = math::multiply(s1, m1, s2, m2, scale);
            vector::push_back(&mut out_sign, res_s);
            vector::push_back(&mut out_mag,  res_m);

            i = i + 1;
        };

        Tensor {
            shape: copy a.shape,
            magnitude: out_mag,
            sign: out_sign,
            scale: a.scale
        }
    }


    /// @notice Optimized string conversion with O(1) scaling instead of O(n)
    public fun to_string_optimized(tensor: &Tensor): vector<u8> {
        let len = vector::length(&tensor.magnitude);

        let mut bytes = vector::empty<u8>();

        append_bytes(&mut bytes, &b"[");

        let mut i = 0;
        while (i < len) {
        
            let sgn = *vector::borrow(&tensor.sign, i);
            if (sgn == 1) {
                append_bytes(&mut bytes, &b"-");
            };

            let mag = *vector::borrow(&tensor.magnitude, i);
            let divisor = math::scale_up(1, tensor.scale); // O(1) instead of O(scale)
            let integer_val = mag / divisor;
            let fraction_val = mag % divisor;

            let int_bytes = u64_to_bytes(integer_val);  
            append_bytes(&mut bytes, &int_bytes);
            append_bytes(&mut bytes, &b".");

            let frac_bytes = u64_to_bytes(fraction_val);
            append_bytes(&mut bytes, &frac_bytes);

            if (i < len - 1) {
                append_bytes(&mut bytes, &b", ");
            };

            i = i + 1;
        };

        append_bytes(&mut bytes, &b"]");

        bytes
    }

    public fun max_value(t: &Tensor): (u64, u64) {
        let n = vector::length(&t.magnitude);
        assert!(n > 0, 2001);

        let mut max_sgn = *vector::borrow(&t.sign, 0);
        let mut max_mag = *vector::borrow(&t.magnitude, 0);

        let mut i = 1;
        while (i < n) {
            let sgn_i = *vector::borrow(&t.sign, i);
            let mag_i = *vector::borrow(&t.magnitude, i);

            if (math::compare(sgn_i, mag_i, max_sgn, max_mag)) {
                max_sgn = sgn_i;
                max_mag = mag_i;
            };
            i = i + 1;
        };

        (max_sgn, max_mag)
    }

    public fun argmax(t: &Tensor): u64 {
        let n = vector::length(&t.magnitude);
        assert!(n > 0, 2101);

        let mut max_index = 0;
        let mut max_sgn   = *vector::borrow(&t.sign, 0);
        let mut max_mag   = *vector::borrow(&t.magnitude, 0);

        let mut i = 1;
        while (i < n) {
            let sgn_i = *vector::borrow(&t.sign, i);
            let mag_i = *vector::borrow(&t.magnitude, i);

            if (math::compare(sgn_i, mag_i, max_sgn, max_mag)) {
                max_sgn   = sgn_i;
                max_mag   = mag_i;
                max_index = i;
            };

            i = i + 1;
        };
        max_index
    }
}
