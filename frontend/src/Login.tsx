import React, { FunctionComponent, FormEvent } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { sendFormToBackend } from './utils';

export const Login: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const payload = await sendFormToBackend('/api/login', e.target as HTMLFormElement);
      dispatch({ type: 'auth/login', payload });
      history.push('/');
    } catch (e) {
      history.push('/error');
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <FormGroup>
        <Label for="username">Username</Label>
        <Input type="text" name="username" id="username" />
      </FormGroup>
      <FormGroup>
        <Label for="password">Password</Label>
        <Input type="password" name="password" id="password" />
      </FormGroup>
      <Button>Submit</Button>
    </Form>
  );
};
