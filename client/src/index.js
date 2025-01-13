import React from "react";
import ReactDOM from "react-dom/client"; // Import from react-dom/client instead of react-dom
import "./index.css"; // Ensure this file exists
import App from "./App"; // Ensure App.js exists and is correctly named

const root = ReactDOM.createRoot(document.getElementById("root")); // Use createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
