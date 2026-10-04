use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, FromRow, PgPool};
use tower_http::cors::CorsLayer;

// ---------- Models ----------
#[derive(Serialize, FromRow)]
struct Product {
    id: i32,
    name: String,
    description: Option<String>,
    price: i32,
    stock: i32,
    category: Option<String>,
    image_url: Option<String>,
}

#[derive(Deserialize)]
struct NewProduct {
    name: String,
    description: Option<String>,
    price: i32,
    stock: i32,
    category: Option<String>,
    image_url: Option<String>,
}

#[derive(Deserialize)]
struct RegisterReq {
    email: String,
    password: String,
    name: Option<String>,
}

#[derive(Deserialize)]
struct LoginReq {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct AuthRes {
    user_id: i32,
    name: Option<String>,
}

#[derive(Deserialize, Serialize)]
struct CartItem {
    product_id: i32,
    name: String,
    price: i32,
    quantity: i32,
}

#[derive(Deserialize)]
struct OrderReq {
    user_id: i32,
    items: Vec<CartItem>,
    total: i32,
}

// ---------- Handlers ----------
async fn list_products(State(pool): State<PgPool>) -> Result<Json<Vec<Product>>, StatusCode> {
    let rows = sqlx::query_as::<_, Product>("SELECT * FROM products ORDER BY id DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(rows))
}

async fn get_product(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> Result<Json<Product>, StatusCode> {
    sqlx::query_as::<_, Product>("SELECT * FROM products WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map(Json)
        .map_err(|_| StatusCode::NOT_FOUND)
}

async fn create_product(
    State(pool): State<PgPool>,
    Json(p): Json<NewProduct>,
) -> Result<Json<Product>, StatusCode> {
    sqlx::query_as::<_, Product>(
        "INSERT INTO products (name, description, price, stock, category, image_url)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    )
    .bind(p.name)
    .bind(p.description)
    .bind(p.price)
    .bind(p.stock)
    .bind(p.category)
    .bind(p.image_url)
    .fetch_one(&pool)
    .await
    .map(Json)
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn delete_product(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM products WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(StatusCode::NO_CONTENT)
}

async fn register(
    State(pool): State<PgPool>,
    Json(r): Json<RegisterReq>,
) -> Result<Json<AuthRes>, StatusCode> {
    let row: (i32, Option<String>) = sqlx::query_as(
        "INSERT INTO users (email, password, name) VALUES ($1,$2,$3)
         RETURNING id, name",
    )
    .bind(r.email)
    .bind(r.password) // ⚠️ در پروژه واقعی hash کن
    .bind(r.name)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::CONFLICT)?;
    Ok(Json(AuthRes { user_id: row.0, name: row.1 }))
}

async fn login(
    State(pool): State<PgPool>,
    Json(r): Json<LoginReq>,
) -> Result<Json<AuthRes>, StatusCode> {
    let row: Option<(i32, Option<String>)> =
        sqlx::query_as("SELECT id, name FROM users WHERE email=$1 AND password=$2")
            .bind(r.email)
            .bind(r.password)
            .fetch_optional(&pool)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match row {
        Some((id, name)) => Ok(Json(AuthRes { user_id: id, name })),
        None => Err(StatusCode::UNAUTHORIZED),
    }
}

async fn create_order(
    State(pool): State<PgPool>,
    Json(o): Json<OrderReq>,
) -> Result<StatusCode, StatusCode> {
    let items = serde_json::to_value(&o.items).unwrap();
    sqlx::query("INSERT INTO orders (user_id, items, total) VALUES ($1,$2,$3)")
        .bind(o.user_id)
        .bind(items)
        .bind(o.total)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(StatusCode::CREATED)
}

async fn health() -> &'static str {
    "OK"
}

// ---------- Main ----------
#[tokio::main]
async fn main() {
    let db_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost/silversport".into());

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("DB connection failed");

    let app = Router::new()
        .route("/health", get(health))
        .route("/products", get(list_products).post(create_product))
        .route("/products/:id", get(get_product).delete(delete_product))
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/orders", post(create_order))
        .layer(CorsLayer::permissive())
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("🚀 http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
  }
