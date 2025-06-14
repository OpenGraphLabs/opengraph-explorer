use axum::{
    extract::{Path, Query, State},
    response::Json,
};
use serde::Deserialize;

use crate::{
    models::{Mission, CreateMissionRequest, MissionStatus},
    services::MissionService,
    error::AppError,
};
use sqlx::PgPool;

#[derive(Deserialize)]
pub struct ListQuery {
    pub status: Option<MissionStatus>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Deserialize)]
pub struct UpdateStatusRequest {
    pub status: MissionStatus,
}

pub async fn create_mission(
    State(pool): State<PgPool>,
    Json(req): Json<CreateMissionRequest>,
) -> Result<Json<Mission>, AppError> {
    let mission = MissionService::create_mission(&pool, req).await?;
    Ok(Json(mission))
}

pub async fn get_mission(
    State(pool): State<PgPool>,
    Path(id): Path<i64>,
) -> Result<Json<Mission>, AppError> {
    let mission = MissionService::get_mission_by_id(&pool, id)
        .await?
        .ok_or_else(|| AppError::NotFound("Mission not found".to_string()))?;
    
    Ok(Json(mission))
}

pub async fn list_missions(
    State(pool): State<PgPool>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<Mission>>, AppError> {
    let missions = MissionService::list_missions(&pool, query.status, query.limit, query.offset).await?;
    Ok(Json(missions))
}

pub async fn update_mission_status(
    State(pool): State<PgPool>,
    Path(id): Path<i64>,
    Json(req): Json<UpdateStatusRequest>,
) -> Result<Json<Mission>, AppError> {
    let mission = MissionService::update_mission_status(&pool, id, req.status)
        .await?
        .ok_or_else(|| AppError::NotFound("Mission not found".to_string()))?;
    
    Ok(Json(mission))
} 