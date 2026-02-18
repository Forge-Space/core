use axum::Json;
use serde_json::{json, Value};

pub async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339(),
    }))
}

pub async fn readiness_check() -> Json<Value> {
    Json(json!({
        "ready": true,
        "timestamp": chrono::Utc::now().to_rfc3339(),
    }))
}
