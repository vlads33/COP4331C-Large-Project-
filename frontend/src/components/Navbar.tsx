import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <nav className="bg-gray-900 text-white flex items-center justify-between px-8 py-4 shadow-lg">
            {/* Left: Logo / Brand */}
            <h1
                className="text-2xl font-bold text-yellow-400 cursor-pointer"
                onClick={() => navigate("/home")}
            >
                Knights<span className="text-white">Marketplace</span>

            </h1>

            {/* Center: Links */}
            <ul className="hidden md:flex gap-8 text-lg font-medium">
                <li>
                    <Link
                        to="/home"
                        className="hover:text-yellow-400 transition duration-300"
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <Link
                        to="/listing"
                        className="hover:text-yellow-400 transition duration-300"
                    >
                        Listings
                    </Link>
                </li>
                <li>
                    <Link
                        to="/sell"
                        className="hover:text-yellow-400 transition duration-300"
                    >
                        Sell
                    </Link>
                </li>
                <li>
                    <Link
                        to="/profile"
                        className="hover:text-yellow-400 transition duration-300"
                    >
                        Profile
                    </Link>
                </li>


                <li>
                    <Link
                        to="/about"
                        className="hover:text-yellow-400 transition duration-300"
                    >
                        About
                    </Link>
                </li>
            </ul>
            <ul >
            <li>
                <Link
                    to="/cart"
                    className="hover:text-yellow-400 transition duration-300 text-2xl"
                >
                    🛒
                </Link>
            </li>
            </ul>

            {/* Right: Login or Logout Button */}

            {localStorage.getItem("token") ? (
                <button
                    onClick={handleLogout}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold transition duration-300"
                >
                    Logout
                </button>
            ) : (
                <button
                    onClick={() => navigate("/")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold transition duration-300"
                >
                    Login
                </button>
            )}
        </nav>
    );
};

export default Navbar;
