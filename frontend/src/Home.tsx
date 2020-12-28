import React, { FunctionComponent } from 'react';
import { Chore, getFromBackend } from './utils';
import moment from 'moment';

export const Home: FunctionComponent = () => {
  const [chores, setChores] = React.useState([] as Chore[]);

  React.useEffect(() => {
    (async () => {
      const { chores } = await getFromBackend(
        '/api/chore',
        {
          params: { date: moment().format('YYYY-MM-DD') }
        }
      );

      setChores(chores);
    })();
  }, []);

  return (
    <div>
      <ul>
        { chores.map((c) => (
          <li>
            <p>Title: {c.title}</p>
            <p>Assignee: {c.assignee}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
