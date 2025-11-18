import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Sell from "./pages/Sell";
import Listing from "./pages/Listing";
import About from "./pages/About";
import Profile from "./pages/Profile.tsx";
import Cart from "./pages/Cart.tsx";
import ProductDetails from "./pages/ProductDetails";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/listing" element={<Listing/>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/edit-product/:productID" element={<EditProduct />} />
            </Routes>
        </Router>
    );
}

export default App;
