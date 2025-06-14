use crate::models::{Mission, CreateMissionRequest, MissionStatus, MissionType};
use crate::error::AppError;
use sqlx::{PgPool, Row};
use validator::Validate;
use std::str::FromStr;

pub struct MissionService;

impl MissionService {
    pub async fn create_mission(
        pool: &PgPool,
        req: CreateMissionRequest,
    ) -> Result<Mission, AppError> {
        req.validate()?;

        let row = sqlx::query(
            r#"
            INSERT INTO missions (name, description, mission_type, total_items)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, description, mission_type, total_items, status, created_at, updated_at
            "#
        )
        .bind(&req.name)
        .bind(&req.description)
        .bind(req.mission_type.to_string())
        .bind(req.total_items)
        .fetch_one(pool)
        .await?;

        let mission = Mission {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            mission_type: MissionType::from_str(row.get("mission_type"))
                .map_err(|e| AppError::Internal(e))?,
            total_items: row.get("total_items"),
            status: MissionStatus::from_str(row.get("status"))
                .map_err(|e| AppError::Internal(e))?,
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        };

        Ok(mission)
    }

    pub async fn get_mission_by_id(
        pool: &PgPool,
        id: i64,
    ) -> Result<Option<Mission>, AppError> {
        let row = sqlx::query(
            "SELECT id, name, description, mission_type, total_items, status, created_at, updated_at FROM missions WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        if let Some(row) = row {
            let mission = Mission {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                mission_type: MissionType::from_str(row.get("mission_type"))
                    .map_err(|e| AppError::Internal(e))?,
                total_items: row.get("total_items"),
                status: MissionStatus::from_str(row.get("status"))
                    .map_err(|e| AppError::Internal(e))?,
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            Ok(Some(mission))
        } else {
            Ok(None)
        }
    }

    pub async fn list_missions(
        pool: &PgPool,
        status: Option<MissionStatus>,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Mission>, AppError> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        if let Some(status) = status {
            Self::list_missions_by_status(pool, status, limit, offset).await
        } else {
            Self::list_all_missions(pool, limit, offset).await
        }
    }

    async fn list_missions_by_status(
        pool: &PgPool,
        status: MissionStatus,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Mission>, AppError> {
        let rows = sqlx::query(
            "SELECT id, name, description, mission_type, total_items, status, created_at, updated_at FROM missions WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
        )
        .bind(status.to_string())
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        let mut missions = Vec::new();
        for row in rows {
            let mission = Mission {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                mission_type: MissionType::from_str(row.get("mission_type"))
                    .map_err(|e| AppError::Internal(e))?,
                total_items: row.get("total_items"),
                status: MissionStatus::from_str(row.get("status"))
                    .map_err(|e| AppError::Internal(e))?,
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            missions.push(mission);
        }

        Ok(missions)
    }

    async fn list_all_missions(
        pool: &PgPool,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Mission>, AppError> {
        let rows = sqlx::query(
            "SELECT id, name, description, mission_type, total_items, status, created_at, updated_at FROM missions ORDER BY created_at DESC LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        let mut missions = Vec::new();
        for row in rows {
            let mission = Mission {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                mission_type: MissionType::from_str(row.get("mission_type"))
                    .map_err(|e| AppError::Internal(e))?,
                total_items: row.get("total_items"),
                status: MissionStatus::from_str(row.get("status"))
                    .map_err(|e| AppError::Internal(e))?,
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            missions.push(mission);
        }

        Ok(missions)
    }

    pub async fn update_mission_status(
        pool: &PgPool,
        id: i64,
        status: MissionStatus,
    ) -> Result<Option<Mission>, AppError> {
        let row = sqlx::query(
            r#"
            UPDATE missions SET status = $1 WHERE id = $2
            RETURNING id, name, description, mission_type, total_items, status, created_at, updated_at
            "#
        )
        .bind(status.to_string())
        .bind(id)
        .fetch_optional(pool)
        .await?;

        if let Some(row) = row {
            let mission = Mission {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                mission_type: MissionType::from_str(row.get("mission_type"))
                    .map_err(|e| AppError::Internal(e))?,
                total_items: row.get("total_items"),
                status: MissionStatus::from_str(row.get("status"))
                    .map_err(|e| AppError::Internal(e))?,
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            Ok(Some(mission))
        } else {
            Ok(None)
        }
    }
} 