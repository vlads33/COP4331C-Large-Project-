import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Sell() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        price: "",
        stock_quantity: "1",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");

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
                setTimeout(() => navigate("/home"), 1500);
            } else {
                setMessage("❌ " + (data.error || "Failed to list product"));
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Network error.");
        }
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setForm({ ...form, price: value });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="flex items-center justify-center mt-10">
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 space-y-4"
                >
                    <h2 className="text-2xl font-bold text-center text-yellow-400">
                        Sell a Product
                    </h2>

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
                        <label className="text-sm text-gray-400 mb-1">Stock Quantity</label>
                        <input
                            type="number"
                            value={form.stock_quantity}
                            min="1"
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val >= 1)
                                    setForm({ ...form, stock_quantity: e.target.value });
                            }}
                            placeholder="Enter quantity (default: 1)"
                            className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                            required
                        />
                    </div>

                    {/* File Upload */}
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setImageFile(e.target.files ? e.target.files[0] : null)
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
                        <p className="text-center text-sm mt-2 text-yellow-400">{message}</p>
                    )}
                </form>
            </div>
        </div>
    );
}
