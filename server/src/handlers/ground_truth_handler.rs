use axum::{
    extract::{Path, State},
    response::Json,
};
use serde_json::{json, Value};
use sqlx::PgPool;
use validator::Validate;

use crate::models::annotation::CreateGroundTruthRequest;
use crate::services::ground_truth_service::GroundTruthService;
use crate::error::AppError;

/// 미션별 정답 데이터 일괄 등록
pub async fn bulk_create_ground_truth(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateGroundTruthRequest>,
) -> Result<Json<Value>, AppError> {
    // 요청 데이터 검증
    payload.validate()?;

    // 정답 데이터 일괄 등록
    let ground_truths = GroundTruthService::bulk_create_ground_truth(
        &pool,
        payload.mission_id,
        &payload.raw_data,
    ).await?;

    Ok(Json(json!({
        "success": true,
        "message": format!("Successfully created {} ground truth records for mission {}", 
                          ground_truths.len(), payload.mission_id),
        "count": ground_truths.len(),
        "ground_truths": ground_truths
    })))
}

/// 미션별 정답 데이터 조회
pub async fn get_ground_truth_by_mission(
    Path(mission_id): Path<i64>,
    State(pool): State<PgPool>,
) -> Result<Json<Value>, AppError> {
    let ground_truths = GroundTruthService::get_ground_truth_by_mission(&pool, mission_id).await?;

    Ok(Json(json!({
        "success": true,
        "mission_id": mission_id,
        "count": ground_truths.len(),
        "ground_truths": ground_truths
    })))
}

/// 특정 아이템의 정답 데이터 조회
pub async fn get_ground_truth_by_item(
    Path((mission_id, item_id)): Path<(i64, String)>,
    State(pool): State<PgPool>,
) -> Result<Json<Value>, AppError> {
    let ground_truth = GroundTruthService::get_ground_truth_by_item(&pool, mission_id, &item_id).await?;

    Ok(Json(json!({
        "success": true,
        "mission_id": mission_id,
        "item_id": item_id,
        "ground_truth": ground_truth
    })))
} 