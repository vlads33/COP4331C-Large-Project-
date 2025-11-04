import React from "react";
import Navbar from "../components/Navbar";

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center flex-grow text-center px-6">
                <h1 className="text-5xl font-extrabold text-yellow-400 mb-4">
                    Welcome to Knights Marketplace 🔥
                </h1>
                <p className="text-gray-300 text-lg max-w-xl mb-8">
                    Buy, sell, and trade with UCF students easily and securely.
                </p>

                <div className="flex gap-9">
                    <button className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition duration-300">
                        Explore Listings
                    </button>
                    <button className="border border-yellow-400 text-yellow-400 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition duration-300">
                        Create Listing
                    </button>
                </div>
            </section>


            <footer className="bg-gray-800 py-4 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Knights Marketplace
            </footer>
        </div>
    );
};

export default Home;
