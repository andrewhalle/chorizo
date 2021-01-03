import { fetchAndCheckStatus } from './utils';

/*
 * - API:
 *   - GET /api/auth
 *   - POST /api/auth/login
 *     - request: { username: string, password: string }
 *     - response: { username: string, loggedIn: boolean }
 *   - GET /api/chore
 *     - params: { date: string }
 *     - response: { chores: Chore[] }
 *   - POST /api/chore
 *     - request: Omit<Chore, 'id'>
 *     - response: { new_chore: Chore }
 *   - PATCH /api/chore/:id
 *     - request: Partial<Omit<Chore, 'id' | 'title' | 'date'>>
 *     - response: { chore: Chore }
 */

// -- begin types

export interface Chore {
  id: number;
  assignee: number | null;
  title: string;
  complete: boolean;
  date: number;
};

// -- end types


// -- begin GET /api/auth
export interface GetAuthResponse {
  loggedIn: boolean;
  username: string | null;
}

async function getAuth(): Promise<GetAuthResponse> {
  return fetchAndCheckStatus('GET', '/api/auth', null, null);
}
// -- end GET /api/auth

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

// -- begin POST /api/chore

export type PostChoreBody = Omit<Chore, 'id'>;

export interface PostChoreResponse {
  new_chore: Chore;
}

async function postChore(body: PostChoreBody): Promise<PostChoreResponse> {
  return fetchAndCheckStatus('POST', '/api/chore', null, body);
}

// -- end POST /api/chore

// -- begin PATCH /api/chore

export type PatchChoreBody = Partial<Omit<Chore, 'id' | 'title' | 'date'>>;

export interface PatchChoreResponse {
  chore: Chore;
}

async function patchChore(id: number, body: PatchChoreBody): Promise<PatchChoreResponse> {
  return fetchAndCheckStatus('PATCH', `/api/chore/${id}`, null, body);
}

// -- end POST /api/chore

const api = {
  getAuth,
  postLogin,
  getChore,
  postChore,
  patchChore
};
export default api;
