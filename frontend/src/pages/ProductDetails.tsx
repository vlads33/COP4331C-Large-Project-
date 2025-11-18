import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

interface Product {
    _id: string;
    name: string;
    price: number;
    stock_quantity: number;
    image_location?: string;
}

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const BASE_URL = "https://knightmp.xyz";

    function getImageURL(path?: string) {
        if (!path) return "https://via.placeholder.com/150";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}${path}`;
    }

    async function loadProduct() {
        try {
            const token = localStorage.getItem("accessToken");

            const res = await fetch("/api/search_single_product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productID: id, accessToken: token }),
            });

            const data = await res.json();

            if (data && data.results && data.results.length > 0) {
                setProduct(data.results[0]);
            } else {
                setError("Product not found.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load product.");
        }

        setLoading(false);
    }

    async function addToCart() {
        const token = localStorage.getItem("accessToken");

        const res = await fetch("/api/add_item_to_cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productID: id,
                quantity: 1,
                accessToken: token,
            }),
        });

        const data = await res.json();
        console.log("Add to Cart:", data);

        alert("Added to cart!");
    }

    useEffect(() => {
        loadProduct();
    }, []);

    if (loading)
        return <div className="text-center p-10 text-white">Loading...</div>;

    if (error)
        return <div className="text-center p-10 text-red-400">{error}</div>;

    if (!product)
        return <div className="text-center p-10 text-gray-400">Product not found.</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="p-8 max-w-2xl mx-auto">
                <img
                    src={getImageURL(product.image_location)}
                    alt={product.name}
                    className="w-64 h-64 object-cover mx-auto rounded mb-4"
                />

                <h1 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
                    {product.name}
                </h1>

                <p className="text-center text-2xl mb-2">${product.price}</p>
                <p className="text-center text-gray-400 mb-6">
                    Stock: {product.stock_quantity}
                </p>

                <button
                    onClick={addToCart}
                    className="w-full p-4 bg-yellow-500 rounded-xl text-black font-bold hover:bg-yellow-600 transition"
                >
                    Add to Cart 🛒
                </button>
            </div>
        </div>
    );
}
