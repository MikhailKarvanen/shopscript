import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";



const Logout = ({user}) => {


    // return axios.post(API_URL + "signout").then((response) => {
    //     return response.data;
    // });

    localStorage.removeItem('user')
    localStorage.setItem('user.isLoggedIn', 'false');
    user.isLoggedIn = false;
    const removeToken = () => {
        localStorage.removeItem('user')


    };

    // useEffect(()=> {
    //     const removeToken= async () =>{
    //         localStorage.removeItem('user')
    //
    //
    //     }
    //     localStorage.removeItem('user')
    //     localStorage.setItem('user.isLoggedIn', 'false');
    //     //user.username = '';
    //
    //
    //     // Tarkistetaan onko säiliössä on "user"-objekti
    //
    //
    // }, []);

        return (<div className="container"><h2>You are logged out!</h2>
            <nav>
                <div className="nav">

                    <Link to="/list">List events</Link>&nbsp;&nbsp;&nbsp;
                </div>
            </nav>
        </div>)


}
export default Logout