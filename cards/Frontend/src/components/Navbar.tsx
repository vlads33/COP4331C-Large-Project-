import React from "react";

const Navbar: React.FC = () => {
    return (
        <nav className="bg-gray-900 text-white flex items-center justify-between px-8 py-4 shadow-lg">
            {/* Left: Logo / Brand */}
            <h1 className="text-2xl font-bold text-yellow-400">
                Knights<span className="text-white">Marketplace</span>
            </h1>

            {/* Center: Links */}
            <ul className="hidden md:flex gap-8 text-lg font-medium">
                <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">Home</li>
                <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">Listings</li>
                <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">Sell</li>
                <li className="hover:text-yellow-400 transition duration-300 cursor-pointer">About</li>
            </ul>

            {/* Right: Login / Button */}
            <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold transition duration-300">
                Login
            </button>

        </nav>
    );
};

export default Navbar;
