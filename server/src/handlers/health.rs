use axum::{
    response::Json,
    http::StatusCode,
};
use serde_json::{Value, json};

/// 서버 상태 확인 엔드포인트
pub async fn health_check() -> Result<Json<Value>, StatusCode> {
    Ok(Json(json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "service": "opengraph-server"
    })))
} 