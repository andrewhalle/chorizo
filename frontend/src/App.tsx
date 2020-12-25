import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Login } from './Login';
import { Hello } from './Hello';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/">
            <Hello />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
