import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Register.css';  // Import custom CSS

const Register = () => {
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [email, setEmail] = useState(""); // State for email
  const [error, setError] = useState(null); // State for error message
  const navigate = useNavigate(); // For navigation after successful registration

  // Handle form submission for registration
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!username || !password) {
      setError("Both username and password are required.");
      return;
    }

    try {
      // Send request to backend to register the user
      const res = await axios.post("http://localhost:5000/register", { username, password, email });

      // Save the received token in localStorage
      localStorage.setItem("token", res.data.token);

      // Clear any previous errors
      setError(null);

      // Redirect to dashboard after successful registration
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response && err.response.status === 409) {
        // Handle case where username already exists
        setError("User already exists. Please choose a different username.");
      } else {
        // General error handling
        setError("An error occurred while registering. Please try again.");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <form onSubmit={handleRegister}>
          <h2 className="mb-4">Register</h2>
          
          {/* Display error message if any */}
          {error && <p className="error-message">{error}</p>} 

          {/* Username Input */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          {/* Password Input */}
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

          {/* Email Input */}
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email (Optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {/* Register Button */}
          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
