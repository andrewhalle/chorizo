use super::auth::auth_middleware;
use super::State;
use serde::Serialize;
use tide::prelude::*;
use tide::Request;

/* XXX uncomment when needed
struct User {
    id: i64,
    username: String,
    password_hash: Vec<u8>,
    password_salt: Vec<u8>,
}
*/

#[derive(Serialize, sqlx::FromRow)]
struct SafeUser {
    id: i64,
    username: String,
}

async fn get_users(req: Request<State>) -> tide::Result {
    let mut conn = (&req.state().db).acquire().await?;

    let users = sqlx::query_as!(SafeUser, "SELECT id, username FROM user")
        .fetch_all(&mut conn)
        .await?;

    Ok(json!({ "users": users }).into())
}

pub(super) fn user_api(state: State) -> tide::Server<State> {
    let mut api = tide::with_state(state);
    api.with(auth_middleware);
    api.at("/").get(get_users);

    api
}
