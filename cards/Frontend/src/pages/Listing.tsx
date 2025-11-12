import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface Product {
    _id: string;
    name: string;
    price: number;
    stock_quantity: number;
    image_location?: string;
}

export default function Listings() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");

    async function loadProducts(term = "") {
        try {
            const res = await fetch("/api/search_products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search: term }),
            });

            // Safely parse JSON
            const data = await res.json();
            console.log("API Response:", data);

            // Prevent crashes
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setProducts([]);
        }
    }

    // Load all products
    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="p-8 text-center">
                <h1 className="text-3xl font-bold text-yellow-400 mb-6">
                    Product Listings 🛍️
                </h1>

                {/* Search Section */}
                <div className="mb-6">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="px-4 py-2 rounded-l bg-gray-800 text-gray-200 focus:outline-none"
                    />
                    <button
                        onClick={() => loadProducts(search)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 rounded-r"
                    >
                        Search
                    </button>
                </div>

                {/* Products Display */}
                {products.length === 0 ? (
                    <p className="text-gray-400">No products found.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((p: Product) => (
                            <div
                                key={p._id}
                                className="bg-gray-800 p-4 rounded-xl hover:scale-105 transition-transform duration-200"
                            >
                                <img
                                    src={p.image_location || "https://via.placeholder.com/150"}
                                    alt={p.name || "Product image"}
                                    className="w-32 h-32 object-cover mx-auto rounded mb-2"
                                />
                                <h2 className="text-yellow-400 font-semibold">{p.name}</h2>
                                <p>${p.price}</p>
                                <p className="text-gray-400 text-sm">
                                    Stock: {p.stock_quantity}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
