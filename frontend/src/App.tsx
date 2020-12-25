import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Login } from './Login';
import { Home } from './Home';
import { ErrorPage } from './ErrorPage';

import { Provider } from 'react-redux';
import { createStore } from 'redux';

// -- redux
type LoginAction = { type: 'auth/login', payload: { username: string } }
type Actions = LoginAction;
type LoginState = { loggedIn: boolean, username: string };
const initialState: LoginState = { loggedIn: false, username: '' };
const rootReducer = (state = initialState, action: Actions) => {
  switch (action.type) {
    case 'auth/login':
      return { loggedIn: true, username: action.payload.username };
    default:
      return state;
  }
};
const store = createStore(rootReducer);
// --

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Router>
          <Switch>
            <Route path="/login">
              <Login />
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
