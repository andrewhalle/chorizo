import React, { FunctionComponent } from 'react';
import { Card, CardBody, CardTitle, CardSubtitle } from 'reactstrap';

type ChoreProps = {
  title: string;
  assignee: string;
  className: string;
};

const Chore: FunctionComponent<ChoreProps> = (props: ChoreProps) => {
  return (
    <Card className={props.className}>
      <CardBody>
        <CardTitle>{props.title}</CardTitle>
        <CardSubtitle>Assignee: {props.assignee}</CardSubtitle>
      </CardBody>
    </Card>
  );
};

export default Chore;
