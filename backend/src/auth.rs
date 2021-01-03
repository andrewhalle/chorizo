use super::State;
use anyhow::anyhow;
use serde::Deserialize;
use std::future::Future;
use std::pin::Pin;
use tide::prelude::*;
use tide::{Next, Request, Response, StatusCode};

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

pub(super) fn auth_middleware<'a>(
    req: Request<State>,
    next: Next<'a, State>,
) -> Pin<Box<dyn Future<Output = tide::Result> + Send + 'a>> {
    Box::pin(async {
        if let Some(_user) = req.session().get::<String>("username") {
            Ok(next.run(req).await)
        } else {
            Ok(Response::new(StatusCode::Unauthorized))
        }
    })
}

async fn get_session(req: Request<State>) -> tide::Result {
    let session = req.session();

    Ok(json!({
        "loggedIn": session.get("logged_in").unwrap_or(false),
        "username": session.get::<String>("username")
    }).into())
}

async fn login(mut req: Request<State>) -> tide::Result {
    let body: LoginRequest = req.body_json().await?;
    let session = req.session_mut();

    if body.password != "test" {
        return Err(tide::Error::new(500, anyhow!("Login failed")));
    }

    session.insert("logged_in", true)?;
    session.insert("username", body.username.clone())?;

    Ok(json!({
        "loggedIn": true,
        "username": body.username
    })
    .into())
}

pub(super) fn auth_api(state: State) -> tide::Server<State> {
    let mut api = tide::with_state(state);

    api.at("/").get(get_session);
    api.at("/login").post(login);

    api
}
