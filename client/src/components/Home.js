// Home.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "animate.css";  // Import animation library
import "./Home.css";  // External CSS for the hover effects

const Home = () => {
  const isLoggedIn = !!localStorage.getItem("token");
  const navigate = useNavigate();

  const handleInventoryClick = () => {
    if (isLoggedIn) {
      navigate("/inventory");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-container">
      {/* Header with only Login and Register Links */}
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <div className="navbar-nav ms-auto">
            <Link className="nav-link custom-link" to="/login">Login</Link>
            <Link className="nav-link custom-link" to="/register">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with radial gradient */}
      <div className="text-center hero-section">
        <h1 className="display-4 mb-4 animate__animated animate__fadeInUp animate__delay-1s" style={{ fontWeight: "bold", color: "#fff" }}>
          Welcome to the Inventory Management System
        </h1>
        <p className="lead mb-5 animate__animated animate__fadeInUp animate__delay-1s" style={{ fontSize: "1.2rem", color: "#dcdde1" }}>
          Manage your inventory efficiently with ease. Please log in or register to get started.
        </p>
      </div>
    </div>
  );
};

export default Home;
