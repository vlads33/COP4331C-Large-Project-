import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// Interfaces


export interface CartItem {
    itemID: string;
    productID: string;
    quantity: number;
    status: string;
}

export interface ProductInfo {
    name: string;
    price: number;
    image: string;
    stockQuantity?: number;
}

interface GetItemsResponse {
    accessToken?: string;
    results?: CartItem[];
    error?: string;
}

interface SearchProductsResponse {
    accessToken?: string;
    results?: Array<{
        productID: string;
        name: string;
        price: number;
        imageLocation?: string;
        image?: string;
        stockQuantity?: number;
    }>;
}

interface UserInfoResponse {
    accessToken?: string;
    balance?: number;
    error?: string;
}

interface GroupedItem {
    productID: string;
    quantity: number;
    itemIDs: string[];
}

// ------------------------------

const BASE_URL = "http://knightmp.xyz";

function buildImageURL(path?: string) {
    if (!path) return "https://via.placeholder.com/150";
    const file = path.split("/").pop();
    return `${BASE_URL}/images/${file}`;
}

const Cart: React.FC = () => {
    const navigate = useNavigate();

    const [items, setItems] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<Record<string, ProductInfo>>({});
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);

    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken || accessToken === "undefined" || accessToken === "") {
        localStorage.removeItem("accessToken");
        accessToken = null;
    }

    // INITIAL LOAD

    useEffect(() => {
        if (!accessToken) {
            navigate("/");
            return;
        }

        fetchBalance();
        fetchItems(accessToken);

    }, []);

    // FETCH BALANCE (CORRECT ENDPOINT)
    const fetchBalance = async () => {
        const response = await fetch("/api/check_balance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken }),
        });

        const text = await response.text();
        let data: UserInfoResponse = {};

        try {
            data = JSON.parse(text);
        } catch {
            /* ignore */
        }

        if (data.accessToken && data.accessToken !== "undefined") {
            localStorage.setItem("accessToken", data.accessToken);
            accessToken = data.accessToken;
        }

        if (data.balance !== undefined) {
            setBalance(data.balance);
        }
    };

    // FETCH PRODUCT INFO + FIX IMAGE URL
    const fetchProductInfo = async (productID: string, refreshedToken?: string) => {
        const tokenToUse = refreshedToken || accessToken;

        const response = await fetch("/api/search_products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: tokenToUse, search: "" }),
        });

        const data: SearchProductsResponse = await response.json();

        if (!data.results) return;

        const match = data.results.find((p) => p.productID === productID);
        if (!match) return;

        const rawPath = match.imageLocation || match.image || "";
        const finalURL = buildImageURL(rawPath);

        setProducts((prev) => ({
            ...prev,
            [productID]: {
                name: match.name,
                price: match.price,
                image: finalURL,
                stockQuantity: match.stockQuantity,
            },
        }));
    };

    // FETCH CART ITEMS
    const fetchItems = async (tokenToUse?: string) => {
        const token = tokenToUse || accessToken;

        setLoading(true);

        const response = await fetch("/api/get_items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: token }),
        });

        if (response.status === 404) {
            setItems([]);
            setLoading(false);
            return;
        }

        const text = await response.text();
        let data: GetItemsResponse = {};

        try {
            data = JSON.parse(text);
        } catch {
            /* ignore */
        }

        if (text.includes("no longer valid")) {
            localStorage.removeItem("accessToken");
            navigate("/");
            return;
        }

        if (!response.ok) {
            console.error("Cart error:", text);
            setLoading(false);
            return;
        }

        // Update token
        if (data.accessToken && data.accessToken !== "undefined") {
            localStorage.setItem("accessToken", data.accessToken);
            accessToken = data.accessToken;
        }

        setItems(data.results || []);
        setLoading(false);

        // Load product data
        for (const item of data.results || []) {
            if (!products[item.productID]) {
                await fetchProductInfo(item.productID, accessToken || undefined);
            }
        }
    };

    // DECREASE QUANTITY
    const decreaseQty = async (itemID: string) => {
        await fetch("/api/delete_item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, itemID }),
        });

        fetchItems(accessToken || undefined);
        fetchBalance();
    };

    // REMOVE ALL OF PRODUCT
    const removeAll = async (itemIDs: string[]) => {
        for (const id of itemIDs) {
            await fetch("/api/delete_item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken, itemID: id }),
            });
        }
        fetchItems(accessToken || undefined);
        fetchBalance();
    };

    // CLEAR CART
    const clearCart = async () => {
        await fetch("/api/clear_order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken }),
        });

        fetchItems(accessToken || undefined);
        fetchBalance();
    };

    // CHECKOUT
    const handleCheckout = async () => {
        if (balance < total) {
            alert("Not enough balance.");
            return;
        }

        const shippingAddress = prompt("Enter your shipping address:");
        if (!shippingAddress) return;

        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, shippingAddress }),
        });

        const data = await response.json();

        if (data.error) {
            alert("Checkout failed: " + data.error);
            return;
        }

        navigate("/orders");
    };

    // GROUP CART ITEMS

    const grouped = items.reduce<Record<string, GroupedItem>>((acc, item) => {
        if (!acc[item.productID]) {
            acc[item.productID] = {
                productID: item.productID,
                quantity: 0,
                itemIDs: [],
            };
        }
        acc[item.productID].quantity++;
        acc[item.productID].itemIDs.push(item.itemID);
        return acc;
    }, {});

    const total = Object.values(grouped).reduce((sum, group) => {
        const product = products[group.productID];
        if (!product) return sum;
        return sum + product.price * group.quantity;
    }, 0);

    // UI
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            <div className="flex flex-col items-center p-6 flex-grow">
                <h1 className="text-4xl font-bold text-yellow-400 mb-8">Your Cart 🛒</h1>

                <p className="text-lg text-gray-300 mb-4">
                    Balance:{" "}
                    <span className="text-green-400 font-bold">
                        ${balance.toFixed(2)}
                    </span>
                </p>

                {loading ? (
                    <p className="text-gray-300">Loading...</p>
                ) : Object.keys(grouped).length === 0 ? (
                    <p className="text-gray-300 text-lg">Your cart is empty.</p>
                ) : (
                    <div className="w-full max-w-3xl space-y-6">
                        {Object.values(grouped).map((group) => {
                            const product = products[group.productID];

                            return (
                                <div
                                    key={group.productID}
                                    className="flex items-center bg-gray-800 p-4 rounded-lg shadow-lg"
                                >
                                    {product && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-20 h-20 object-cover rounded-md"
                                        />
                                    )}

                                    <div className="ml-4 flex-grow">
                                        <h2 className="text-xl font-bold">{product?.name}</h2>
                                        <p className="text-yellow-400 font-semibold">
                                            ${product?.price}
                                        </p>

                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="text-lg">
                                                Qty: {group.quantity}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    decreaseQty(group.itemIDs[0])
                                                }
                                                className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                                            >
                                                -1
                                            </button>

                                            <button
                                                onClick={() =>
                                                    removeAll(group.itemIDs)
                                                }
                                                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                Remove All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="bg-gray-800 p-4 rounded-lg mt-6">
                            <div className="flex justify-between text-xl font-semibold">
                                <span>Total:</span>
                                <span className="text-yellow-400">
                                    ${total.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-3 mt-4">
                                <button
                                    disabled={total <= 0}
                                    onClick={handleCheckout}
                                    className="w-full bg-yellow-500 py-3 rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-40"
                                >
                                    Checkout
                                </button>

                                <button
                                    onClick={clearCart}
                                    className="w-full bg-red-500 py-3 rounded-lg font-bold hover:bg-red-600"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <footer className="bg-gray-800 py-4 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Knights Marketplace
            </footer>
        </div>
    );
};

export default Cart;

