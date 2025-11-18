import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

interface Product {
    productID: string;
    name: string;
    price: number;
    stock_quantity?: number;
    stockQuantity?: number;
    description?: string;
    imageLocation?: string;
}

const BASE_URL = "http://knightmp.xyz";

// Always convert DB file path to a public image URL
function getImageURL(path?: string): string {
    if (!path) return "https://via.placeholder.com/150";

    const file = path.split("/").pop()!;
    return `${BASE_URL}/images/${file}`;
}

export default function Listings() {
    const navigate = useNavigate();

    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem("accessToken");
    const saveToken = (t?: string) => t && localStorage.setItem("accessToken", t);

    // Determine stock safely
    function getStock(p: Product): number {
        return p.stock_quantity ?? p.stockQuantity ?? 0;
    }

    // Load ALL products
    async function loadProducts() {
        try {
            const res = await fetch("/api/search_products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search: "", accessToken: getToken() }),
            });

            const data = await res.json();
            saveToken(data.accessToken);
            setProducts(data.results || []);
        } catch (err) {
            console.error("Search error:", err);
        }
    }

    // Load MY products
    async function loadMyProducts() {
        try {
            const res = await fetch("/api/user_products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: getToken() }),
            });

            const data = await res.json();
            saveToken(data.accessToken);
            setMyProducts(data.results || []);
        } catch (err) {
            console.error("User products error:", err);
        }
    }

    useEffect(() => {
        if (!getToken()) {
            navigate("/");
            return;
        }

        (async () => {
            setLoading(true);
            await loadMyProducts();
            await loadProducts();
            setLoading(false);
        })();
    }, []);

    // ADD TO CART — Now protected against zero stock
    async function addToCart(productID: string, stock: number) {
        if (stock <= 0) {
            alert("This item is out of stock.");
            return;
        }

        try {
            const res = await fetch("/api/add_item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accessToken: getToken(),
                    productID,
                    quantity: 1,
                }),
            });

            const data = await res.json();
            saveToken(data.accessToken);

            if (!res.ok) {
                alert("Error: " + (data.error || "Unable to add to cart"));
                return;
            }

            alert("Added to cart!");
        } catch (err) {
            alert("Network error.");
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="p-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                    Product Listings 🛍️
                </h1>

                {/* -------------------- YOUR PRODUCTS -------------------- */}
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">Your Products</h2>

                {myProducts.length === 0 ? (
                    <p className="text-gray-400 mb-10">You have no listed items.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                        {myProducts.map((p) => (
                            <div key={p.productID} className="bg-gray-800 p-4 rounded-xl">
                                <img
                                    src={getImageURL(p.imageLocation)}
                                    className="w-32 h-32 object-cover mx-auto rounded mb-2"
                                    alt={p.name}
                                />
                                <h3 className="text-yellow-400 font-semibold">{p.name}</h3>
                                <p className="text-gray-300 text-sm italic truncate">
                                    {p.description || "No description"}
                                </p>
                                <p className="mt-1">${p.price}</p>
                                <p className="text-gray-400 text-sm">Stock: {getStock(p)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* -------------------- ALL PRODUCTS -------------------- */}
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">All Products</h2>

                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : products.length === 0 ? (
                    <p className="text-gray-400">No products found.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((p) => {
                            const stock = getStock(p);

                            return (
                                <div key={p.productID} className="bg-gray-800 p-4 rounded-xl">
                                    <img
                                        src={getImageURL(p.imageLocation)}
                                        className="w-32 h-32 object-cover mx-auto rounded mb-2"
                                        alt={p.name}
                                    />

                                    <h3 className="text-yellow-400 font-semibold">{p.name}</h3>

                                    <p className="text-gray-300 text-sm italic h-10 overflow-hidden">
                                        {p.description || "No description"}
                                    </p>

                                    <p className="mt-1">${p.price}</p>
                                    <p className="text-gray-400 text-sm">Stock: {stock}</p>

                                    {/* Out-of-stock logic  */}
                                    <button
                                        disabled={stock <= 0}
                                        className={`mt-3 w-full font-semibold py-1 rounded transition
                                            ${
                                            stock <= 0
                                                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                                : "bg-yellow-500 text-gray-900 hover:bg-yellow-600"
                                        }`}
                                        onClick={() => addToCart(p.productID, stock)}
                                    >
                                        {stock <= 0 ? "Out of Stock" : "Add to Cart"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
