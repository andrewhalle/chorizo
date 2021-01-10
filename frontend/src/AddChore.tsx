import React, { FormEvent, FunctionComponent } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { useAppDispatch } from './store';
import { choreCreate } from './slices/chore';
import { PostChoreBody } from './api';
import { objectFromForm } from './utils';
import { useHistory } from 'react-router';

export const AddChore: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const data: any = objectFromForm(e.target as HTMLFormElement);
    data.assignee = null;
    data.complete = false;
    data.sort_order = 1;
    const chore: PostChoreBody = data;

    const params = { chore, after: () => history.push('/') };
    dispatch(choreCreate(params));
  };

  return (
    <div>
      <h3>Add chore</h3>
      <Form onSubmit={onSubmit}>
        <FormGroup>
          <Label for="title">Title</Label>
          <Input type="text" name="title" id="title" />
        </FormGroup>
        <FormGroup>
          <Label for="date">Title</Label>
          <Input type="text" name="date" id="date" />
        </FormGroup>
        <Button>Create</Button>
      </Form>
    </div>
  );
};
