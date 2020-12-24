use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use tide::Request;

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
    app.at("/login/:username").get(login);
    app.at("/hello").get(hello);
    app.listen("127.0.0.1:8080").await?;
    Ok(())
}

async fn login(mut req: Request<State>) -> tide::Result {
    let username = req.param("username")?.to_owned();
    let session = req.session_mut();

    session.insert("logged_in", true)?;
    session.insert("username", username)?;

    Ok("{}".into())
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
