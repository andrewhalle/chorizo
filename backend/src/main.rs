use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use tide::{Request, Response, StatusCode};
use serde::{Serialize, Deserialize};
use tide::prelude::*;
use tide::utils::After;
use anyhow::anyhow;

#[derive(Clone)]
struct State {
    db: SqlitePool,
}

#[derive(Debug, sqlx::FromRow)]
struct User {
    id: i64,
    username: String,
}

#[async_std::main]
async fn main() -> tide::Result<()> {
    // env
    dotenv::dotenv().expect("could not load .env file");

    // db
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&std::env::var("DATABASE_URL")?)
        .await?;

    // logging
    tide::log::start();

    // app
    // XXX favicon
    // XXX frontend
    let mut app = tide::with_state(State { db: pool });
    app.with(tide::sessions::SessionMiddleware::new(
        tide::sessions::MemoryStore::new(),
        std::env::var("TIDE_SECRET").expect("Please provide a tide secret.").as_bytes(),
    ));
    app.with(After(|mut res: Response| async {
        if let Some(err) = res.downcast_error::<anyhow::Error>() {
            let msg = "Errored".to_owned();
            res.set_status(StatusCode::InternalServerError);
            res.set_body(msg);
        }
        Ok(res)
    }));
    app.at("/api/login").post(login);
    app.at("/api/chores").get(get_chores);
    app.at("/api/hello").get(hello);
    app.listen("127.0.0.1:8080").await?;
    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Deserialize, Debug)]
struct ChoresRequest {
    date: String,
}

async fn get_chores(mut req: Request<State>) -> tide::Result {
    let query: ChoresRequest = req.query()?;
    dbg!(query);
    Ok(r#"{"chores":[]}"#.into())
}

async fn hello(req: Request<State>) -> tide::Result {
    let logged_in: bool = req.session().get("logged_in").unwrap_or(false);

    if logged_in {
        let username: String = req.session().get("username").unwrap();
        Ok(format!("Hello, {}!", username).into())
    } else {
        Ok("Hello, unknown user!".into())
    }
}
