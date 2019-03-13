import React, { useState } from "react";
import Axios from "axios";
import { login } from "../utils/withAuthSync";
import Layout from "../components/Layout";

const useAuth = () => {
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const authenticate = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await Axios.post(
        "https://leigh-notes-api.herokuapp.com/session",
        {
          email,
          password
        }
      );
      const { token } = response.data;
      login({ token });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.errors.join(", "));
      } else {
        throw error;
      }
    }

    setSubmitting(false);
  };

  return {
    submitting,
    email,
    setEmail,
    password,
    setPassword,
    error,
    authenticate
  };
};

const Form = () => {
  const {
    submitting,
    email,
    setEmail,
    password,
    setPassword,
    error,
    authenticate
  } = useAuth();

  return (
    <form onSubmit={authenticate}>
      {error && <p className="error">{error}</p>}
      <input
        type="email"
        placeholder="email"
        onChange={e => {
          setEmail(e.target.value);
        }}
        value={email}
        autoComplete="username"
        disabled={submitting}
        required
      />
      <input
        type="password"
        placeholder="password"
        onChange={e => {
          setPassword(e.target.value);
        }}
        value={password}
        autoComplete="current-password"
        disabled={submitting}
        required
      />
      <button type="submit" disabled={submitting}>
        Login
      </button>
    </form>
  );
};

const Login = () => (
  <Layout token={null}>
    <h1>Login</h1>
    <Form />
  </Layout>
);

export default Login;
