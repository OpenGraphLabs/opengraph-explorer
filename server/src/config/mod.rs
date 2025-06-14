// 애플리케이션 설정 관리
// 예: 환경 변수, 데이터베이스 설정 등 

use sqlx::PgPool;
use std::env;

pub struct Config {
    pub database_url: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgresql://localhost/opengraph".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("PORT must be a number"),
        }
    }
}

pub async fn create_db_pool(config: &Config) -> Result<PgPool, sqlx::Error> {
    PgPool::connect(&config.database_url).await
} 