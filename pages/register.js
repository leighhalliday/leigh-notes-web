import React, { useState } from "react";
import Axios from "axios";
import Layout from "../components/Layout";
import { login } from "../utils/withAuthSync";

const useRegister = () => {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await Axios.post(
        "https://leigh-notes-api.herokuapp.com/users",
        {
          user: { name, email, password }
        }
      );
      login(response.data.token);
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
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    register
  };
};

const Form = () => {
  const {
    submitting,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    register
  } = useRegister();

  return (
    <form onSubmit={register}>
      {error && <p className="error">{error}</p>}
      <div>
        <input
          type="text"
          placeholder="name"
          onChange={e => {
            setName(e.target.value);
          }}
          value={name}
          disabled={submitting}
          required
        />
      </div>
      <div>
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
      </div>
      <div>
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
      </div>
      <div>
        <button type="submit" disabled={submitting}>
          Register
        </button>
      </div>
    </form>
  );
};

const Register = () => (
  <Layout token={null}>
    <h1>Register</h1>
    <Form />
  </Layout>
);

export default Register;
