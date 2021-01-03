import React, { FunctionComponent } from 'react';
import Chore from './Chore';
import { Row, Col, Button } from 'reactstrap';
import './Home.css';

import { useAppDispatch } from './store';
import { useSelector } from 'react-redux';
import { getUsername, authInitialize } from './slices/auth';
import {
  getDate,
  getChoresByAssignee,
  choreRefresh,
  choreNextDay,
  chorePrevDay
} from './slices/chore';

export const Home: FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const byAssignee = useSelector(getChoresByAssignee);
  const username = useSelector(getUsername);
  const date = useSelector(getDate);

  React.useEffect(() => {
    dispatch(authInitialize());
    dispatch(choreRefresh());
  }, [dispatch]);

  return (
    <div>
      <p>Hello, {username || 'unknown user'}!</p>
      <Button onClick={() => dispatch(chorePrevDay())}>Prev day</Button>
      <Button onClick={() => dispatch(choreNextDay())}>Next day</Button>
      <p>Chores for {date}</p>
      <Row>
        { Object.entries(byAssignee).map(([assignee, chores]) => (
          <Col className="chore-column w-25">
            {
              chores.map((c) =>
                <Chore className="mt-2" chore={c} />
              )
            }
          </Col>
        )) }
      </Row>
    </div>
  );
};
