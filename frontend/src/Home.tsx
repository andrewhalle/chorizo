import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getUsername } from './utils';

export const Home: FunctionComponent = () => {
  const username = useSelector(getUsername);

  return <p>Hello, {username || 'unknown user'}!</p>;
};
