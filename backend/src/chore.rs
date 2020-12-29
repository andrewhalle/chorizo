use tide::Request;
use super::State;
use serde::{Serialize, Deserialize};
use sqlx::SqlitePool;
use time::{ Duration, Date};
use tide::prelude::*;
use super::auth::auth_middleware;

#[derive(Deserialize, Debug)]
struct ChoresRequest {
    date: String,
}

#[derive(Debug, sqlx::FromRow)]
struct RecurringChore {
    id: i64,
    title: String,
    repeat_every_days: i64,
    next_instance_date: String,
}

#[derive(Serialize, Debug, sqlx::FromRow)]
struct Chore {
    id: i64,
    title: String,
    assignee: Option<i64>,
    instance_of: i64,
    date: String,
    complete: bool,
}

/// For all recurring chores in the database with a next_instance_date on or before
/// `date`, add a chore instance and move the next_instance_date according to
/// recurring_chore.repeat_every_days
async fn add_next_chore_instances_before_date(pool: &SqlitePool, date: &str) -> anyhow::Result<()> {
    let mut conn = pool.acquire().await?;
    sqlx::query!("BEGIN").execute(&mut conn).await?;
    let recurring_chores = sqlx::query_as!(RecurringChore,
        "SELECT * FROM recurring_chore WHERE next_instance_date <= ?",
        date
    )
        .fetch_all(&mut conn).await?;

    for recurring_chore in recurring_chores {
        let mut next_instance_date = Date::parse(
            &recurring_chore.next_instance_date,
            "%F",
        )?;
        let requested = Date::parse(date, "%F")?;

        while next_instance_date <= requested {
            let formatted = next_instance_date.format("%Y-%m-%d");

            sqlx::query!(
                "INSERT INTO
                   chore (title, assignee, instance_of, date)
                 VALUES (?, ?, ?, ?)",
                 recurring_chore.title,
                 None::<i64>,
                 recurring_chore.id,
                 formatted,
            ).execute(&mut conn).await?;

            next_instance_date += Duration::days(recurring_chore.repeat_every_days);
            let formatted = next_instance_date.format("%Y-%m-%d");
            sqlx::query!(
                "UPDATE recurring_chore SET next_instance_date = ? WHERE id = ?",
                formatted,
                recurring_chore.id,
            ).execute(&mut conn).await?;
        }
    }

    sqlx::query!("COMMIT").execute(&mut conn).await?;

    Ok(())
}

async fn get_chores(req: Request<State>) -> tide::Result {
    let query: ChoresRequest = req.query()?;

    add_next_chore_instances_before_date(&req.state().db, &query.date).await?;

    let mut conn = (&req.state().db).acquire().await?;
    let chores = sqlx::query_as!(Chore,
        "SELECT * FROM chore WHERE date = ?",
        query.date,
    ).fetch_all(&mut conn).await?;

    Ok(json!({ "chores": chores }).into())
}

pub(super) fn chore_api(state: State) -> tide::Server<State> {
    let mut api = tide::with_state(state);
    api.with(auth_middleware);
    api.at("/").get(get_chores);

    api
}
