// Copyright (c) OpenGraph, Inc.
// SPDX-License-Identifier: Apache-2.0

module tensorflowsui::math {
  use std::u64;

  /// @dev Error when an overflow occurs
  const EOverflow: u64 = 3001;
  /// @dev Error when a scale is too large
  const EScaleTooLarge: u64 = 3002;

  const SignPositive: u64 = 0;
  const SignNegative: u64 = 1;

  // Pre-computed powers of 10 for O(1) lookup instead of O(n) loop
  const SCALE_FACTORS: vector<u64> = vector[
    1,                     // 10^0
    10,                    // 10^1
    100,                   // 10^2
    1000,                  // 10^3
    10000,                 // 10^4
    100000,                // 10^5
    1000000,               // 10^6
    10000000,              // 10^7
    100000000,             // 10^8
    1000000000,            // 10^9
    10000000000,           // 10^10
    100000000000,          // 10^11
    1000000000000,         // 10^12
    10000000000000,        // 10^13
    100000000000000,       // 10^14
    1000000000000000,      // 10^15
    10000000000000000,     // 10^16
    100000000000000000,    // 10^17
    1000000000000000000    // 10^18 (max safe for u64)
  ];

  public fun add(
    s1: u64, m1: u64,
    s2: u64, m2: u64,
  ): (u64, u64) {
    if (s1 == s2) {
      // Same sign: add magnitudes
      assert!(m1 <= (u64::max_value!() - m2), EOverflow); // check if m1 + m2 would overflow
      (s1, m1 + m2)
    } else if (m1 >= m2) {
      // Different signs: subtract magnitudes
      (s1, m1 - m2)
    } else {
      (s2, m2 - m1)
    }
  }

  /// @dev Multiplies two signed u64 values with an optional scale factor
  /// if scale is greater than 0, scaling down is included in the multiplication.
  public fun multiply(
    s1: u64, m1: u64,
    s2: u64, m2: u64,
    scale: u64,
  ): (u64, u64) {
    if (m1 == 0 || m2 == 0) {
      (SignPositive, 0)
    } else {
      let result_sign = if (s1 == s2) SignPositive else SignNegative;

      assert!(m1 <= (u64::max_value!() / m2), EOverflow); // Check for overflow before multiplication

      // Because each number is already scaled up, we need to scale down the multiplication result
      let mut result_magnitude = m1 * m2;
      if (scale > 0) {
        result_magnitude = scale_down(result_magnitude, scale);

        (result_sign, result_magnitude)
      } else {
        (result_sign, result_magnitude)
      }
    }
  }

  public fun compare(s1: u64, m1: u64, s2: u64, m2: u64): bool {
    if (s1 != s2) {
      // If signs are different, positive is always greater than negative
      s1 == SignPositive
    }  else if (s1 == SignPositive) {
      // Both positive: compare magnitudes directly
      m1 > m2
    } else {
      // Both negative: compare magnitudes inversely
      m1 < m2
    }
  }

  public fun is_positive(s: u64): bool {
    s == SignPositive
  }

  public fun get_scale_factor(scale: u64): u64 {
    let scale_factors = SCALE_FACTORS;
    assert!(scale < vector::length(&scale_factors), EScaleTooLarge);
    let factor = scale_factors[scale];

    factor
  }

  public fun scale_up(value: u64, scale: u64): u64 {
    let scale_factors = SCALE_FACTORS;
    assert!(scale < vector::length(&scale_factors), EScaleTooLarge);
    let factor = scale_factors[scale];
    assert!(value == 0 || factor <= (u64::max_value!() / value), 3005); // Overflow protection
    
    value * factor
  }

  public fun scale_down(value: u64, scale: u64): u64 {
    let scale_factors = SCALE_FACTORS;
    assert!(scale < vector::length(&scale_factors), EScaleTooLarge);
    let factor = scale_factors[scale];

    value / factor
  }
}
