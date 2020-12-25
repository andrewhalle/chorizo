import React, { FormEvent } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import { withRouter } from 'react-router-dom';

export const Login = withRouter(({ history }) => {
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.target as any);
    const body: any = {};
    for (const [key, value] of data.entries()) {
      body[key] = value;
    }

    let res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    if (res.status === 200) {
      history.push('/');
    } else {
      // XXX show error
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
});
