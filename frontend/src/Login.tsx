import React, {
  ChangeEvent,
  Dispatch,
  FormEvent,
  FunctionComponent,
  SetStateAction
} from 'react';

function changer(
  f: Dispatch<SetStateAction<string>>
): (e: ChangeEvent<HTMLInputElement>) => void {
  return (e) => f(e.target.value);
}

export const Login: FunctionComponent = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { username, password };

    console.log(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <label>Username</label>
      <input type="text" value={username} onChange={changer(setUsername)} />
      <label>Password</label>
      <input type="password" value={password} onChange={changer(setPassword)} />
      <input type="submit" value="Login" />
    </form>
  );
};
