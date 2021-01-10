import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router';
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
  choreReorderAndAssign,
  choreNextDay,
  chorePrevDay
} from './slices/chore';
import { userRefresh, getUsers } from './slices/user';

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';

export const Home: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const byAssignee = useSelector(getChoresByAssignee);
  const users = useSelector(getUsers);
  const username = useSelector(getUsername);
  const date = useSelector(getDate);

  React.useEffect(() => {
    dispatch(authInitialize());
    dispatch(choreRefresh());
    dispatch(userRefresh());
  }, [dispatch]);

  const handleDragEnd = (dropResult: DropResult) => {
    dispatch(choreReorderAndAssign(dropResult));
  };

  return (
    <div>
      <p>Hello, {username || 'unknown user'}!</p>
      <Button onClick={() => dispatch(chorePrevDay())}>Prev day</Button>
      <Button onClick={() => dispatch(choreNextDay())}>Next day</Button>
      <Button onClick={() => history.push('/add-chore')}>Add chore</Button>
      <Button onClick={() => history.push('/add-recurring-chore')}>Add recurring chore</Button>
      <p>Chores for {date}</p>
      <Row>
        <DragDropContext onDragEnd={handleDragEnd}>
        { users.concat([{ username: 'Unassigned', id: -1 }]).map((user) => (
            <div className="chore-column">
              <h3>{user.username}</h3>
              <hr />
              <Droppable droppableId={user.id.toString()}>
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {
                    (byAssignee[user.id] || []).map((c, index) => (
                      <Draggable
                          key={c.id.toString()}
                          draggableId={c.id.toString()}
                          index={index}>
                        {(provided) => (
                          <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}>
                            <Chore chore={c} />
                          </div>
                        )}
                      </Draggable>
                    ))
                  }
                  </ul>
                )}
              </Droppable>
            </div>
        )) }
        </DragDropContext>
      </Row>
    </div>
  );
};
