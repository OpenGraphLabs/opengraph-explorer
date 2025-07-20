// Copyright (c) OpenGraph, Inc.
// SPDX-License-Identifier: Apache-2.0

module tensorflowsui::metadata {
    use std::string::String;

    /// A struct that contains the Dataset's metadata.
    public struct Metadata has copy, drop, store {
        description: Option<String>,
        tags: Option<vector<String>>,
        data_type: String,
        data_size: u64,
        data_count: u64,
        creator: Option<String>,
        license: Option<String>,
    }

    /// Creates a new Metadata object.
    public fun new_metadata(
        description: Option<String>,
        data_type: String,
        data_size: u64,
        data_count: u64,
        creator: Option<String>,
        license: Option<String>,
        tags: Option<vector<String>>,
    ): Metadata {
        Metadata {
            description,
            data_type,
            data_size,
            data_count,
            creator,
            license,
            tags,
        }
    }

    /// Getters for Metadata fields
    public fun description(metadata: &Metadata): Option<String> {
        metadata.description
    }

    public fun tags(metadata: &Metadata): Option<vector<String>> {
        metadata.tags
    }

    public fun data_type(metadata: &Metadata): String {
        metadata.data_type
    }

    public fun data_size(metadata: &Metadata): u64 {
        metadata.data_size
    }

    public fun data_count(metadata: &Metadata): u64 {
        metadata.data_count
    }

    public fun creator(metadata: &Metadata): Option<String> {
        metadata.creator
    }

    public fun license(metadata: &Metadata): Option<String> {
        metadata.license
    }

    /// Setters for Metadata fields
    public fun set_description(metadata: &mut Metadata, description: Option<String>) {
        metadata.description = description;
    }

    public fun set_tags(metadata: &mut Metadata, tags: Option<vector<String>>) {
        metadata.tags = tags;
    }

    public fun set_data_type(metadata: &mut Metadata, data_type: String) {
        metadata.data_type = data_type;
    }

    public fun set_data_size(metadata: &mut Metadata, data_size: u64) {
        metadata.data_size = data_size;
    }

    public fun set_creator(metadata: &mut Metadata, creator: Option<String>) {
        metadata.creator = creator;
    }

    public fun set_license(metadata: &mut Metadata, license: Option<String>) {
        metadata.license = license;
    }
}
