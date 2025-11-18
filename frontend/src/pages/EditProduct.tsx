import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const BASE_URL = "https://knightmp.xyz";

// Convert backend path → frontend URL
function getImageURL(path?: string): string {
    if (!path) return "https://via.placeholder.com/150";
    const file = path.split("/").pop();
    return `${BASE_URL}/images/${file}`;
}

export default function EditProduct() {
    const navigate = useNavigate();
    const { productID } = useParams();

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [imageLocation, setImageLocation] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem("accessToken");
    const saveToken = (t?: string) =>
        t && t !== "undefined" && localStorage.setItem("accessToken", t);

    // -----------------------------
    // FETCH PRODUCT
    // -----------------------------
    async function loadProduct() {
        try {
            const res = await fetch("/api/search_products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accessToken: getToken(),
                    search: "",
                }),
            });

            const data = await res.json();
            saveToken(data.accessToken);

            const found = data.results?.find((p: any) => p.productID === productID);
            if (!found) {
                alert("Product not found.");
                navigate("/sell");
                return;
            }

            setName(found.name);
            setPrice(found.price);
            setStock(found.stockQuantity);
            setDescription(found.description || "");
            setImageLocation(found.imageLocation || "");
        } catch (err) {
            console.error("Load error:", err);
        }
        setLoading(false);
    }

    useEffect(() => {
        if (!getToken()) {
            navigate("/");
            return;
        }
        loadProduct();
    }, []);

    // -----------------------------
    // UPLOAD IMAGE
    // -----------------------------
    async function uploadImage(): Promise<string> {
        if (!imageFile) return imageLocation;

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
    // UPDATE PRODUCT
    // -----------------------------
    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();

        let newImagePath = imageLocation;
        if (imageFile) newImagePath = await uploadImage();

        const body = {
            accessToken: getToken(),
            productID,
            name,
            price: Number(price),
            stockQuantity: Number(stock),
            description,
            imageLocation: newImagePath,
        };

        const res = await fetch("/api/edit_product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        saveToken(data.accessToken);

        if (!res.ok) {
            alert("Error updating product: " + data.error);
            return;
        }

        alert("Product updated!");
        navigate("/sell");
    }

    // -----------------------------
    // DELETE PRODUCT
    // -----------------------------
    async function handleDelete() {
        if (!confirm("Delete this product? This cannot be undone.")) return;

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

        alert("Product deleted.");
        navigate("/sell");
    }

    if (loading) return <p className="text-white p-6">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="max-w-3xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                    Edit Product ✏️
                </h1>

                {/* EDIT FORM */}
                <form
                    onSubmit={handleUpdate}
                    className="bg-gray-800 p-6 rounded-xl space-y-4"
                >
                    <img
                        src={getImageURL(imageLocation)}
                        className="w-40 h-40 object-cover rounded mx-auto"
                    />

                    <input
                        className="w-full bg-gray-700 p-2 rounded"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />

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

                    <button className="w-full bg-yellow-500 text-gray-900 py-2 rounded font-bold">
                        Save Changes
                    </button>
                </form>

                <button
                    className="w-full bg-red-600 mt-4 py-2 rounded font-bold"
                    onClick={handleDelete}
                >
                    Delete Product
                </button>

                <button
                    className="w-full bg-gray-700 mt-3 py-2 rounded"
                    onClick={() => navigate("/sell")}
                >
                    Back to Sell Page
                </button>
            </div>
        </div>
    );
}

