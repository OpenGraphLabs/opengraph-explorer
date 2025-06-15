use axum::{
    routing::{get, post, put},
    Router,
};
use tower_http::{
    trace::TraceLayer,
    cors::CorsLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use std::net::SocketAddr;

mod handlers;
mod models;
mod services;
mod config;
mod error;

use handlers::{
    health::health_check,
    annotator_handler::{create_annotator, get_annotator, get_annotator_by_sui_address, list_annotators},
    mission_handler::{create_mission, get_mission, list_missions, update_mission_status},
    mission_score_handler::{
        get_score, get_scores_by_mission,
        get_scores_by_annotator, get_top_scores, get_annotator_average_score, submit_and_score
    },
    ground_truth_handler::{bulk_create_ground_truth, get_ground_truth_by_mission, get_ground_truth_by_item},
};
use config::{Config, create_db_pool};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 로깅 초기화
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
    
    dotenv::dotenv().ok();
    let config = Config::from_env();
    
    // database connection
    let pool = create_db_pool(&config).await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    // API routes with state
    let api_routes = Router::new()
        // Annotator routes
        .route("/annotators", post(create_annotator))
        .route("/annotators", get(list_annotators))
        .route("/annotators/:id", get(get_annotator))
        .route("/annotators/sui/:sui_address", get(get_annotator_by_sui_address))
        
        // Mission routes
        .route("/missions", post(create_mission))
        .route("/missions", get(list_missions))
        .route("/missions/:id", get(get_mission))
        .route("/missions/:id/status", put(update_mission_status))
        
        // Mission score routes
        .route("/scores", post(submit_and_score))
        .route("/scores/:id", get(get_score))
        .route("/scores/top", get(get_top_scores))
        .route("/missions/:mission_id/scores", get(get_scores_by_mission))
        .route("/annotators/:annotator_id/scores", get(get_scores_by_annotator))
        .route("/annotators/:annotator_id/average", get(get_annotator_average_score))
        
        // Ground truth routes
        .route("/ground-truth/bulk", post(bulk_create_ground_truth))
        .route("/ground-truth/missions/:mission_id", get(get_ground_truth_by_mission))
        .route("/ground-truth/missions/:mission_id/items/:item_id", get(get_ground_truth_by_item))
        
        .with_state(pool);
    
    // Main router with API prefix and middlewares
    let router = Router::new()
        .route("/health", get(health_check))
        .nest("/server/v1", api_routes)
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive());
    
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("🚀 OpenGraph Annotation Server running on http://{}", addr);
    tracing::info!("📊 Health check: http://{}/health", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, router).await?;

    Ok(())
}
