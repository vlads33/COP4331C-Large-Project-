import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface Product {
    _id: string;
    name: string;
    price: number;
    stock_quantity: number;
    image_location?: string;
    user_id?: { username: string };
}

export default function Listings() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products");
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="p-8">
                <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                    Product Listings 🛍️
                </h1>

                {loading ? (
                    <p className="text-center text-gray-400">Loading products...</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-gray-400">No products found.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform duration-200"
                            >
                                <img
                                    src={
                                        product.image_location ||
                                        "https://via.placeholder.com/150x150?text=No+Image"
                                    }
                                    alt={product.name}
                                    className="w-32 h-32 object-cover rounded-lg mb-4"
                                />
                                <h2 className="text-xl font-semibold text-yellow-400">
                                    {product.name}
                                </h2>
                                <p className="text-gray-300">${product.price.toFixed(2)}</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Stock: {product.stock_quantity}
                                </p>
                                {product.user_id?.username && (
                                    <p className="text-gray-500 text-xs mt-2">
                                        Seller: {product.user_id.username}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
