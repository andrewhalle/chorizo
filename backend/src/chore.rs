use super::auth::auth_middleware;
use super::State;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use tide::prelude::*;
use tide::Request;
use time::{Date, Duration};

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
    instance_of: Option<i64>,
    date: String,
    complete: bool,
}

#[derive(Deserialize)]
struct CreateChore {
    title: String,
    assignee: Option<i64>,
    date: String,
}

#[derive(Deserialize)]
struct UpdateChore {
    assignee: Option<i64>,
    complete: Option<bool>,
}

impl Chore {
    fn apply_update(&mut self, update: UpdateChore) {
        if update.assignee.is_some() {
            self.assignee = update.assignee;
        }
        if update.complete.is_some() {
            self.complete = update.complete.unwrap();
        }
    }
}

/// For all recurring chores in the database with a next_instance_date on or before
/// `date`, add a chore instance and move the next_instance_date according to
/// recurring_chore.repeat_every_days
async fn add_next_chore_instances_before_date(pool: &SqlitePool, date: &str) -> anyhow::Result<()> {
    let mut conn = pool.acquire().await?;
    sqlx::query!("BEGIN").execute(&mut conn).await?;
    let recurring_chores = sqlx::query_as!(
        RecurringChore,
        "SELECT * FROM recurring_chore WHERE next_instance_date <= ?",
        date
    )
    .fetch_all(&mut conn)
    .await?;

    for recurring_chore in recurring_chores {
        let mut next_instance_date = Date::parse(&recurring_chore.next_instance_date, "%F")?;
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
            )
            .execute(&mut conn)
            .await?;

            next_instance_date += Duration::days(recurring_chore.repeat_every_days);
            let formatted = next_instance_date.format("%Y-%m-%d");
            sqlx::query!(
                "UPDATE recurring_chore SET next_instance_date = ? WHERE id = ?",
                formatted,
                recurring_chore.id,
            )
            .execute(&mut conn)
            .await?;
        }
    }

    sqlx::query!("COMMIT").execute(&mut conn).await?;

    Ok(())
}

async fn get_chores(req: Request<State>) -> tide::Result {
    let query: ChoresRequest = req.query()?;

    add_next_chore_instances_before_date(&req.state().db, &query.date).await?;

    let mut conn = (&req.state().db).acquire().await?;
    let chores = sqlx::query_as!(Chore, "SELECT * FROM chore WHERE date = ?", query.date,)
        .fetch_all(&mut conn)
        .await?;

    Ok(json!({ "chores": chores }).into())
}

async fn create_chore(mut req: Request<State>) -> tide::Result {
    let chore_creation: CreateChore = req.body_json().await?;

    let mut conn = (&req.state().db).acquire().await?;

    sqlx::query!("BEGIN").execute(&mut conn).await?;
    sqlx::query!(
        "INSERT INTO chore (title, assignee, date) VALUES (?, ?, ?)",
        chore_creation.title,
        chore_creation.assignee,
        chore_creation.date,
    )
    .execute(&mut conn)
    .await?;
    let chore = sqlx::query_as!(Chore, "SELECT * from chore where id = last_insert_rowid()",)
        .fetch_one(&mut conn)
        .await?;
    sqlx::query!("COMMIT").execute(&mut conn).await?;

    Ok(json!({ "new_chore": chore }).into())
}

async fn edit_chore(mut req: Request<State>) -> tide::Result {
    let id: i64 = req.param("id")?.parse()?;
    let update: UpdateChore = req.body_json().await?;

    let mut conn = (&req.state().db).acquire().await?;

    sqlx::query!("BEGIN").execute(&mut conn).await?;
    let mut chore = sqlx::query_as!(
        Chore,
        "SELECT * FROM chore where id = ?",
        id
    ).fetch_one(&mut conn).await?;
    chore.apply_update(update);
    sqlx::query!(
        "
        UPDATE
            chore
        SET
            title = ?, assignee = ?, instance_of = ?, date = ?, complete = ?
        WHERE
            id = ?
        ",
        chore.title,
        chore.assignee,
        chore.instance_of,
        chore.date,
        chore.complete,
        chore.id,
    ).execute(&mut conn).await?;
    sqlx::query!("COMMIT").execute(&mut conn).await?;

    Ok(json!({ "chore": chore }).into())
}

pub(super) fn chore_api(state: State) -> tide::Server<State> {
    let mut api = tide::with_state(state);
    api.with(auth_middleware);
    api.at("/").get(get_chores);
    api.at("/").post(create_chore);
    api.at("/:id").patch(edit_chore);

    api
}
