import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import api, { setAuthToken } from "../api";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const history = useHistory();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('api/signin', form);
      const { accessToken, refreshToken, username } = res.data;

      // Save tokens in localStorage
      const userData = { accessToken, refreshToken, username };
      localStorage.setItem('user', JSON.stringify(userData));

      // Set axios header
      setAuthToken(accessToken);

      // Update App state
      onLogin(userData);

      history.push('/list');
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="container">
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" value={form.password} onChange={handleChange} />
        </Form.Group>
        <Button type="submit">Login</Button>
        <Link to="/signup">Sign up</Link>
      </Form>
    </div>
  );
};

export default Login;