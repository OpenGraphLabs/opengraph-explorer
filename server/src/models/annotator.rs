use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateAnnotatorRequest {
    #[validate(length(min = 1, max = 200))]
    pub sui_address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Annotator {
    pub id: i64,
    pub sui_address: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
} 