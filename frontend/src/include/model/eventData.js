import { useState, useEffect } from 'react';
import axios from "axios";

// eslint-disable-next-line react-hooks/rules-of-hooks
    const [eventData, setEventData] = useState([]);

     export const addEvent= (newEvent, tokenKey) => {
        // Fetch user data from the API and update the state
        axios.post('http://localhost:8081/api/newEvent', newEvent, {headers: {Authorization: 'Bearer: ' + JSON.parse(tokenKey).accessToken}})
            .then(response => {
                // console.log(response)
                if (response.status === 200) {
                    //console.log("Response 200 OK!")
                }
            })
.catch(error =>
    console.log(error))


    }
