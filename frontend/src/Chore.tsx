import React, { FunctionComponent } from 'react';
import { Button, Card, CardBody, CardTitle, CardSubtitle } from 'reactstrap';
import api, { Chore as IChore } from './api';

interface ChoreProps {
  chore: IChore;
  className: string;
}

const assign = async (choreId: number, assignee: number) => {
  const res = await api.patchChore(choreId, { assignee });
};

const Chore: FunctionComponent<ChoreProps> = (props: ChoreProps) => {
  return (
    <Card className={props.className}>
      <CardBody>
        <CardTitle>{props.chore.title}</CardTitle>
        <CardSubtitle>Assignee: {props.chore.assignee || 'Unassigned'}</CardSubtitle>
        <Button onClick={() => assign(props.chore.id, 1)}>Assign</Button>
      </CardBody>
    </Card>
  );
};

export default Chore;
