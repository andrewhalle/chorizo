import type { PostLoginBody } from './api';
import React, { FunctionComponent, FormEvent } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from './store';
import { authLogin } from './slices/auth';
import { objectFromForm } from './utils';
import './Login.css';

export const Login: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body: PostLoginBody = objectFromForm(e.target as HTMLFormElement);
    dispatch(authLogin({ body, after: () => history.push('/') }));
  };

  return (
    <div className="login-form-box">
      <div className="login-form">
        <h3>Sign in</h3>
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
      </div>
    </div>
  );
};
