use axum::{
    extract::{Path, Query, State},
    response::Json,
};
use serde::Deserialize;

use crate::{
    models::{MissionScore, CreateMissionScoreRequest},
    services::MissionScoreService,
    error::AppError,
};
use sqlx::PgPool;

#[derive(Deserialize)]
pub struct ListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

pub async fn create_or_update_score(
    State(pool): State<PgPool>,
    Json(req): Json<CreateMissionScoreRequest>,
) -> Result<Json<MissionScore>, AppError> {
    let score = MissionScoreService::create_or_update_score(&pool, req).await?;
    Ok(Json(score))
}

pub async fn get_score(
    State(pool): State<PgPool>,
    Path(id): Path<i64>,
) -> Result<Json<MissionScore>, AppError> {
    let score = MissionScoreService::get_score_by_id(&pool, id)
        .await?
        .ok_or_else(|| AppError::NotFound("Score not found".to_string()))?;
    
    Ok(Json(score))
}

pub async fn get_scores_by_mission(
    State(pool): State<PgPool>,
    Path(mission_id): Path<i64>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<MissionScore>>, AppError> {
    let scores = MissionScoreService::get_scores_by_mission(&pool, mission_id, query.limit, query.offset).await?;
    Ok(Json(scores))
}

pub async fn get_scores_by_annotator(
    State(pool): State<PgPool>,
    Path(annotator_id): Path<i64>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<MissionScore>>, AppError> {
    let scores = MissionScoreService::get_scores_by_annotator(&pool, annotator_id, query.limit, query.offset).await?;
    Ok(Json(scores))
}

pub async fn get_top_scores(
    State(pool): State<PgPool>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<MissionScore>>, AppError> {
    let scores = MissionScoreService::get_top_scores(&pool, query.limit).await?;
    Ok(Json(scores))
}

pub async fn get_annotator_average_score(
    State(pool): State<PgPool>,
    Path(annotator_id): Path<i64>,
) -> Result<Json<Option<f64>>, AppError> {
    let average = MissionScoreService::get_annotator_average_score(&pool, annotator_id).await?;
    Ok(Json(average))
} 