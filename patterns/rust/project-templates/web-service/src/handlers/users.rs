use axum::{
    extract::Path,
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::errors::AppError;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub name: String,
    pub email: String,
}

pub async fn list_users() -> Result<Json<Vec<User>>, AppError> {
    // Replace with actual database query
    let users: Vec<User> = vec![];
    Ok(Json(users))
}

pub async fn get_user(Path(id): Path<Uuid>) -> Result<Json<User>, AppError> {
    // Replace with actual database lookup
    Err(AppError::NotFound(format!("User {} not found", id)))
}

pub async fn create_user(
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), AppError> {
    if payload.name.is_empty() {
        return Err(AppError::Validation("name cannot be empty".to_string()));
    }
    if !payload.email.contains('@') {
        return Err(AppError::Validation("invalid email address".to_string()));
    }

    let user = User {
        id: Uuid::new_v4(),
        name: payload.name,
        email: payload.email,
    };

    Ok((StatusCode::CREATED, Json(user)))
}
