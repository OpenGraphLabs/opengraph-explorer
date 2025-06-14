use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate;
use std::str::FromStr;
use std::fmt::Display;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MissionType {
    #[serde(rename = "label_annotation")]
    LabelAnnotation,
    #[serde(rename = "bbox_annotation")]
    BboxAnnotation,
}

impl FromStr for MissionType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "label_annotation" => Ok(MissionType::LabelAnnotation),
            "bbox_annotation" => Ok(MissionType::BboxAnnotation),
            _ => Err(format!("Invalid mission type: {}", s)),
        }
    }
}

impl Display for MissionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            MissionType::LabelAnnotation => "label_annotation",
            MissionType::BboxAnnotation => "bbox_annotation",
        };
        write!(f, "{}", s)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MissionStatus {
    #[serde(rename = "active")]
    Active,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "inactive")]
    Inactive,
}

impl FromStr for MissionStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "active" => Ok(MissionStatus::Active),
            "completed" => Ok(MissionStatus::Completed),
            "inactive" => Ok(MissionStatus::Inactive),
            _ => Err(format!("Invalid mission status: {}", s)),
        }
    }
}

impl Display for MissionStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            MissionStatus::Active => "active",
            MissionStatus::Completed => "completed",
            MissionStatus::Inactive => "inactive",
        };
        write!(f, "{}", s)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateMissionRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    #[validate(length(min = 1, max = 500))]
    pub description: String,
    pub mission_type: MissionType,
    pub total_items: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mission {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub mission_type: MissionType,
    pub total_items: i32,
    pub status: MissionStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
