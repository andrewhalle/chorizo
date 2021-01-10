import React, { FormEvent, FunctionComponent } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { useAppDispatch } from './store';
import { recurringChoreCreate } from './slices/chore';
import { PostRecurringChoreBody } from './api';
import { objectFromForm } from './utils';
import { useHistory } from 'react-router';

export const AddRecurringChore: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const data: any = objectFromForm(e.target as HTMLFormElement);
    data.repeat_every_days = Number(data.repeat_every_days);
    const recurringChore: PostRecurringChoreBody = data;

    const params = { recurringChore, after: () => history.push('/') };
    dispatch(recurringChoreCreate(params));
  };

  return (
    <div>
      <h3>Add recurring chore</h3>
      <Form onSubmit={onSubmit}>
        <FormGroup>
          <Label for="title">Title</Label>
          <Input type="text" name="title" id="title" />
        </FormGroup>
        <FormGroup>
          <Label for="next_instance_date">Next instance date</Label>
          <Input type="text" name="next_instance_date" id="next_instance_date" />
        </FormGroup>
        <FormGroup>
          <Label for="repeat_every_days">Repeat every days</Label>
          <Input type="text" name="repeat_every_days" id="repeat_every_days" />
        </FormGroup>
        <Button>Create</Button>
      </Form>
    </div>
  );
};
