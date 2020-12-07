use futures::TryStreamExt;
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
    app.at("/hello").get(test);
    app.listen("127.0.0.1:8080").await?;
    Ok(())
}

async fn test(req: Request<State>) -> tide::Result {
    let users = sqlx::query_as::<_, User>("select * from user")
        .fetch(&req.state().db)
        .try_collect::<Vec<User>>()
        .await
        .expect("could not fetch users"); // turn this into an error page

    Ok(format!("Users: {:?}", users).into())
}
