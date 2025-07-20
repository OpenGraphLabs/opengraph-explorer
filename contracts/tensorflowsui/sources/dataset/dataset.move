// Copyright (c) OpenGraph, Inc.
// SPDX-License-Identifier: Apache-2.0

module tensorflowsui::dataset {
  use std::string::{Self, String};
  use sui::display::{Self, Display};
  use sui::package::{Self, Publisher};
  use tensorflowsui::metadata;
  use tensorflowsui::annotation;
  use sui::event;
  use sui::dynamic_field;

  const OPENGRAPH_LICENSE: vector<u8> = b"OpenGraph License";

  /// Error codes
  const EStartAndEndRangeAreNone: u64 = 0;
  const ERangeStartGreaterThanRangeEnd: u64 = 1;

  /// Event emitted when a new dataset is created.
  public struct DatasetCreated has copy, drop {
    dataset_id: ID,
  }

  /// Event emitted when a dataset is burned.
  public struct DatasetBurnedEvent has copy, drop {
    dataset_id: ID,
  }


  /// Emits a DatasetCreated event.
  public fun emit_dataset_created(dataset_id: ID) {
      event::emit(DatasetCreated { dataset_id });
  }

  /// Emits a DatasetBurned event.
  public fun emit_dataset_burned(dataset_id: ID) {
    event::emit(DatasetBurnedEvent {
        dataset_id,
    });
  }

  /// One-Time-Witness for the module.
  public struct DATASET has drop {}

  fun init(otw: DATASET, ctx: &mut TxContext) {
    let publisher = package::claim(otw, ctx);
    let d = init_dataset_display(&publisher, ctx);
    transfer::public_transfer(d, ctx.sender());
    transfer::public_transfer(publisher, ctx.sender());
  }

  /// The dataset published on Sui.
  public struct Dataset has key, store {
      id: UID,
      name: String,
      description: Option<String>,
      // tags of the dataset
      tags: Option<vector<String>>,
      // type of the data in the dataset (eg. parquet, csv, json, png, jpg, etc.)
      data_type: String,
      // size of the data in the dataset
      data_size: u64,
      // number of data in the dataset
      data_count: u64,
      // creator of the dataset
      creator: Option<String>,
      // license of the dataset
      license: String,
  }

  /// A data in a dataset.
  public struct Data has key, store {
      id: UID,
      path: String,

      // The walrus blob id containing the bytes for this resource.
      blob_id: String,

      // Contains the hash of the contents of the blob
      // to verify its integrity.
      blob_hash: String,

      // The type of the data in the dataset
      data_type: String,

      // Defines the byte range of the resource contents
      // in the case where multiple resources are stored
      // in the same blob. This way, each resource will
      // be parsed using its' byte range in the blob.
      range: Option<Range>,
  }

  public struct Range has drop, store {
      start: Option<u64>, // inclusive lower bound
      end: Option<u64>, // exclusive upper bound
  }

  /// Representation of the data path.
  /// Ensures there are no namespace collisions in the dynamic_object_fields.
  public struct DataPath has copy, drop, store {
      path: String,
  }

  fun new_data_path(path: String): DataPath {
    DataPath { path }
  }

  /// Creates a new dataset.
  public fun new_dataset(name: String, metadata: metadata::Metadata, ctx: &mut TxContext): Dataset {
    let license: String = option::get_with_default(
      &metadata::license(&metadata), 
      string::utf8(OPENGRAPH_LICENSE),
    );

    let dataset = Dataset {
        id: object::new(ctx),
        name,
        description: metadata::description(&metadata),
        data_type: metadata::data_type(&metadata),
        data_size: metadata::data_size(&metadata),
        data_count: metadata::data_count(&metadata),
        creator: metadata::creator(&metadata),
        license: license,
        tags: metadata::tags(&metadata),
    };
    emit_dataset_created(
        object::id(&dataset),
    );
    
    dataset
  }

  /// Optionally creates a new Range object.
  public fun new_range_option(range_start: Option<u64>, range_end: Option<u64>): Option<Range> {
      if (range_start.is_none() && range_end.is_none()) {
          return option::none<Range>()
      };
      option::some(new_range(range_start, range_end))
  }

  /// Creates a new Range object.
  ///
  /// Aborts if both range_start and range_end are none.
  /// Aborts if the range_start is greater than the range_end.
  public fun new_range(range_start: Option<u64>, range_end: Option<u64>): Range {
      let start_is_defined = range_start.is_some();
      let end_is_defined = range_end.is_some();

      // At least one of the range bounds should be defined.
      assert!(start_is_defined || end_is_defined, EStartAndEndRangeAreNone);

      // If both range bounds are defined, the upper bound should be greater than the lower.
      if (start_is_defined && end_is_defined) {
          let start = option::borrow(&range_start);
          let end = option::borrow(&range_end);
          assert!(*end > *start, ERangeStartGreaterThanRangeEnd);
      };

      Range {
          start: range_start,
          end: range_end,
      }
  }

  /// Updates the name of a dataset.
  public fun update_name(dataset: &mut Dataset, new_name: String) {
    dataset.name = new_name
  }

  /// Update the site metadata.
  public fun update_metadata(dataset: &mut Dataset, metadata: metadata::Metadata) {
    dataset.description = metadata::description(&metadata);
    dataset.data_type = metadata::data_type(&metadata);
    dataset.data_size = metadata::data_size(&metadata);
    dataset.creator = metadata::creator(&metadata);
  }

  /// Creates a new Data object.
  public fun new_data(
      path: String,
      blob_id: String,
      blob_hash: String,
      data_type: String,
      range: Option<Range>,
      ctx: &mut TxContext,
  ): Data {
      Data {
          id: object::new(ctx),
          path,
          blob_id,
          blob_hash,
          data_type,
          range,
      }
  }

  /// Adds a data to an existing dataset.
  public fun add_data(dataset: &mut Dataset, data: Data) {
    let path_obj = new_data_path(data.path);
    dynamic_field::add(&mut dataset.id, path_obj, data);
  }

  public fun borrow_mut_data(dataset: &mut Dataset, path: String): &mut Data {
    let path_obj = new_data_path(path);
    dynamic_field::borrow_mut(&mut dataset.id, path_obj)
  }

  /// Removes a data from a dataset.
  ///
  /// Aborts if the data does not exist.
  public fun remove_data(dataset: &mut Dataset, path: String): Data {
    let path_obj = new_data_path(path);
    dynamic_field::remove(&mut dataset.id, path_obj)
  }

  /// Changes the path of a data on a dataset.
  public fun move_data(dataset: &mut Dataset, old_path: String, new_path: String) {
    let mut data = remove_data(dataset, old_path);
    data.path = new_path;
    add_data(dataset, data);
  }

  public fun add_annotation(data: &mut Data, annotation: annotation::Annotation, ctx: &mut TxContext) {
    let path_obj = annotation::new_annotation_path(annotation, ctx);
    dynamic_field::add(&mut data.id, path_obj, annotation);
  }

  public fun add_annotations(dataset: &mut Dataset, path: String, annotations: vector<annotation::Annotation>, ctx: &mut TxContext) {
    let data = borrow_mut_data(dataset, path);
    let mut i = 0;
    let len = vector::length(&annotations);
    while (i < len) {
      let annotation = *vector::borrow(&annotations, i);
      add_annotation(data, annotation, ctx);
      i = i + 1;
    }
  }

  /// Deletes a dataset object.
  ///
  /// NB: This function does **NOT** delete the dynamic fields! Make sure to call this function
  /// after deleting manually all the dynamic fields attached to the dataset object. If you don't
  /// delete the dynamic fields, they will become unaccessible and you will not be able to delete
  /// them in the future.
  public fun burn(dataset: Dataset) {
    emit_dataset_burned(object::id(&dataset));
    let Dataset {
        id,
        ..,
    } = dataset;
    id.delete();
  }

  /// Define a Display for the Dataset objects.
  fun init_dataset_display(publisher: &Publisher, ctx: &mut TxContext): Display<Dataset> {
      let keys = vector[
          b"name".to_string(),
          b"description".to_string(),
          b"tags".to_string(),
          b"data_type".to_string(),
          b"data_size".to_string(),
          b"creator".to_string(),
          b"license".to_string(),
      ];

      let values = vector[
          b"{name}".to_string(),
          b"{description}".to_string(),
          b"{tags}".to_string(),
          b"{data_type}".to_string(),
          b"{data_size}".to_string(),
          b"{creator}".to_string(),
          b"{license}".to_string(),
      ];

      let mut d = display::new_with_fields<Dataset>(
          publisher,
          keys,
          values,
          ctx,
      );

      d.update_version();
      d
  }

  /// Makes an owned dataset into a shared object that anyone can access and modify.
  public entry fun share_dataset(dataset: Dataset) {
    transfer::share_object(dataset);
  }
}
