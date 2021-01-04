import React, { FunctionComponent } from 'react';
import { Card, CardBody, CardTitle, CardSubtitle } from 'reactstrap';
import { Chore as IChore } from './api';

interface ChoreProps {
  chore: IChore;
  className?: string;
}

const Chore: FunctionComponent<ChoreProps> = (props: ChoreProps) => {
  return (
    <Card className={props.className}>
      <CardBody>
        <CardTitle>{props.chore.title}</CardTitle>
        <CardSubtitle>Assignee: {props.chore.assignee || 'Unassigned'}</CardSubtitle>
      </CardBody>
    </Card>
  );
};

export default Chore;
