use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use tide::{Response, StatusCode};
use tide::utils::After;

mod auth;
mod chore;

use auth::auth_api;
use chore::chore_api;

#[derive(Clone)]
struct State {
    db: SqlitePool,
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
    let auth_state = app.state().clone();
    app.at("/api/auth").nest(auth_api(auth_state));

    let chore_state = app.state().clone();
    app.at("/api/chore").nest(chore_api(chore_state));

    if cfg!(feature = "serve-frontend") {
        let dir = std::env::var("FRONTEND_DIR").expect("Please provide a frontend dir.");
        app.at("/").serve_dir(dir)?;
    }

    app.listen("127.0.0.1:8080").await?;
    Ok(())
}
