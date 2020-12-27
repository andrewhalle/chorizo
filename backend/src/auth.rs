use tide::Request;
use super::State;
use serde::{Deserialize};
use tide::prelude::*;
use anyhow::anyhow;

#[derive(Debug, sqlx::FromRow)]
struct User {
    id: i64,
    username: String,
    password_hash: Vec<u8>,
    password_salt: Vec<u8>,
}

#[derive(Debug, Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}

async fn login(mut req: Request<State>) -> tide::Result {
    let body: LoginRequest = req.body_json().await?;
    dbg!(&body);
    let session = req.session_mut();

    if body.password != "test" {
        return Err(tide::Error::new(500, anyhow!("Login failed")));
    }

    session.insert("logged_in", true)?;
    session.insert("username", body.username.clone())?;

    Ok(json!({
        "loggedIn": true,
        "username": body.username
    }).into())
}

pub(super) fn auth_api(state: State) -> tide::Server<State> {
    let mut api = tide::with_state(state);
    api.at("/login").post(login);

    api
}
