import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, {useState} from "react";
import axios from "axios";
import {Formik} from 'formik';
import * as yup from 'yup';


const Signup = () =>{


    // Hooks
    const [newUser, setNewUser] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [validated, setValidated] = useState(false);


    // Form validation scheme
    const schema = yup.object().shape({

        username: yup.string()
            .min(5, 'Must be at least 5 characters')
            .max(20, 'Must be less  than 20 characters')
            .required('Username is required')
            .test('Unique username', 'Username already in use', // <- key, message
                function (value) {
                    return new Promise((resolve, reject) => {
                        axios.get("http://localhost:8081/api/usernames/?username=" + value)
                            .then((res) => {
                                //console.log(res)
                                if(res.data.username) resolve(false)
                                else resolve(true)
                            })
                            .catch((error) => {
                                if (error.response.data.content === "The username has already been taken.") {
                                    resolve(true);
                                }
                            })
                    })
                }
            ),
        email: yup.string()
            .min(5, 'Must be at least 5 characters')
            .max(30, 'Must be less than 30 characters')
            .required('Email is required')
            .test('Unique email', 'Email already in use', // <- key, message
                function (value) {
                    return new Promise((resolve, reject) => {
                        axios.get("http://localhost:8081/api/usernames/?email=" + value)
                            .then((res) => {
                                //console.log(res)
                                if(res.data.email) resolve(false)
                                else resolve(true)
                            })
                            .catch((error) => {
                                if (error.response.data.content === "The email has already been taken.") {
                                    resolve(true);
                                }
                            })
                    })
                }
            )
            .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
                message: 'Email is not valid',
                name: 'email',
                excludeEmptyString: true,
            }),
        password: yup.string()
            .required()
            .min(5, 'Must be at least 5 characters')
            .max(30, 'Must be less than 30 characters'),

        // terms: yup.bool().required().oneOf([true], 'Terms must be accepted'),
    });

    const handleSubmit = (event) => {
        let result;
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        setValidated(true);

        console.log(event.values)
        if(validated){
            axios.post('http://localhost:8081/api/signup', newUser)
                .then(response => {
                    console.log(response)
                    if (response.status === 200) {
                        console.log("Response 200 OK!")
                        result = true;
                    }
                })
                .catch(error =>
                    console.log(error))
                    result=false
            event.preventDefault();
        }
        return result
    };

    return (
        <div className="container">
            <Formik
                validationSchema={schema}

                initialValues={{
                    username: '',
                    email: '',
                    password: ''
                }}
                onSubmit={(values, { setSubmitting , resetForm}) => {

                    console.log(values)

                        axios.post(
  `${process.env.REACT_APP_API_URL}/api/newEvent`, values)
                            .then(response => {
                                console.log(response)
                                if (response.status === 202) {
                                    console.log("Response 202 OK!")
                                    resetForm({values: ''})
                                }
                            })
                            .catch(error =>
                                console.log(error))


                    setSubmitting(false);
                }}
            >
                {({
                      handleSubmit,
                      handleChange,
                      handleBlur,
                      values,
                      touched,
                      isValid,
                      errors,
                      isSubmitting,
                        resetForm

                  }) => (
            <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label>Käyttäjänimi:</Form.Label>
                    <Form.Control
                        name="username"
                        type="text"
                        placeholder="Syötä käyttäjänimi"
                        value = {values.username}
                        onChange = {handleChange}
                        onBlur = {handleBlur}
                        isValid = {touched.username && !errors.username}
                        isInvalid={!!errors.username}
                        //size="lg"

                        />
                    <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Sähköpostiosoite:</Form.Label>
                    <Form.Control
                        name="email"
                        type="email"
                        placeholder="Syötä sähköpostiosoite"
                        value = {values.email}
                        onChange = {handleChange}
                        onBlur = {handleBlur}
                        isValid = {touched.email && !errors.email}
                        isInvalid={!!errors.email}

                        required/>
                    <Form.Text className="text-muted">
                        {errors.email && touched.email && errors.email}
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Salasana:</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur = {handleBlur}
                        required />
                    <Form.Text className="text-muted">
                        {errors.password && touched.password && errors.password}
                    </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>

            </Form>
            )}
            </Formik>
        </div>
    );
}
export default Signup