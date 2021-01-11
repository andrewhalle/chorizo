use super::State;
use anyhow::anyhow;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use sqlx::Acquire;
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

impl User {
    fn check_password(&self, password: &str) -> bool {
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        hasher.update(&self.password_salt[..]);

        let result = hasher.finalize();

        &result[..] == &self.password_hash[..]
    }
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
    })
    .into())
}

async fn login(mut req: Request<State>) -> tide::Result {
    let body: LoginRequest = req.body_json().await?;

    let mut conn = (&req.state().db).acquire().await?;
    let mut transaction = conn.begin().await?;

    // XXX allow test password if compiled with demo feature flag
    /*
    if body.password != "test" {
        return Err(tide::Error::new(500, anyhow!("Login failed")));
    }
    */
    let user = sqlx::query_as!(User, "SELECT * FROM user WHERE username = ?", body.username)
        .fetch_optional(&mut transaction)
        .await?;

    let login_failed = Err(tide::Error::new(500, anyhow!("Login failed")));
    match user {
        None => {
            return login_failed;
        }
        Some(u) => {
            if !u.check_password(&body.password) {
                return login_failed;
            }
        }
    }

    transaction.commit().await?;

    let session = req.session_mut();
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
