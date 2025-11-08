import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Sell() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        price: "",
        stock_quantity: "",
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

            const res = await fetch("/api/products", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

                    <input
                        type="text"
                        placeholder="Product Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                        required
                    />

                    <input
                        type="number"
                        placeholder="Price ($)"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                        required
                    />

                    <input
                        type="number"
                        placeholder="Stock Quantity"
                        value={form.stock_quantity}
                        onChange={(e) =>
                            setForm({ ...form, stock_quantity: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                        required
                    />

                    {/* 🔽 File Upload Button */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setImageFile(e.target.files ? e.target.files[0] : null)
                        }
                        className="w-full text-gray-300"
                    />

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
