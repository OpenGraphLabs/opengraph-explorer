use axum::{
    extract::{Path, Query, State},
    response::Json,
};
use serde::Deserialize;

use crate::{
    models::{Annotator, CreateAnnotatorRequest},
    services::AnnotatorService,
    error::AppError,
};
use sqlx::PgPool;

#[derive(Deserialize)]
pub struct ListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

pub async fn create_annotator(
    State(pool): State<PgPool>,
    Json(req): Json<CreateAnnotatorRequest>,
) -> Result<Json<Annotator>, AppError> {
    let annotator = AnnotatorService::create_annotator(&pool, req).await?;
    Ok(Json(annotator))
}

pub async fn get_annotator(
    State(pool): State<PgPool>,
    Path(id): Path<i64>,
) -> Result<Json<Annotator>, AppError> {
    let annotator = AnnotatorService::get_annotator_by_id(&pool, id)
        .await?
        .ok_or_else(|| AppError::NotFound("Annotator not found".to_string()))?;
    
    Ok(Json(annotator))
}

pub async fn get_annotator_by_sui_address(
    State(pool): State<PgPool>,
    Path(sui_address): Path<String>,
) -> Result<Json<Annotator>, AppError> {
    let annotator = AnnotatorService::get_annotator_by_sui_address(&pool, &sui_address)
        .await?
        .ok_or_else(|| AppError::NotFound("Annotator not found".to_string()))?;
    
    Ok(Json(annotator))
}

pub async fn list_annotators(
    State(pool): State<PgPool>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<Annotator>>, AppError> {
    let annotators = AnnotatorService::list_annotators(&pool, query.limit, query.offset).await?;
    Ok(Json(annotators))
} 