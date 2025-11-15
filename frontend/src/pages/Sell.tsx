import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Sell() {
    const navigate = useNavigate();

    // Form State
    const [form, setForm] = useState({
        name: "",
        price: "",
        stock_quantity: "1",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");

    // User’s Products
    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Load user products on page open
    useEffect(() => {
        const fetchMyProducts = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("/api/user_products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accessToken: token }),
                });

                const data = await res.json();

                if (data.results) {
                    setMyProducts(data.results);
                }
            } catch (err) {
                console.error("User products error:", err);
            }

            setLoadingProducts(false);
        };

        fetchMyProducts();
    }, []);

    // Submit new product
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();

            formData.append("name", form.name);
            formData.append("price", form.price);
            formData.append("stock_quantity", form.stock_quantity);
            if (imageFile) formData.append("image", imageFile);

            formData.append("accessToken", token || "");

            const res = await fetch("/api/add_product", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Product listed successfully!");
                setTimeout(() => navigate("/sell"), 1200); // refresh page
            } else {
                setMessage("❌ " + (data.error || "Failed to list product"));
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Network error.");
        }
    }

    // Price validation
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setForm({ ...form, price: value });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="p-8 max-w-4xl mx-auto">

                <h1 className="text-3xl font-bold text-yellow-400 mb-4">
                    Your Products
                </h1>

                {loadingProducts ? (
                    <p className="text-gray-400">Loading your items...</p>
                ) : myProducts.length === 0 ? (
                    <p className="text-gray-400">You have no products listed yet.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                        {myProducts.map((p) => (
                            <div
                                key={p.productID}
                                className="bg-gray-800 p-4 rounded-xl shadow-lg"
                            >
                                <img
                                    src={
                                        p.image_location ||
                                        "https://via.placeholder.com/150"
                                    }
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

                {/* SELL FORM */}
                <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
                    List a New Product
                </h2>

                <div className="flex items-center justify-center">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 space-y-4"
                    >
                        {/* Product Name */}
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                            required
                        />

                        {/* Price with $ */}
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-400">$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Price"
                                value={form.price}
                                onChange={handlePriceChange}
                                className="w-full pl-7 pr-3 py-2 rounded bg-gray-700 focus:outline-none"
                                required
                            />
                        </div>

                        {/* Stock Quantity */}
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-1">
                                Stock Quantity
                            </label>
                            <input
                                type="number"
                                value={form.stock_quantity}
                                min="1"
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val >= 1)
                                        setForm({
                                            ...form,
                                            stock_quantity: e.target.value,
                                        });
                                }}
                                placeholder="Enter quantity (default: 1)"
                                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                                required
                            />
                        </div>

                        {/* File Upload */}
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-1">
                                Upload Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setImageFile(
                                        e.target.files ? e.target.files[0] : null
                                    )
                                }
                                className="w-full text-gray-300"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 rounded"
                        >
                            List Product
                        </button>

                        {message && (
                            <p className="text-center text-sm mt-2 text-yellow-400">
                                {message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
