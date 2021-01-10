use super::auth::auth_middleware;
use super::State;
use serde::{Deserialize, Serialize};
use sqlx::{Acquire, Sqlite, Transaction};
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

#[derive(Deserialize)]
struct CreateRecurringChore {
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
    sort_order: i64,
}

#[derive(Deserialize)]
struct CreateChore {
    title: String,
    assignee: Option<i64>,
    date: String,
}

#[derive(Deserialize)]
struct UpdateChore {
    assignee: Option<Option<i64>>,
    complete: Option<bool>,
    sort_order: Option<i64>,
}

impl Chore {
    fn apply_update(&mut self, update: UpdateChore) {
        if update.assignee.is_some() {
            self.assignee = update.assignee.unwrap();
        }
        if update.complete.is_some() {
            self.complete = update.complete.unwrap();
        }
        if update.sort_order.is_some() {
            self.sort_order = update.sort_order.unwrap();
        }
    }
}

/// For all recurring chores in the database with a next_instance_date on or before
/// `date`, add a chore instance and move the next_instance_date according to
/// recurring_chore.repeat_every_days
async fn add_next_chore_instances_before_date(
    transaction: &mut Transaction<'_, Sqlite>,
    date: &str,
) -> anyhow::Result<()> {
    let recurring_chores = sqlx::query_as!(
        RecurringChore,
        "SELECT * FROM recurring_chore WHERE next_instance_date <= ?",
        date
    )
    .fetch_all(&mut *transaction)
    .await?;

    for recurring_chore in recurring_chores {
        let mut next_instance_date = Date::parse(&recurring_chore.next_instance_date, "%F")?;
        let requested = Date::parse(date, "%F")?;

        while next_instance_date <= requested {
            let formatted = next_instance_date.format("%Y-%m-%d");

            // XXX don't duplicate
            let next_sort_order = sqlx::query!(
                "
                SELECT
                  sort_order
                FROM
                  chore
                WHERE
                  date = ?
                ORDER BY
                  sort_order DESC
                LIMIT 1
                ",
                formatted
            )
            .fetch_optional(&mut *transaction)
            .await?
            .map(|x| x.sort_order + 1)
            .unwrap_or(0);
            sqlx::query!(
                "INSERT INTO
                   chore (title, assignee, instance_of, date, sort_order)
                 VALUES (?, ?, ?, ?, ?)",
                recurring_chore.title,
                None::<i64>,
                recurring_chore.id,
                formatted,
                next_sort_order,
            )
            .execute(&mut *transaction)
            .await?;

            next_instance_date += Duration::days(recurring_chore.repeat_every_days);
            let formatted = next_instance_date.format("%Y-%m-%d");
            sqlx::query!(
                "UPDATE recurring_chore SET next_instance_date = ? WHERE id = ?",
                formatted,
                recurring_chore.id,
            )
            .execute(&mut *transaction)
            .await?;
        }
    }

    Ok(())
}

async fn get_chores(req: Request<State>) -> tide::Result {
    // XXX restrict to 7 days in future unless feature flag
    let query: ChoresRequest = req.query()?;

    let mut conn = (&req.state().db).acquire().await?;
    let mut transaction = conn.begin().await?;

    add_next_chore_instances_before_date(&mut transaction, &query.date).await?;

    let chores = sqlx::query_as!(Chore, "SELECT * FROM chore WHERE date = ?", query.date,)
        .fetch_all(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(json!({ "chores": chores }).into())
}

async fn create_chore(mut req: Request<State>) -> tide::Result {
    let chore_creation: CreateChore = req.body_json().await?;
    let next_instance_date = Date::parse(&chore_creation.date, "%F")?;
    let formatted = next_instance_date.format("%Y-%m-%d");

    let mut conn = (&req.state().db).acquire().await?;
    let mut transaction = conn.begin().await?;

    // XXX don't duplicate
    let next_sort_order = sqlx::query!(
        "
        SELECT
          sort_order
        FROM
          chore
        WHERE
          date = ?
        ORDER BY
          sort_order DESC
        LIMIT 1
        ",
        formatted
    )
    .fetch_optional(&mut transaction)
    .await?
    .map(|x| x.sort_order + 1)
    .unwrap_or(0);
    sqlx::query!(
        "INSERT INTO chore (title, assignee, date, sort_order) VALUES (?, ?, ?, ?)",
        chore_creation.title,
        chore_creation.assignee,
        chore_creation.date,
        next_sort_order,
    )
    .execute(&mut transaction)
    .await?;
    let chore = sqlx::query_as!(Chore, "SELECT * from chore where id = last_insert_rowid()",)
        .fetch_one(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(json!({ "new_chore": chore }).into())
}

async fn edit_chore(mut req: Request<State>) -> tide::Result {
    let id: i64 = req.param("id")?.parse()?;
    let update: UpdateChore = req.body_json().await?;

    let mut conn = (&req.state().db).acquire().await?;
    let mut transaction = conn.begin().await?;

    let mut chore = sqlx::query_as!(Chore, "SELECT * FROM chore where id = ?", id)
        .fetch_one(&mut transaction)
        .await?;
    chore.apply_update(update);
    sqlx::query!(
        "
        UPDATE
            chore
        SET
            title = ?, assignee = ?, instance_of = ?, date = ?,
            complete = ?, sort_order = ?
        WHERE
            id = ?
        ",
        chore.title,
        chore.assignee,
        chore.instance_of,
        chore.date,
        chore.complete,
        chore.sort_order,
        chore.id,
    )
    .execute(&mut transaction)
    .await?;

    transaction.commit().await?;

    Ok(json!({ "chore": chore }).into())
}

async fn create_recurring_chore(mut req: Request<State>) -> tide::Result {
    let to_create: CreateRecurringChore = req.body_json().await?;

    let mut conn = (&req.state().db).acquire().await?;
    let mut transaction = conn.begin().await?;

    sqlx::query!(
        "INSERT INTO recurring_chore (title, repeat_every_days, next_instance_date) VALUES (?, ?, ?)",
        to_create.title,
        to_create.repeat_every_days,
        to_create.next_instance_date,
    ).execute(&mut transaction).await?;

    transaction.commit().await?;

    Ok("{}".into())
}

pub(super) fn chore_api(state: State) -> tide::Server<State> {
    let mut api = tide::with_state(state);
    api.with(auth_middleware);
    api.at("/").get(get_chores);
    api.at("/").post(create_chore);
    api.at("/:id").patch(edit_chore);
    api.at("/recurring").post(create_recurring_chore);

    api
}
