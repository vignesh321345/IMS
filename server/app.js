const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const secretKey="vignesh123"

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Ensure frontend is allowed to make requests
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Database Connection
mongoose.connect("mongodb://localhost:27017/vignesh", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected "))
  .catch(err => console.log("MongoDB connection error: ", err));

// User Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, sparse: true, unique: true },
});
const User = mongoose.model("User", UserSchema);

// Inventory Model
const InventorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
const Inventory = mongoose.model("Inventory", InventorySchema);

// Seller Model
const SellerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: {
        
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
            quantity: { type: Number },
            price: { type: Number }
        }
});
const Seller = mongoose.model("Seller", SellerSchema);

// Customer Model
const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    purchasedProducts: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
            quantity: { type: Number },
            purchaseDate: { type: Date, default: Date.now }
        }
    ]
});
const Customer = mongoose.model("Customer", CustomerSchema);

// Sales Model
const SaleSchema = new mongoose.Schema({
    itemName: { type: String },
    customerName: { type: String },
    saleDate: { type: Date, default: Date.now },
    quantity: { type: Number },
});
const Sale = mongoose.model("Sale", SaleSchema);

// Middleware for Authentication
const authenticate = async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Access Denied");

    try {
        const verified = jwt.verify(token, secretKey);
        console.log(token)
        req.user = verified.token;
        next();
    } catch (err) {
        res.status(400).send("Invalid Token");
    }
};




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Routes
// Register Route
app.post("/register", async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).send("Username or email already exists");
        }

        const newUser = new User({ username, password, email });
        await newUser.save();

        const token = jwt.sign(
           { userregister:{
                 _id:
                     newUser._id 
            }, secretKey});
        res.status(201).send({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering user");
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        });

        if (!user || user.password !== password) return res.status(400).send("Invalid username, email, or password");

        const token = jwt.verify({ _id: user._id }, "secretKey");
        res.header("x-auth-token", token).send({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// Fetch User Profile
app.get("/user/profile", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).send("User not found");
        res.send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching user profile");
    }
});

// Inventory Routes
app.get("/inventory", authenticate, async (req, res) => {
    try {
        const items = await Inventory.find({ userId: req.user._id });
        res.send(items);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching inventory items");
    }
});

app.post("/inventory", authenticate, async (req, res) => {
    const { name, quantity, price } = req.body;
    try {
        const newItem = new Inventory({ name, quantity, price, userId: req.user._id });
        await newItem.save();
        res.status(201).send(newItem);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding inventory item");
    }
});

// DELETE Route to remove an inventory item
app.delete("/inventory/:id", authenticate, async (req, res) => {
    try {
        const itemId = req.params.id;

        // Find and delete the inventory item by ID and ensure it belongs to the authenticated user
        const item = await Inventory.findOneAndDelete({
            _id: itemId,
            userId: req.user._id, // Only allow the item to be deleted by the owner
        });

        if (!item) {
            return res.status(404).send("Item not found or you do not have permission to delete it.");
        }

        res.status(200).send("Item deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting item");
    }
});
// Seller Routes
app.get("/sellers", authenticate, async (req, res) => {
    try {
        const sellers = await Seller.find({ userId: req.user._id }).populate({
            path: 'products.productId',
            select: 'name quantity price', // Include the product details
            populate: {
                path: 'productId',
                select: 'name quantity price', // Ensure product details are included
            }
        });
        res.send(sellers);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching sellers");
    }
});

app.post("/sellers", authenticate, async (req, res) => {
    const { name } = req.body;
    try {
        const newSeller = new Seller({ name, userId: req.user._id });
        await newSeller.save();
        res.status(201).send(newSeller);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating seller");
    }
});


// Sales Route
app.post("/sales", authenticate, async (req, res) => {
    const { productId, quantity, customerId } = req.body;

    try {
        const product = await Inventory.findById(productId);
        const customer = await Customer.findById(customerId);

        if (!product || product.quantity < quantity) {
            return res.status(400).send("Product not available or insufficient quantity");
        }

        if (!customer) {
            return res.status(404).send("Customer not found");
        }

        // Update the product quantity
        product.quantity -= quantity;
        await product.save();

        // Record the sale
        const sale = new Sale({
            itemName: product.name,
            customerName: customer.name,
            quantity,
        });
        await sale.save();

        // Update customer's purchased products
        customer.purchasedProducts.push({ productId, quantity });
        await customer.save();

        res.status(201).send("Sale completed successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing sale");
    }
});

// Customer Routes
app.get("/customers", authenticate, async (req, res) => {
    try {
        const customers = await Customer.find().populate('purchasedProducts.productId');
        res.send(customers);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching customers");
    }
});

app.post("/customers", authenticate, async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).send("Name and email are required.");
    }

    try {
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) return res.status(409).send("Customer with this email already exists");

        const newCustomer = new Customer({ name, email });
        await newCustomer.save();

        res.status(201).send(newCustomer);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating customer");
    }
});

// Server
const PORT = 5000;
app.listen(PORT, (err) => console.log(`Server running on port ${PORT}`));
