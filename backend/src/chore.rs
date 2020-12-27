use tide::Request;
use super::State;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct ChoresRequest {
    date: String,
}

async fn get_chores(req: Request<State>) -> tide::Result {
    let query: ChoresRequest = req.query()?;
    dbg!(query);
    Ok(r#"{"chores":[]}"#.into())
}

pub(super) fn chore_api(state: State) -> tide::Server<State> {
    let mut api = tide::with_state(state);
    api.at("/").get(get_chores);

    api
}
