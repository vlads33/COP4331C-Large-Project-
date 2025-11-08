import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Sell from "./pages/Sell";
import Listing from "./pages/Listing";
import About from "./pages/About";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/listing" element={<Listing/>} />
                <Route path="/about" element={<About />} />

            </Routes>
        </Router>
    );
}

export default App;
