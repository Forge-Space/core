pub mod response;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>, pub total: u64, pub page: u32, pub per_page: u32,
}
