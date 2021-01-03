export const getUsername = (store: any) => store.auth.username;

export function objectFromForm<R>(form: HTMLFormElement): R {
  const data = new FormData(form);
  const body: any = {};
  for (const [key, value] of data.entries()) {
    body[key] = value;
  }
  return body;
}

export async function fetchAndCheckStatus<R>(
  method: string,
  url: string,
  params: object | null,
  body: object | null
): Promise<R> {
  if (params) {
    url += '?' + (new URLSearchParams(params as Record<string, string>)).toString();
  }

  const options: any = { method };
  if (body != null) {
    options['body'] = JSON.stringify(body);
  }
  let res = await fetch(url, options);

  if (res.status === 200) {
    return res.json() as Promise<R>;
  } else {
    // XXX
    throw new Error('server did not response with success');
  }
}
