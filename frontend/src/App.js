import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch, Route, Link
} from 'react-router-dom';

import Add from './components/member/Add';
import List from './components/List';
import Login from "./components/Login";
import Signup from "./components/Signup";
import Logout from "./components/Logout";
import { routes } from "./include/constants";

import api, { setAuthToken } from './api';

const App = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState({
    accessToken: '',
    isLoggedIn: false,
    username: ''
  });

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.accessToken) {
      setUser({
        accessToken: storedUser.accessToken,
        username: storedUser.username,
        isLoggedIn: true
      });
      setAuthToken(storedUser.accessToken);
    }
  }, []);

  // Fetch events once
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('api/events');
        setEvents(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };
    fetchEvents();
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser({
      accessToken: userData.accessToken,
      username: userData.username,
      isLoggedIn: true
    });
    setAuthToken(userData.accessToken);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser({
      accessToken: '',
      username: '',
      isLoggedIn: false
    });
    setAuthToken(null);
  };

  const padding = { padding: 5 };

  return (
    <div className="container">
      <Router>
        <nav>
          <span className="nav">
            {user.isLoggedIn && <Link style={padding} to={routes.event.ADD_EVENT_ROUTE}>Add Event</Link>}
            <Link style={padding} to="/list">List</Link>
          </span>
          <span className="nav">
            {user.isLoggedIn ? (
              <>
                Hello, {user.username}! <Link style={padding} to="/logout">Logout</Link>
              </>
            ) : (
              <Link style={padding} to="/login">Login</Link>
            )}
          </span>
        </nav>

        <Switch>
          <Route path={routes.event.ADD_EVENT_ROUTE}>
            <Add events={events} />
          </Route>
          <Route path="/list">
            <List events={events} />
          </Route>
          <Route exact path="/login">
            <Login onLogin={handleLogin} />
          </Route>
          <Route path="/signup">
            <Signup />
          </Route>
          <Route exact path="/logout">
            <Logout onLogout={handleLogout} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;