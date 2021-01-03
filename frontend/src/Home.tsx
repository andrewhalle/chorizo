import React, { FunctionComponent } from 'react';
import api, { Chore as IChore } from './api';
import Chore from './Chore';
import { Row, Col } from 'reactstrap';
import './Home.css';

import moment from 'moment';
import _ from 'lodash';

import { getUsername } from './utils';
import { useSelector, useDispatch } from 'react-redux';
import { authInitialize } from './reducers/auth';

export const Home: FunctionComponent = () => {
  const dispatch = useDispatch();

  const [chores, setChores] = React.useState([] as IChore[]);
  const username = useSelector(getUsername);

  React.useEffect(() => {
    dispatch(authInitialize());
    (async () => {
      const { chores } = await api.getChore({ date: moment().format('YYYY-MM-DD') });

      setChores(chores);
    })();
  }, []);

  const byAssignee = _.groupBy(chores, (c) => c.assignee);

  return (
    <div>
      <p>Hello, {username || 'unknown user'}!</p>
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
