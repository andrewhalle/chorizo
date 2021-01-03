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

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
        <DragDropContext onDragEnd={() => {}}>
        { Object.entries(byAssignee).map(([assignee, chores]) => (
            <div>
              <h3>{assignee}</h3>
              <hr />
              <Droppable droppableId={assignee.toString()}>
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {
                    chores.map((c, index) => (
                      <Draggable
                          key={c.id.toString()}
                          draggableId={c.id.toString()}
                          index={index}>
                        {(provided) => (
                          <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}>
                            {c.title}
                          </li>
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
