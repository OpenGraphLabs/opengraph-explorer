use crate::models::{MissionScore, CreateMissionSubmissionRequest, MissionSubmission, LabelAnnotation, BoundingBox, Mission};
use crate::error::AppError;
use crate::services::{GroundTruthService, MissionService};
use sqlx::PgPool;
use validator::Validate;
use bigdecimal::{BigDecimal, FromPrimitive};
use num_traits::ToPrimitive;

pub struct MissionScoreService;

impl MissionScoreService {


    pub async fn get_score_by_id(
        pool: &PgPool,
        id: i64,
    ) -> Result<Option<MissionScore>, AppError> {
        let score = sqlx::query_as!(
            MissionScore,
            "SELECT id, mission_id, annotator_id, score, created_at, updated_at FROM mission_scores WHERE id = $1",
            id
        )
        .fetch_optional(pool)
        .await?;

        Ok(score)
    }

    pub async fn get_scores_by_mission(
        pool: &PgPool,
        mission_id: i64,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<MissionScore>, AppError> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        let scores = sqlx::query_as!(
            MissionScore,
            "SELECT id, mission_id, annotator_id, score, created_at, updated_at FROM mission_scores WHERE mission_id = $1 ORDER BY score DESC LIMIT $2 OFFSET $3",
            mission_id,
            limit,
            offset
        )
        .fetch_all(pool)
        .await?;

        Ok(scores)
    }

    pub async fn get_scores_by_annotator(
        pool: &PgPool,
        annotator_id: i64,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<MissionScore>, AppError> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        let scores = sqlx::query_as!(
            MissionScore,
            "SELECT id, mission_id, annotator_id, score, created_at, updated_at FROM mission_scores WHERE annotator_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
            annotator_id,
            limit,
            offset
        )
        .fetch_all(pool)
        .await?;

        Ok(scores)
    }

    pub async fn get_top_scores(
        pool: &PgPool,
        limit: Option<i64>,
    ) -> Result<Vec<MissionScore>, AppError> {
        let limit = limit.unwrap_or(10);

        let scores = sqlx::query_as!(
            MissionScore,
            "SELECT id, mission_id, annotator_id, score, created_at, updated_at FROM mission_scores ORDER BY score DESC LIMIT $1",
            limit
        )
        .fetch_all(pool)
        .await?;

        Ok(scores)
    }

    pub async fn get_annotator_average_score(
        pool: &PgPool,
        annotator_id: i64,
    ) -> Result<Option<f64>, AppError> {
        let result = sqlx::query!(
            "SELECT AVG(score) as average_score FROM mission_scores WHERE annotator_id = $1",
            annotator_id
        )
        .fetch_optional(pool)
        .await?;

        let average = result
            .and_then(|r| r.average_score)
            .and_then(|avg| avg.to_f64());

        Ok(average)
    }

    /// 제출된 답안을 채점하여 점수를 저장
    pub async fn submit_and_score(
        pool: &PgPool,
        req: CreateMissionSubmissionRequest,
    ) -> Result<MissionScore, AppError> {
        req.validate()?;

        // 미션 정보 조회
        let mission = MissionService::get_mission_by_id(pool, req.mission_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Mission not found".to_string()))?;

        // 제출된 항목 수가 total_items와 일치하는지 확인
        if req.submissions.len() as i32 != mission.total_items {
            return Err(AppError::BadRequest(format!(
                "Expected {} submissions, got {}",
                mission.total_items,
                req.submissions.len()
            )));
        }

        // 정답 데이터 조회
        let ground_truths = GroundTruthService::get_ground_truth_by_mission(pool, req.mission_id).await?;
        
        if ground_truths.len() as i32 != mission.total_items {
            return Err(AppError::Internal(
                "Ground truth data inconsistent with mission total_items".to_string()
            ));
        }

        // 채점 수행
        let score = Self::calculate_score(&req.submissions, &ground_truths)?;

        // 점수 저장
        let score_decimal = BigDecimal::from_f64(score)
            .ok_or_else(|| AppError::Internal("Failed to convert score to decimal".to_string()))?;

        let mission_score = sqlx::query_as!(
            MissionScore,
            r#"
            INSERT INTO mission_scores (mission_id, annotator_id, score)
            VALUES ($1, $2, $3)
            ON CONFLICT (mission_id, annotator_id) 
            DO UPDATE SET score = EXCLUDED.score, updated_at = NOW()
            RETURNING id, mission_id, annotator_id, score, created_at, updated_at
            "#,
            req.mission_id,
            req.annotator_id,
            score_decimal
        )
        .fetch_one(pool)
        .await?;

        Ok(mission_score)
    }

    /// 채점 로직 구현
    fn calculate_score(
        submissions: &[MissionSubmission],
        ground_truths: &[crate::models::MissionGroundTruth],
    ) -> Result<f64, AppError> {
        let mut total_score = 0.0;
        let total_items = submissions.len() as f64;

        for submission in submissions {
            let ground_truth = ground_truths
                .iter()
                .find(|gt| gt.item_id == submission.item_id)
                .ok_or_else(|| AppError::BadRequest(format!("Ground truth not found for item {}", submission.item_id)))?;

            let item_score = Self::calculate_item_score(submission, ground_truth)?;
            total_score += item_score;
        }

        Ok((total_score / total_items) * 100.0) // 0-100 스케일로 정규화
    }

    /// 개별 항목 채점
    fn calculate_item_score(
        submission: &MissionSubmission,
        ground_truth: &crate::models::MissionGroundTruth,
    ) -> Result<f64, AppError> {
        let label_score = Self::calculate_label_score(&submission.labels, &ground_truth.labels);
        let bbox_score = Self::calculate_bbox_score(&submission.bounding_boxes, &ground_truth.bounding_boxes);
        
        // 라벨과 바운딩박스 점수를 가중평균 (라벨 40%, 바운딩박스 60%)
        Ok(label_score * 0.4 + bbox_score * 0.6)
    }

    /// 라벨 정확도 계산
    fn calculate_label_score(submission_labels: &[LabelAnnotation], ground_truth_labels: &[LabelAnnotation]) -> f64 {
        if ground_truth_labels.is_empty() {
            return if submission_labels.is_empty() { 1.0 } else { 0.0 };
        }

        let mut correct_count = 0;
        for gt_label in ground_truth_labels {
            if submission_labels.iter().any(|sub_label| sub_label.label == gt_label.label) {
                correct_count += 1;
            }
        }

        correct_count as f64 / ground_truth_labels.len() as f64
    }

    /// 바운딩박스 정확도 계산 (IoU 기반)
    fn calculate_bbox_score(submission_bboxes: &[BoundingBox], ground_truth_bboxes: &[BoundingBox]) -> f64 {
        if ground_truth_bboxes.is_empty() {
            return if submission_bboxes.is_empty() { 1.0 } else { 0.0 };
        }

        let mut total_iou = 0.0;
        let mut matched_count = 0;

        for gt_bbox in ground_truth_bboxes {
            let mut best_iou = 0.0;
            
            for sub_bbox in submission_bboxes {
                if sub_bbox.label == gt_bbox.label {
                    let iou = Self::calculate_iou(sub_bbox, gt_bbox);
                    if iou > best_iou {
                        best_iou = iou;
                    }
                }
            }
            
            if best_iou > 0.5 { // IoU 임계값 0.5
                total_iou += best_iou;
                matched_count += 1;
            }
        }

        if matched_count == 0 {
            0.0
        } else {
            total_iou / ground_truth_bboxes.len() as f64
        }
    }

    /// IoU (Intersection over Union) 계산
    fn calculate_iou(bbox1: &BoundingBox, bbox2: &BoundingBox) -> f64 {
        let x1_min = bbox1.x;
        let y1_min = bbox1.y;
        let x1_max = bbox1.x + bbox1.width;
        let y1_max = bbox1.y + bbox1.height;

        let x2_min = bbox2.x;
        let y2_min = bbox2.y;
        let x2_max = bbox2.x + bbox2.width;
        let y2_max = bbox2.y + bbox2.height;

        let intersection_x_min = x1_min.max(x2_min);
        let intersection_y_min = y1_min.max(y2_min);
        let intersection_x_max = x1_max.min(x2_max);
        let intersection_y_max = y1_max.min(y2_max);

        if intersection_x_max <= intersection_x_min || intersection_y_max <= intersection_y_min {
            return 0.0;
        }

        let intersection_area = (intersection_x_max - intersection_x_min) * (intersection_y_max - intersection_y_min);
        let bbox1_area = bbox1.width * bbox1.height;
        let bbox2_area = bbox2.width * bbox2.height;
        let union_area = bbox1_area + bbox2_area - intersection_area;

        if union_area <= 0.0 {
            0.0
        } else {
            intersection_area / union_area
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{LabelAnnotation, BoundingBox, MissionSubmission, MissionGroundTruth};
    use chrono::Utc;

    #[test]
    fn test_calculate_iou() {
        let bbox1 = BoundingBox {
            id: "1".to_string(),
            x: 10.0,
            y: 10.0,
            width: 50.0,
            height: 50.0,
            label: "person".to_string(),
            confidence: None,
            selected: None,
        };

        let bbox2 = BoundingBox {
            id: "2".to_string(),
            x: 30.0,
            y: 30.0,
            width: 50.0,
            height: 50.0,
            label: "person".to_string(),
            confidence: None,
            selected: None,
        };

        let iou = MissionScoreService::calculate_iou(&bbox1, &bbox2);
        assert!(iou > 0.0 && iou < 1.0);
    }

    #[test]
    fn test_calculate_label_score() {
        let submission_labels = vec![
            LabelAnnotation {
                id: "1".to_string(),
                label: "person".to_string(),
                confidence: None,
            },
            LabelAnnotation {
                id: "2".to_string(),
                label: "car".to_string(),
                confidence: None,
            },
        ];

        let ground_truth_labels = vec![
            LabelAnnotation {
                id: "1".to_string(),
                label: "person".to_string(),
                confidence: None,
            },
        ];

        let score = MissionScoreService::calculate_label_score(&submission_labels, &ground_truth_labels);
        assert_eq!(score, 1.0); // 모든 정답 라벨을 찾았으므로 100%
    }
} 