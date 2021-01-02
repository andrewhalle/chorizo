import React, { FunctionComponent } from 'react';
import api, { Chore as IChore } from './api';
import Chore from './Chore';
import { Row, Col } from 'reactstrap';
import './Home.css';

import moment from 'moment';
import _ from 'lodash';

export const Home: FunctionComponent = () => {
  const [chores, setChores] = React.useState([] as IChore[]);

  React.useEffect(() => {
    (async () => {
      const { chores } = await api.getChore({ date: moment().format('YYYY-MM-DD') });

      setChores(chores);
    })();
  }, []);

  const byAssignee = _.groupBy(chores, (c) => c.assignee);

  return (
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
  );
};
