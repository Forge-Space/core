use axum::{extract::Path, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::errors::AppError;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User { pub id: Uuid, pub name: String, pub email: String }

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest { pub name: String, pub email: String }

pub async fn list_users() -> Result<Json<Vec<User>>, AppError> {
    Ok(Json(vec![]))
}

pub async fn get_user(Path(id): Path<Uuid>) -> Result<Json<User>, AppError> {
    Err(AppError::NotFound(format!("User {} not found", id)))
}

pub async fn create_user(Json(p): Json<CreateUserRequest>) -> Result<(StatusCode, Json<User>), AppError> {
    if p.name.is_empty() { return Err(AppError::Validation("name cannot be empty".into())); }
    if !p.email.contains('@') { return Err(AppError::Validation("invalid email".into())); }
    Ok((StatusCode::CREATED, Json(User { id: Uuid::new_v4(), name: p.name, email: p.email })))
}
