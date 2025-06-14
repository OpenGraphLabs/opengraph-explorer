use crate::models::{MissionGroundTruth, LabelAnnotation, BoundingBox};
use crate::error::AppError;
use sqlx::PgPool;
use serde_json;

pub struct GroundTruthService;

impl GroundTruthService {
    pub async fn get_ground_truth_by_mission(
        pool: &PgPool,
        mission_id: i64,
    ) -> Result<Vec<MissionGroundTruth>, AppError> {
        let rows = sqlx::query!(
            r#"
            SELECT id, mission_id, item_id, labels, bounding_boxes, created_at, updated_at
            FROM mission_ground_truths 
            WHERE mission_id = $1
            "#,
            mission_id
        )
        .fetch_all(pool)
        .await?;

        let mut ground_truths = Vec::new();
        for row in rows {
            let labels: Vec<LabelAnnotation> = serde_json::from_value(row.labels)
                .map_err(|e| AppError::Internal(format!("Failed to parse labels: {}", e)))?;
            
            let bounding_boxes: Vec<BoundingBox> = serde_json::from_value(row.bounding_boxes)
                .map_err(|e| AppError::Internal(format!("Failed to parse bounding boxes: {}", e)))?;

            ground_truths.push(MissionGroundTruth {
                id: row.id,
                mission_id: row.mission_id,
                item_id: row.item_id,
                labels,
                bounding_boxes,
                created_at: row.created_at,
                updated_at: row.updated_at,
            });
        }

        Ok(ground_truths)
    }

    pub async fn get_ground_truth_by_item(
        pool: &PgPool,
        mission_id: i64,
        item_id: &str,
    ) -> Result<Option<MissionGroundTruth>, AppError> {
        let row = sqlx::query!(
            r#"
            SELECT id, mission_id, item_id, labels, bounding_boxes, created_at, updated_at
            FROM mission_ground_truths 
            WHERE mission_id = $1 AND item_id = $2
            "#,
            mission_id,
            item_id
        )
        .fetch_optional(pool)
        .await?;

        if let Some(row) = row {
            let labels: Vec<LabelAnnotation> = serde_json::from_value(row.labels)
                .map_err(|e| AppError::Internal(format!("Failed to parse labels: {}", e)))?;
            
            let bounding_boxes: Vec<BoundingBox> = serde_json::from_value(row.bounding_boxes)
                .map_err(|e| AppError::Internal(format!("Failed to parse bounding boxes: {}", e)))?;

            Ok(Some(MissionGroundTruth {
                id: row.id,
                mission_id: row.mission_id,
                item_id: row.item_id,
                labels,
                bounding_boxes,
                created_at: row.created_at,
                updated_at: row.updated_at,
            }))
        } else {
            Ok(None)
        }
    }

    /// 정답 데이터 저장
    pub async fn create_ground_truth(
        pool: &PgPool,
        mission_id: i64,
        item_id: &str,
        labels: Vec<LabelAnnotation>,
        bounding_boxes: Vec<BoundingBox>,
    ) -> Result<MissionGroundTruth, AppError> {
        let labels_json = serde_json::to_value(&labels)
            .map_err(|e| AppError::Internal(format!("Failed to serialize labels: {}", e)))?;
        
        let bboxes_json = serde_json::to_value(&bounding_boxes)
            .map_err(|e| AppError::Internal(format!("Failed to serialize bounding boxes: {}", e)))?;

        let row = sqlx::query!(
            r#"
            INSERT INTO mission_ground_truths (mission_id, item_id, labels, bounding_boxes)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (mission_id, item_id)
            DO UPDATE SET 
                labels = EXCLUDED.labels,
                bounding_boxes = EXCLUDED.bounding_boxes,
                updated_at = NOW()
            RETURNING id, mission_id, item_id, labels, bounding_boxes, created_at, updated_at
            "#,
            mission_id,
            item_id,
            labels_json,
            bboxes_json
        )
        .fetch_one(pool)
        .await?;

        let labels: Vec<LabelAnnotation> = serde_json::from_value(row.labels)
            .map_err(|e| AppError::Internal(format!("Failed to parse labels: {}", e)))?;
        
        let bounding_boxes: Vec<BoundingBox> = serde_json::from_value(row.bounding_boxes)
            .map_err(|e| AppError::Internal(format!("Failed to parse bounding boxes: {}", e)))?;

        Ok(MissionGroundTruth {
            id: row.id,
            mission_id: row.mission_id,
            item_id: row.item_id,
            labels,
            bounding_boxes,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }

    /// 원본 정답 데이터를 우리 시스템 형태로 변환
    pub fn convert_raw_annotation_data(
        raw_data: &serde_json::Value,
    ) -> Result<Vec<(String, Vec<LabelAnnotation>, Vec<BoundingBox>)>, AppError> {
        let mut result = Vec::new();
        
        let items = raw_data.as_array()
            .ok_or_else(|| AppError::BadRequest("Expected array of annotation data".to_string()))?;

        for item in items {
            let img_name = item["img_name"].as_str()
                .ok_or_else(|| AppError::BadRequest("Missing img_name".to_string()))?;
            
            let annotation = &item["annotation"];
            let mut bounding_boxes = Vec::new();
            let mut bbox_counter = 1;
            
            // annotation 객체의 각 라벨에 대해 바운딩박스들을 변환
            if let Some(obj) = annotation.as_object() {
                for (label, bbox_array) in obj {
                    if let Some(bboxes) = bbox_array.as_array() {
                        for bbox_coords in bboxes {
                            if let Some(coords) = bbox_coords.as_array() {
                                if coords.len() == 4 {
                                    let x = coords[0].as_f64().unwrap_or(0.0);
                                    let y = coords[1].as_f64().unwrap_or(0.0);
                                    let width = coords[2].as_f64().unwrap_or(0.0);
                                    let height = coords[3].as_f64().unwrap_or(0.0);
                                    
                                    bounding_boxes.push(BoundingBox {
                                        id: bbox_counter.to_string(),
                                        x,
                                        y,
                                        width,
                                        height,
                                        label: label.clone(),
                                        confidence: None,
                                        selected: None,
                                    });
                                    bbox_counter += 1;
                                }
                            }
                        }
                    }
                }
            }
            
            // 이 경우 라벨 어노테이션은 없고 바운딩박스만 있음
            let labels = Vec::new();
            
            result.push((img_name.to_string(), labels, bounding_boxes));
        }
        
        Ok(result)
    }

    /// 미션의 모든 정답 데이터를 한번에 저장
    pub async fn bulk_create_ground_truth(
        pool: &PgPool,
        mission_id: i64,
        raw_data: &serde_json::Value,
    ) -> Result<Vec<MissionGroundTruth>, AppError> {
        let converted_data = Self::convert_raw_annotation_data(raw_data)?;
        let mut results = Vec::new();
        
        for (item_id, labels, bounding_boxes) in converted_data {
            let ground_truth = Self::create_ground_truth(
                pool,
                mission_id,
                &item_id,
                labels,
                bounding_boxes,
            ).await?;
            results.push(ground_truth);
        }
        
        Ok(results)
    }
} 