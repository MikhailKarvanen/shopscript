import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, {useEffect, useState} from "react";
import {Link, useHistory} from "react-router-dom";
import axios from "axios";
import {routes} from "../include/constants";


const Login = (props) => {



    let user = props.user

    let history = useHistory();
    // --- Login form hooks & handlers -----------------------------------
    const [formFieldValues, setFormFieldValues] = useState({
        email: '',
        password: ''
    })
    const handleChange = (event) =>{
        //console.log(event.target.name, ": ", event.target.value)
        setFormFieldValues({...formFieldValues, [event.target.name]: event.target.value});
    }
    // const getUserData = () =>{
    //     if( localStorage.getItem('user') !== null  ) {
    //
    //         setUser({...user,
    //             accessToken:
    //                 JSON.parse(localStorage.getItem('user')).accessToken !== null ?
    //                     JSON.parse(localStorage.getItem('user')).accessToken : null,
    //             username:
    //                 JSON.parse(localStorage.getItem('user')).username !== null ?
    //                     JSON.parse(localStorage.getItem('user')).username : null,
    //             isLoggedIn:
    //                 JSON.parse(localStorage.getItem('user')).username !== null,
    //         })
    //     }
    // }

    // --- Login form submission ---------------------------------------
    const submitForm = (event) => {

        event.preventDefault();
        event.stopPropagation();
        console.log('Form submitting started')

        axios.post(
  `${process.env.REACT_APP_API_URL}/api/newEvent`, formFieldValues)
            .then(response => {
                //console.log(response)
                if (response.status === 200) {
                    console.log("Response 200 OK!")
                    // set token in cookie
                    // document.cookie = `token=${response.data}`

                    localStorage.setItem('user',
                        JSON.stringify(response.data))

                    if(response.data.accessToken !== null){
                        console.log("User is logged in. " )
                        console.log(response.data.accessToken)
                        // Setting user login status prop to true
                       props.setUserData(JSON.stringify(response.data));
                        localStorage.setItem('user.isLoggedIn', 'true');
                        user.isLoggedIn(true);
                    }else{
                        console.log("User is not logged in")
                        // Setting user login status prop to false
                        user.isLoggedIn(false)
                        //isLoggedIn = false
                    }

                        resetForm()
                }
            })
            .catch(error =>
                console.log(error))
    }
    const resetForm = ()=>{
        setFormFieldValues({...formFieldValues, email: '', password: ''});
    }
    if(user.isLoggedIn === true){
        return (<div className="container"><h2>{user.username}, You are logged in!</h2>
            <nav>
                <div className="nav">
                    <Link  to={routes.event.ADD_EVENT_ROUTE}>Add an event</Link>&nbsp;&nbsp;&nbsp;
                    <Link to="/list">List events</Link>&nbsp;&nbsp;&nbsp;
                </div>
            </nav>
        </div>)
    }
    return (
        <div className="container">
            {user.isLoggedIn === false &&
            <Form onSubmit={submitForm}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        name="email"
                        onChange={handleChange}
                        value={formFieldValues.email}
                        type="email"
                        placeholder="Enter email"/>
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        onChange={handleChange}
                        value={formFieldValues.password}
                        name="password"
                        type="password"
                        placeholder="Password"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Link to="/signup">Rekisteröydy</Link>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>}
        </div>
    );
}

export default Login;