use tide::Request;
use super::State;
use serde::Deserialize;
use sqlx::SqlitePool;
use time::{ Duration, Date};

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

#[derive(Debug, sqlx::FromRow)]
struct Chore {
    id: i64,
    title: String,
    assignee: Option<i64>,
    instance_of: Option<i64>,
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
        let next_instance_date = Date::parse(&recurring_chore.next_instance_date, "%F")?
            + Duration::days(recurring_chore.repeat_every_days);
        let next_instance_date = next_instance_date.format("%Y-%m-%d");

        sqlx::query!(
            "INSERT INTO
               chore (title, assignee, instance_of, date)
             VALUES (?, ?, ?, ?)",
             recurring_chore.title,
             None::<i64>,
             recurring_chore.id,
             recurring_chore.next_instance_date,
        ).execute(&mut conn).await?;
        sqlx::query!(
            "UPDATE recurring_chore SET next_instance_date = ? WHERE id = ?",
            next_instance_date,
            recurring_chore.id,
        ).execute(&mut conn).await?;
    }

    sqlx::query!("COMMIT").execute(&mut conn).await?;

    Ok(())
}

async fn get_chores(req: Request<State>) -> tide::Result {
    let query: ChoresRequest = req.query()?;

    add_next_chore_instances_before_date(&req.state().db, &query.date).await?;

    Ok(r#"{"chores":[]}"#.into())
}

pub(super) fn chore_api(state: State) -> tide::Server<State> {
    let mut api = tide::with_state(state);
    api.at("/").get(get_chores);

    api
}
