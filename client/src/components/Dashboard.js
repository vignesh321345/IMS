import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css"; // Ensure the CSS file path is correct

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("profile");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000";

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/user/profile`, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      setProfile(response.data);
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  // Fetch sellers
  const fetchSellers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/sellers`, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      setSellers(response.data);
    } catch (err) {
      console.error("Error fetching sellers", err);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/customers`, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers", err);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    navigate("/login"); // Navigate to the login page
  };

  useEffect(() => {
    fetchProfile();
    fetchSellers();
    fetchCustomers();
  }, []);

  // Toggle Sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? "Close" : "Open"} Sidebar
        </button>
        <h3>Navigation</h3>
        <ul>
          <li>
            <button className="btn" onClick={() => setCurrentView("profile")}>
              Profile
            </button>
          </li>
          <li>
            <button className="btn" onClick={() => navigate("/inventory")}>
              Inventory
            </button>
          </li>
          <li>
            <button className="btn" onClick={() => setCurrentView("sellers")}>
              Sellers
            </button>
          </li>
          <li>
            <button className="btn" onClick={() => setCurrentView("customers")}>
              Customers
            </button>
          </li>
          <li>
            {/* Logout Button */}
            <button className="btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <h2>Dashboard</h2>
        {currentView === "profile" && profile && (
          <div className="profile-section">
            <h3>Profile</h3>
            <p>Username: {profile.username}</p>
            <p>Email: {profile.email}</p>
          </div>
        )}
        {currentView === "sellers" && (
          <div>
            <h3>Sellers</h3>
            <ul>
              {sellers.map((seller) => (
                <li key={seller._id}>
                  <h4>{seller.name}</h4>
                  <ul>
                    {seller.products.map((product) => (
                      <li key={product.productId._id}>
                        <p>Product Name: {product.productId.name}</p>
                        <p>Price: ${product.price}</p>
                        <p>Quantity: {product.quantity}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentView === "customers" && (
          <div>
            <h3>Customers</h3>
            <ul>
              {customers.map((customer) => (
                <li key={customer._id}>
                  {customer.name} - {customer.email}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
