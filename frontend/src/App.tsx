import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Login } from './Login';
import { Home } from './Home';
import { AddChore } from './AddChore';
import { ErrorPage } from './ErrorPage';

import { Provider } from 'react-redux';
import store from './store';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Router>
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/add-chore">
              <AddChore />
            </Route>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/error">
              <ErrorPage />
            </Route>
          </Switch>
        </Router>
      </div>
    </Provider>
  );
}

export default App;
