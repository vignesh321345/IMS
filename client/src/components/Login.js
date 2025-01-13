import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css'; // Import custom CSS

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // Username or email
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", { identifier, password });
      localStorage.setItem("token", res.data.token); // Store the token in localStorage
      setErrorMessage(""); // Clear error message if login succeeds
      navigate("/dashboard"); // Redirect to Dashboard page after successful login
    } catch (err) {
      setErrorMessage("Invalid username, email, or password"); // Set error message
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <form onSubmit={handleLogin}>
          <h2 className="mb-4">Login</h2>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} {/* Display error message */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
