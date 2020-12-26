import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getUsername, getFromBackend } from './utils';

export const Home: FunctionComponent = () => {
  const username = useSelector(getUsername);

  const onClick = async () => {
    const chores = await getFromBackend('/api/chores', { params: { date: '2020-12-25' } });

    console.log(chores);
  };

  return (
    <div>
      <p>Hello, {username || 'unknown user'}!</p>
      <button onClick={onClick}>Make request</button>
    </div>
  );
};
