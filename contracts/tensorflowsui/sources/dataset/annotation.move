// Copyright (c) OpenGraph, Inc.
// SPDX-License-Identifier: Apache-2.0

module tensorflowsui::annotation {
  use std::string::{Self, String};
  use sui::address;

  public struct Annotation has copy, drop, store {
    status: AnnotationStatus,
    value: AnnotationValue,
  }

  public enum AnnotationStatus has copy, drop, store {
    Pending,
    Confirmed,
    Rejected,
  }

  public enum AnnotationValue has copy, drop, store {
    Label(LabelAnnotation),
    BBox(BBoxAnnotation),
    Skeleton(SkeletonAnnotation),
  }

  public struct LabelAnnotation has copy, drop, store {
    label: String,
    annotated_by: address,
  }

  public struct BBoxAnnotation has copy, drop, store {
    // coordinates of the bounding box [x, y, w, h]
    x: u64,
    y: u64,
    w: u64,
    h: u64,
    annotated_by: address,
  }

  public struct SkeletonAnnotation has copy, drop, store {
    keypoints: vector<Point>, // keypoints of the skeleton [(x1,y1), (x2,y2), ...]
    edges: vector<Edge>,  // edges connecting keypoints [(start_idx, end_idx), ...]
    annotated_by: address,
  }

  public struct Point has copy, drop, store {
    // x: u64,
    // y: u64,
  }

  public struct Edge has copy, drop, store {
    // start_idx: u64,
    // end_idx: u64,
  }

  public struct AnnotationPath has copy, drop, store {
    path: String,
  }

  public fun new_annotation_path(annotation: Annotation, ctx: &mut TxContext): AnnotationPath {
    // annotation path key format `address::value`
    let mut path = address::to_string(ctx.sender());
    path.append(string::utf8(b"::"));
    match (annotation.value) {
      AnnotationValue::Label(value) => {
        path.append(value.label);
      },
      AnnotationValue::BBox(value) => {
        // format: x,y,w,h
        path.append(value.x.to_string());
        path.append_utf8(b",");
        path.append(value.y.to_string());
        path.append_utf8(b",");
        path.append(value.w.to_string());
        path.append_utf8(b",");
        path.append(value.h.to_string());
      },
      AnnotationValue::Skeleton(_) => {
        // format: keypoints,edges
        // TODO(jarry): format keypoints and edges
        path.append(string::utf8(b"keypoints"));
        path.append_utf8(b",");
        path.append(string::utf8(b"edges"));
      }
    };

    AnnotationPath { path }
  }

  public fun new_label_annotation(label: String, annotated_by: address): Annotation {
    Annotation { 
      status: AnnotationStatus::Pending,
      value: AnnotationValue::Label(LabelAnnotation { label, annotated_by })
    }
  }

  public fun new_bbox_annotation(x: u64, y: u64, w: u64, h: u64, annotated_by: address): Annotation {
    Annotation { 
      status: AnnotationStatus::Pending,
      value: AnnotationValue::BBox(BBoxAnnotation { x, y, w, h, annotated_by })
    }
  }

  public fun new_skeleton_annotation(keypoints: vector<Point>, edges: vector<Edge>, annotated_by: address): Annotation {
    // TODD(jarry): logic for initializing keypoints and edges from primitive inputs
    Annotation { 
      status: AnnotationStatus::Pending,
      value: AnnotationValue::Skeleton(SkeletonAnnotation { keypoints, edges, annotated_by })
    }
  }

  public fun approve_annotation(annotation: &mut Annotation) {
    annotation.status = AnnotationStatus::Confirmed;
  }

  public fun reject_annotation(annotation: &mut Annotation) {
    annotation.status = AnnotationStatus::Rejected;
  }
}
