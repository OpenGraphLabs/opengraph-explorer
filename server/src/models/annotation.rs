#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct LabelAnnotation {
    pub id: String,
    pub label: String,
    pub confidence: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct BoundingBox {
    pub id: String,
    #[validate(range(min = 0.0))]
    pub x: f64,
    #[validate(range(min = 0.0))]
    pub y: f64,
    #[validate(range(min = 0.0))]
    pub width: f64,
    #[validate(range(min = 0.0))]
    pub height: f64,
    pub label: String,
    pub confidence: Option<f64>,
    pub selected: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MissionGroundTruth {
    pub id: i64,
    pub mission_id: i64,
    pub item_id: String,
    pub labels: Vec<LabelAnnotation>,
    pub bounding_boxes: Vec<BoundingBox>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct MissionSubmission {
    pub item_id: String,
    pub labels: Vec<LabelAnnotation>,
    pub bounding_boxes: Vec<BoundingBox>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateMissionSubmissionRequest {
    pub mission_id: i64,
    pub annotator_id: i64,
    #[validate(length(min = 1))]
    pub submissions: Vec<MissionSubmission>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateGroundTruthRequest {
    pub mission_id: i64,
    pub raw_data: serde_json::Value,
}

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate; 