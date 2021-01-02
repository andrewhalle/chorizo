import { fetchAndCheckStatus } from './utils';

/*
 * - API:
 *   - POST /api/auth/login
 *     - request: { username: string, password: string }
 *     - response: { username: string, loggedIn: boolean }
 *   - GET /api/chore
 *     - params: { date: string }
 *     - response: { chores: Chore[] }
 */

// -- begin types

export interface Chore {
  id: string;
  assignee: string | null;
  title: string;
  complete: boolean;
};

// -- end types


// -- begin POST /api/auth/login

export interface PostLoginBody {
  username: string;
  password: string;
}

export interface PostLoginResponse {
  username: string;
  loggedIn: boolean;
};

async function postLogin(body: PostLoginBody): Promise<PostLoginResponse> {
  return fetchAndCheckStatus('POST', '/api/auth/login', null, body);
}

// -- end POST /api/auth/login

// -- begin GET /api/chore

export interface GetChoreParams {
  date: string;
}

export interface GetChoreResponse {
  chores: Chore[];
}

async function getChore(params: GetChoreParams): Promise<GetChoreResponse> {
  return fetchAndCheckStatus('GET', '/api/chore', params, null);
}

// -- end GET /api/chore

export default {
  postLogin,
  getChore
};
