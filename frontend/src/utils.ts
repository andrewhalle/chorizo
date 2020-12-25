export const getUsername = (store: any) => store.username;


export async function sendFormToBackend(
  path: string,
  form: HTMLFormElement
): Promise<any> {
  const data = new FormData(form);
  const body: any = {};
  for (const [key, value] of data.entries()) {
    body[key] = value;
  }

  let res = await fetch(path, {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (res.status === 200) {
    return res.json();
  } else {
    throw new Error('server did not respond with success.');
  }
}
