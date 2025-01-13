import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [sellItem, setSellItem] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [existingSellers, setExistingSellers] = useState([]);
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const navigate = useNavigate();

  const fetchInventory = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/inventory", {
        headers: { "x-auth-token": token },
      });
      setItems(res.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const fetchSellersAndCustomers = async () => {
    const token = localStorage.getItem("token");
    try {
      const sellersRes = await axios.get("http://localhost:5000/sellers", {
        headers: { "x-auth-token": token },
      });
      setExistingSellers(sellersRes.data);

      const customersRes = await axios.get("http://localhost:5000/customers", {
        headers: { "x-auth-token": token },
      });
      setExistingCustomers(customersRes.data);
    } catch (error) {
      console.error("Error fetching sellers/customers:", error);
    }
  };

  const handleCreateSeller = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:5000/sellers",
        { name: sellerName },
        { headers: { "x-auth-token": token } }
      );
      alert(`Seller ${res.data.name} created successfully!`);
      setSellerId(res.data._id);
      setSellerName("");
    } catch (error) {
      console.error("Error creating seller:", error);
      alert("Failed to create seller. Please try again.");
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:5000/customers",
        { name: customerName, email: customerEmail },
        { headers: { "x-auth-token": token } }
      );
      alert(`Customer ${res.data.name} created successfully!`);
      setCustomerName(res.data.name);
      setCustomerEmail("");
      setCreatingCustomer(false);
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer. Please try again.");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!sellerId) {
      alert("Please create or select a seller before adding products.");
      return;
    }
    try {
      if (editItem) {
        await axios.put(
          `http://localhost:5000/inventory/${editItem._id}`,
          { name, quantity, price, sellerId },
          { headers: { "x-auth-token": token } }
        );
        setEditItem(null);
      } else {
        await axios.post(
          "http://localhost:5000/inventory",
          { name, quantity, price, sellerId },
          { headers: { "x-auth-token": token } }
        );
      }
      fetchInventory();
      resetForm();
    } catch (error) {
      console.error("Error adding/updating item:", error);
    }
  };

  const handleSellItem = async (e) => {
    e.preventDefault();
    if (!sellItem || saleQuantity <= 0 || !customerName) {
      alert("Please fill in all the sale details.");
      return;
    }

    const quantityAvailable = parseInt(sellItem.quantity, 10);
    if (parseInt(saleQuantity, 10) > quantityAvailable) {
      alert(`Cannot sell more than ${quantityAvailable} units of ${sellItem.name}.`);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const customer = existingCustomers.find(cust => cust.name === customerName);
      if (!customer) {
        alert("Selected customer does not exist.");
        return;
      }
      await axios.post(
        "http://localhost:5000/sales",
        {
          productId: sellItem._id,
          quantity: parseInt(saleQuantity, 10),
          customerId: customer._id,
        },
        { headers: { "x-auth-token": token } }
      );
      alert("Sale completed successfully!");
      fetchInventory();
      resetForm();
    } catch (error) {
      console.error("Error completing sale:", error);
      alert("Failed to complete the sale. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/inventory/${id}`, {
        headers: { "x-auth-token": token },
      });
      fetchInventory();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const resetForm = () => {
    setName("");
    setQuantity("");
    setPrice("");
    setCustomerName("");
    setSaleQuantity("");
    setEditItem(null);
    setSellItem(null);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    fetchInventory();
    fetchSellersAndCustomers();
  }, []);

  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <div className="inventory-container">
      <h2 className="inventory-title">Inventory</h2>
      <button onClick={handleBack} className="btn btn-back">Back to Dashboard</button>

      <div className="seller-form-container">
        <h3>Create a Seller</h3>
        <form onSubmit={handleCreateSeller}>
          <input
            type="text"
            placeholder="Seller Name"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-submit">Create Seller</button>
        </form>
      </div>

      <div className="existing-sellers-container">
        <h3>Existing Sellers</h3>
        <select onChange={(e) => setSellerId(e.target.value)} value={sellerId}>
          <option value="">Select Seller</option>
          {existingSellers.map((seller) => (
            <option key={seller._id} value={seller._id}>{seller.name}</option>
          ))}
        </select>
      </div>

      <div className="existing-customers-container">
        <h3>Existing Customers</h3>
        <select onChange={(e) => setCustomerName(e.target.value)} value={customerName}>
          <option value="">Select Customer</option>
          {existingCustomers.map((customer) => (
            <option key={customer._id} value={customer.name}>{customer.name}</option>
          ))}
        </select>
        <button onClick={() => setCreatingCustomer(true)} className="btn btn-create-customer">
          Create New Customer
        </button>
      </div>

      {creatingCustomer && (
        <div className="create-customer-form">
          <h3>Create New Customer</h3>
          <form onSubmit={handleCreateCustomer}>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Customer Email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-submit">Create Customer</button>
          </form>
        </div>
      )}

      <form onSubmit={handleAddItem} className="inventory-form">
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={!sellerId}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          disabled={!sellerId}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          disabled={!sellerId}
        />
        <button type="submit" className="btn btn-submit" disabled={!sellerId}>
          {editItem ? "Update Item" : "Add Item"}
        </button>
      </form>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item._id} className="item-card">
            <span>
              {item.name} - Quantity={item.quantity} Price={formatPrice(item.price)}
            </span>
            <div className="action-buttons">
              <button
                onClick={() => {
                  setEditItem(item);
                  setName(item.name);
                  setQuantity(item.quantity);
                  setPrice(item.price);
                }}
                className="btn btn-edit"
              >
                Edit
              </button>
              <button
                onClick={() => setSellItem(item)}
                className="btn btn-sell"
              >
                Sell
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="btn btn-delete"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {sellItem && (
        <div className="sell-form-container">
          <h3>Sell Item: {sellItem.name}</h3>
          <form onSubmit={handleSellItem}>
            <div>
              <h4>Select Customer</h4>
              <select onChange={(e) => setCustomerName(e.target.value)} value={customerName}>
                <option value="">Select Customer</option>
                {existingCustomers.map((customer) => (
                  <option key={customer._id} value={customer.name}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="number"
              placeholder="Quantity to Sell"
              value={saleQuantity}
              onChange={(e) => setSaleQuantity(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-submit">
              Complete Sale
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Inventory;