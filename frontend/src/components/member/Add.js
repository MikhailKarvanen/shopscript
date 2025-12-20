import React, {useState} from 'react'
import Form from "react-bootstrap/Form";
import {Col, Row} from "react-bootstrap";
import {Typeahead} from 'react-bootstrap-typeahead'
import Button from "react-bootstrap/Button";
import axios from "axios";
//import {addEvent} from "src/include/model/eventData.js";



const Add = ({events}) => {

   let tokenKey = localStorage.getItem('user')

   const places = events

   //  const addEvent = (event) => {
   //      event.preventDefault()
   //      console.log('button clicked', event.target)
   //  }

   // Form hooks validation & submission
   const [validated, setValidated] = useState(false);
   //const [selected, setSelected] = useState();
   // const [eventLocationCity, setEventLocationCity] = useState();


   const [newEvent, setNewEvent] = useState({
       name: "",
       type: "",
       date: "",
       locationId: "",
       locationName: "",
       locationAddr: "",
       locationCity: "",
       locationZip: "",
       locationCountry: ""

   });
   const handleChange = (event) => {
       setNewEvent({...newEvent, [event.target.name]: event.target.value});
   }

   // Method updates event location fields on choosing an existing location
   const handleChangeEventLocation = (selectedLocation) => {

       if (selectedLocation[0]) {
           console.log(selectedLocation[0])
           //  setSelected([selectedLocation[0]])
           newEvent.locationId = selectedLocation[0].Location_id
           newEvent.locationName = selectedLocation[0].Location_name

           document.getElementById("eventLocationAddr").value = selectedLocation[0].Street_address
           newEvent.locationAddr = selectedLocation[0].Street_address
           document.getElementById("eventLocationCity").value = selectedLocation[0].City
           newEvent.locationCity = selectedLocation[0].City
           document.getElementById("eventLocationZip").value = selectedLocation[0].Zip
           newEvent.locationZip = selectedLocation[0].Zip
           document.getElementById("eventLocationCountry").value = selectedLocation[0].Country
           newEvent.locationCountry = selectedLocation[0].Country
       } else {

           newEvent.locationId = ""
           newEvent.locationName = ""

           document.getElementById("eventLocationName").value = ""
           newEvent.locationName = ""
           document.getElementById("eventLocationAddr").value = ""
           newEvent.locationAddr = ""
           document.getElementById("eventLocationCity").value = ""
           newEvent.locationCity = ""
           document.getElementById("eventLocationZip").value = ""
           newEvent.locationZip = ""
           document.getElementById("eventLocationCountry").value = ""
           newEvent.locationCountry = ""
       }
   }


   //console.log(eventLocation);
   const handleInputChange = (input, e) => {
       newEvent.locationName = input;
    //   console.log('newEvent.locationName value', newEvent.locationName);
   }

   // Method for submitting new event
   const handleSubmit = (event) => {
       const form = event.currentTarget;
       if (form.checkValidity() === false || validated === false) {
           event.preventDefault();
        }

       setValidated(true);

       if(tokenKey !== null){


           axios.post(`${process.env.REACT_APP_API_URL}/api/newEvent`,
  newEvent, {    headers: {
      Authorization: `Bearer ${JSON.parse(tokenKey).accessToken}`
    }})
               .then(response => {
                   // console.log(response)
                   if (response.status === 200) {
                       //console.log("Response 200 OK!")
                   }
               })
               .catch(error =>
                   console.log(error))
       event.preventDefault();
       }else{
           console.log("user in not logged in")
       }
   };


   return (

       <div className="container">
           <Form noValidate validated={validated} onSubmit={handleSubmit}>
               <Row className="mb-3 mt-3">
                   <Form.Group as={Col} md="8" >
                       <Form.Label>Tapahtuman nimi:</Form.Label>
                       <Form.Control
                           type="text"
                           name="name"
                           value={newEvent.name}
                           onChange={handleChange}
                           placeholder="Syötä tapahtuman nimi"
                           required
                       />
                       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                   </Form.Group>
               </Row>
               <Row className="mb-3 mt-3">

                   <Form.Group as={Col} md="4" >
                       <Form.Label>Tapahtuman tyyppi:</Form.Label>
                       <Form.Control as="select"
                                     type="select"
                                     name="type"
                                     value={newEvent.type}
                                     onChange={handleChange}
                                     defaultValue="Syötä tapahtuman nimi"
                                     required>
                           <option value="">Valitse</option>
                           <option value="Musiikki">Musiikki</option>
                           <option value="Urheilu">Urheilu</option>
                       </Form.Control>
                       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                   </Form.Group>

                   <Form.Group as={Col} md="4" >
                       <Form.Label>Tapahtuman päivämäärä:</Form.Label>
                       <Form.Control
                           required
                           type="date"
                           name="date"
                           value={newEvent.date}
                           onChange={handleChange}>
                       </Form.Control>
                       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                   </Form.Group>
               </Row>
               <Row className="mb-3 mt-3">
                   <Form.Group as={Col} md="8" >
                       <Form.Label>Tapahtumapaikan nimi:</Form.Label>
                       <Typeahead
                           name="locationName"
                           value={newEvent.locationId}
                           //selected={selected}
                           onChange={handleChangeEventLocation}
                           onInputChange={handleInputChange}
                           labelKey={places => `${places.Location_name}, ${places.Street_address}, ${places.Zip} ${places.City}, ${places.Country}`}
                           options={places}
                           placeholder="Syötä paikan nimi"
                           id="eventLocationName"
                       />
                       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                   </Form.Group>
               </Row>
               <Row className="mb-3">
                   <Form.Group as={Col} md="8">
                       <Form.Label>Osoite:</Form.Label>
                       <Form.Control
                           type="text"
                           name="locationAddr"
                           value={newEvent.locationAddr}
                           onChange={handleChange}
                           placeholder="Syötä tapahtumapaikan osoite"
                           id="eventLocationAddr"
                           required/>
                       <Form.Control.Feedback type="invalid">
                           Ole hyvä ja anna oikea osoite.
                       </Form.Control.Feedback>
                       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                   </Form.Group>
               </Row>

               <Row className="mb-3 mt-3">
                   <Form.Group as={Col} md="3" >
                       <Form.Label>Kaupunki</Form.Label>
                       <Form.Control
                           type="text"
                           name="locationCity"
                           value={newEvent.locationCity}
                           onChange={handleChange}
                           placeholder="Kaupunki"
                           id="eventLocationCity"
                           required/>
                       <Form.Control.Feedback type="invalid">
                           Please provide a valid city.
                       </Form.Control.Feedback>
                       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                   </Form.Group>
                   <Form.Group as={Col} md="2" >
                       <Form.Label>Zip</Form.Label>
                       <Form.Control
                           type="text"
                           name="locationZip"
                           value={newEvent.locationZip}
                           onChange={handleChange}
                           placeholder="Postinumero"
                           id="eventLocationZip"
                           required/>
                       <Form.Control.Feedback type="invalid">
                           Please provide a valid zip.
                       </Form.Control.Feedback>
                       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                   </Form.Group>
                   <Form.Group as={Col} md="3" >
                       <Form.Label>Maa:</Form.Label>
                       <Form.Control
                           type="text"
                           name="locationCountry"
                           value={newEvent.locationCountry}
                           onChange={handleChange}
                           placeholder="Maa"
                           id="eventLocationCountry"
                           required/>
                       <Form.Control.Feedback type="invalid">
                           Please provide a valid state.
                       </Form.Control.Feedback>
                   </Form.Group>
               </Row>
               <Row className="mb-3 mt-3">
                   <Button type="submit">Submit form</Button>
               </Row>
           </Form>
       </div>
   )

}

export default Add