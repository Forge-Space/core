use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self { success: true, data: Some(data), message: None }
    }

    pub fn error(message: impl Into<String>) -> ApiResponse<()> {
        ApiResponse { success: false, data: None, message: Some(message.into()) }
    }
}
