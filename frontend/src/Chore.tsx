import React, { FunctionComponent } from 'react';
import { Button } from 'reactstrap';
import { Chore as IChore } from './api';
import { useAppDispatch } from './store';
import cn from 'classnames';
import { choreSetComplete } from './slices/chore';
import './Chore.css';

interface ChoreProps {
  chore: IChore;
  className?: string;
}

const Chore: FunctionComponent<ChoreProps> = (props: ChoreProps) => {
  const dispatch = useAppDispatch();

  const changeCompletionStatus = () => dispatch(
    choreSetComplete({
      id: props.chore.id,
      body: { complete: !props.chore.complete }
    })
  );
  const buttonText = props.chore.complete ? 'Uncomplete' : 'Complete';

  return (
    <div className={cn(
      'chore',
      props.className,
      { complete: props.chore.complete },
      { incomplete: !props.chore.complete }
    )}>
      <h3>{props.chore.title}</h3>
      <p>Assignee: {props.chore.assignee || 'Unassigned'}</p>
      <Button onClick={changeCompletionStatus}>{buttonText}</Button>
    </div>
  );
};

export default Chore;
