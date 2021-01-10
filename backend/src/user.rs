use super::auth::auth_middleware;
use super::State;
use serde::Serialize;
use sqlx::Acquire;
use tide::prelude::*;
use tide::Request;

#[derive(Serialize, sqlx::FromRow)]
struct SafeUser {
    id: i64,
    username: String,
}

async fn get_users(req: Request<State>) -> tide::Result {
    let mut conn = (&req.state().db).acquire().await?;
    let mut transaction = conn.begin().await?;

    let users = sqlx::query_as!(SafeUser, "SELECT id, username FROM user")
        .fetch_all(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(json!({ "users": users }).into())
}

pub(super) fn user_api(state: State) -> tide::Server<State> {
    let mut api = tide::with_state(state);
    api.with(auth_middleware);
    api.at("/").get(get_users);

    api
}
