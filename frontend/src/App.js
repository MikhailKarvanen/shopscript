import React, {useEffect, useState} from 'react'
import {
    BrowserRouter as Router,
    Switch, Route, Link, useHistory
} from 'react-router-dom'

import Add from './components/member/Add'
import List from './components/List'
import axios from "axios";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Logout from "./components/Logout";
import {routes} from "./include/constants";


const App = () => {



    const [events, setEvents] = useState([]);

        const [user, setUser] = useState({
            accessToken: '',
            isLoggedIn: false,
            username: ''
        })

    // Get user login data
    const getUserData = () => {
        if( localStorage.getItem('user') !== null  ) {

            setUser({...user,
                accessToken:
                    JSON.parse(localStorage.getItem('user')).accessToken !== null ?
                        JSON.parse(localStorage.getItem('user')).accessToken : '',
                username:
                    JSON.parse(localStorage.getItem('user')).username !== null ?
                        JSON.parse(localStorage.getItem('user')).username : '',
                isLoggedIn:
                    JSON.parse(localStorage.getItem('user')).accessToken !== null
            })
        }
    }


   useEffect(()=> {
        axios
            .get("http://localhost:8081/api/event")
            .then((res) => setEvents(res.data))
            .catch((err) => console.log(err));
    }, [events]);

    useEffect(()=> {

        //console.log(user)
        // Tarkistetaan onko säiliössä "user"-objekti
        getUserData();

    }, [user.isLoggedIn]);

    const padding = {
        padding: 5
    }

    return (
        <div className="container">
            <Router>
                <nav>
                <span className="nav">
                    {user.isLoggedIn ? <Link style={padding} to={routes.event.ADD_EVENT_ROUTE}>add event</Link> : ''}
                    <Link style={padding} to="/list">list</Link>
                </span>
                    <span className="nav">
                        {user.isLoggedIn ? <span>Hello, {user.username}! <Link style={padding} to="/logout">logout</Link></span> : <Link style={padding} to="/login">login</Link>}
                    </span>
                </nav>


                <Switch>
                    <Route path={routes.event.ADD_EVENT_ROUTE}>
                        <Add events={events} />
                    </Route>
                    <Route path="/list">
                        <List events={events}/>
                    </Route>
                    <Route exact path="/login">
                        <Login setUserData={getUserData}  user={user} />
                    </Route>
                    <Route path="/signup">
                        <Signup />
                    </Route>
                    <Route exact path="/logout">
                        <Logout user={user}/>
                    </Route>
                </Switch>
            </Router>
        </div>
    )
}

export default App
