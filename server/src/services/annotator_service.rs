use crate::models::{Annotator, CreateAnnotatorRequest};
use crate::error::AppError;
use sqlx::PgPool;
use validator::Validate;

pub struct AnnotatorService;

impl AnnotatorService {
    pub async fn create_annotator(
        pool: &PgPool,
        req: CreateAnnotatorRequest,
    ) -> Result<Annotator, AppError> {
        req.validate()?;

        let annotator = sqlx::query_as!(
            Annotator,
            r#"
            INSERT INTO annotators (sui_address)
            VALUES ($1)
            RETURNING id, sui_address, created_at, updated_at
            "#,
            req.sui_address
        )
        .fetch_one(pool)
        .await?;

        Ok(annotator)
    }

    pub async fn get_annotator_by_id(
        pool: &PgPool,
        id: i64,
    ) -> Result<Option<Annotator>, AppError> {
        let annotator = sqlx::query_as!(
            Annotator,
            "SELECT id, sui_address, created_at, updated_at FROM annotators WHERE id = $1",
            id
        )
        .fetch_optional(pool)
        .await?;

        Ok(annotator)
    }

    pub async fn get_annotator_by_sui_address(
        pool: &PgPool,
        sui_address: &str,
    ) -> Result<Option<Annotator>, AppError> {
        let annotator = sqlx::query_as!(
            Annotator,
            "SELECT id, sui_address, created_at, updated_at FROM annotators WHERE sui_address = $1",
            sui_address
        )
        .fetch_optional(pool)
        .await?;

        Ok(annotator)
    }

    pub async fn list_annotators(
        pool: &PgPool,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Annotator>, AppError> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        let annotators = sqlx::query_as!(
            Annotator,
            "SELECT id, sui_address, created_at, updated_at FROM annotators ORDER BY created_at DESC LIMIT $1 OFFSET $2",
            limit,
            offset
        )
        .fetch_all(pool)
        .await?;

        Ok(annotators)
    }
} 