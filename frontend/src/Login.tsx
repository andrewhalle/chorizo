import React, { FunctionComponent, ChangeEvent, Dispatch, SetStateAction } from 'react';

function changer(
  f: Dispatch<SetStateAction<string>>
): (e: ChangeEvent<HTMLInputElement>) => void {
  return (e) => f(e.target.value);
}

export const Login: FunctionComponent = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <form>
      <label>Username</label>
      <input type="text" value={username} onChange={changer(setUsername)} />
      <label>Password</label>
      <input type="password" value={password} onChange={changer(setPassword)} />
    </form>
  );
};
