import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

interface Product {
    productID: string;
    name: string;
    price: number;
    stockQuantity: number;
    description: string;
    imageLocation?: string;
}

const BASE_URL = "http://knightmp.xyz";

// Convert backend path → frontend URL
function getImageURL(path?: string): string {
    if (!path) {
        console.log("getImageURL called with empty path");
        return "https://via.placeholder.com/150";
    }
    const file = path.split("/").pop()!;
    const finalURL = `${BASE_URL}/images/${file}`;

    console.log("getImageURL:", { path, file, finalURL });

    return finalURL;
}
export default function Sell() {
    const navigate = useNavigate();

    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem("accessToken");
    const saveToken = (t?: string) =>
        t && t !== "undefined" && localStorage.setItem("accessToken", t);

    // -----------------------------
    // LOAD USER PRODUCTS
    // -----------------------------
    async function loadMyProducts(forcedToken?: string) {
        const token = forcedToken || getToken();

        try {
            const res = await fetch("/api/user_products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: token }),
            });

            // No products
            if (res.status === 404) {
                setMyProducts([]);
                return;
            }

            const data = await res.json();

            saveToken(data.accessToken);
            setMyProducts(data.results || []);
        } catch (e) {
            console.error("Load error:", e);
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
            setLoading(false);
        })();
    }, []);

    // -----------------------------
    // UPLOAD IMAGE
    // -----------------------------
    async function uploadImage(): Promise<string> {
        if (!imageFile) return "";

        const formData = new FormData();
        formData.append("image", imageFile);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        return data.path;
    }


    // -----------------------------
    // ADD PRODUCT
    // -----------------------------
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        let uploadedPath = "";
        if (imageFile) uploadedPath = await uploadImage();

        const body = {
            accessToken: getToken(),
            name,
            price: Number(price),
            stockQuantity: Number(stock),
            description,
            imageLocation: uploadedPath,
        };

        const res = await fetch("/api/add_product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        saveToken(data.accessToken);

        if (!res.ok) {
            alert("Error: " + data.error);
            return;
        }

        alert("Product added!");

        // Reset form
        setName("");
        setPrice("");
        setStock("");
        setDescription("");
        setImageFile(null);

        await loadMyProducts(data.accessToken);
    }

    // -----------------------------
    // DELETE PRODUCT
    // -----------------------------
    async function deleteProduct(productID: string) {
        if (!confirm("Delete this item?")) return;

        const res = await fetch("/api/delete_product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accessToken: getToken(),
                productID,
            }),
        });

        const data = await res.json();
        saveToken(data.accessToken);

        await loadMyProducts(data.accessToken);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                    Sell a Product 📦
                </h1>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-800 p-6 rounded-xl space-y-4"
                >
                    <input
                        className="w-full bg-gray-700 p-2 rounded"
                        type="text"
                        placeholder="Product Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <textarea
                        className="w-full bg-gray-700 p-2 rounded"
                        placeholder="Product Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />

                    <input
                        className="w-full bg-gray-700 p-2 rounded"
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />

                    <input
                        className="w-full bg-gray-700 p-2 rounded"
                        type="number"
                        placeholder="Stock Quantity"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                    />

                    <input
                        className="w-full bg-gray-700 p-2 rounded"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />

                    <button className="w-full bg-yellow-500 text-gray-900 py-2 rounded font-bold">
                        Add Product
                    </button>
                </form>

                {/* PRODUCT LIST */}
                <h2 className="text-2xl font-bold text-yellow-400 mt-10 mb-4">
                    Your Listed Products
                </h2>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                        {myProducts.map((p) => (
                            <div
                                key={p.productID}
                                className="bg-gray-800 p-4 rounded-xl relative hover:scale-105 transition cursor-pointer"
                                onClick={() => navigate(`/edit-product/${p.productID}`)}
                            >
                                <img
                                    src={getImageURL(p.imageLocation)}
                                    className="w-32 h-32 mx-auto object-cover rounded"
                                />
                                <h3 className="text-yellow-400 font-semibold">{p.name}</h3>
                                <p>${p.price}</p>
                                <p className="text-gray-400 text-sm">
                                    Stock: {p.stockQuantity}
                                </p>

                                <button
                                    className="mt-3 w-full bg-red-500 py-1 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteProduct(p.productID);
                                    }}
                                >
                                    Delete Listing
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
