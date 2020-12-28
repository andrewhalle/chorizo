export const getUsername = (store: any) => store.username;

export type Chore = {
  id: string;
  assignee: string | null;
  title: string;
};

type Api = {
  'POST /api/auth/login': {
    request: { params?: never, username: string, password: string },
    response: { loggedIn: boolean, username: string }
  }
  'GET /api/chore': {
    request: { params: { date: string } },
    response: { chores: Chore[] }
  }
};

type Get<T> = T extends string ?
  `GET ${T}` extends keyof Api ? `GET ${T}` : never
  : never;
type Post<T> = T extends string ?
  `POST ${T}` extends keyof Api ? `POST ${T}` : never
  : never;

export async function getFromBackend<P extends string>(
  path: P,
  payload: Api[Get<P>]['request'],
): Promise<Api[Get<P>]['response']> {
  let url: string = path;
  if (payload.params) {
    url += '?' + (new URLSearchParams(payload.params)).toString();
  }

  let res = await fetch(url, { method: 'GET' });

  if (res.status === 200) {
    return (await res.json()) as Api[Get<P>]['response'];
  } else {
    // XXX
    throw new Error('server did not response with success');
  }
}

export async function postToBackend<P extends string>(
  path: P,
  payload: Api[Post<P>]['request'],
): Promise<Api[Post<P>]['response']> {
  let url: string = path;
  if (payload.params) {
    url += '?' + (new URLSearchParams(payload.params)).toString();
  }

  let res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res.status === 200) {
    return (await res.json()) as Api[Post<P>]['response'];
  } else {
    // XXX
    throw new Error('server did not response with success');
  }
}

export async function postFormToBackend<P extends string>(
  path: P,
  form: HTMLFormElement
): Promise<Api[Post<P>]['response']> {
  const data = new FormData(form);
  const body: any = {};
  for (const [key, value] of data.entries()) {
    body[key] = value;
  }

  return postToBackend(path, body);
}
