import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

interface Order {
    orderID: string;
    status: string;
    dateCreated: string;
    shippingAddress?: string;
}

interface OrderHistoryResponse {
    accessToken?: string;
    results?: Order[];
    error?: string;
}

const Orders: React.FC = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken || accessToken === "undefined" || accessToken === "") {
        accessToken = null;
    }

    //  FETCH ORDERS 
    useEffect(() => {
        if (!accessToken) {
            navigate("/");
            return;
        }

        fetchOrders(accessToken);
        // eslint-disable-next-line
    }, []);

    const fetchOrders = async (tokenToUse: string) => {
        setLoading(true);

        const response = await fetch("/api/order_history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: tokenToUse })
        });

        const text = await response.text();
        let data: OrderHistoryResponse = {};

        // Try to parse JSON safely
        try {
            data = JSON.parse(text);
        } catch {}

        // Token expired
        if (text.includes("no longer valid")) {
            localStorage.removeItem("accessToken");
            navigate("/");
            return;
        }

        // Response failure
        if (!response.ok) {
            setError("Failed to load order history.");
            setLoading(false);
            return;
        }

        // Refresh token
        if (data.accessToken && data.accessToken !== "undefined") {
            localStorage.setItem("accessToken", data.accessToken);
            accessToken = data.accessToken;
        }

        setOrders(data.results || []);
        setLoading(false);
    };

    // Group orders
    const activeOrders = orders.filter(o => o.status === "active");
    const pendingOrders = orders.filter(o => o.status === "pending");
    const completeOrders = orders.filter(o => o.status === "complete");

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            <div className="p-8 max-w-4xl mx-auto flex-grow">
                <h1 className="text-4xl font-bold text-yellow-400 mb-10 text-center">
                    Your Orders 📦
                </h1>

                {loading && <p className="text-center text-gray-300">Loading orders...</p>}

                {!loading && error && (
                    <p className="text-center text-red-400 text-lg">{error}</p>
                )}

                {!loading && !error && (
                    <>
                        <OrderSection
                            title="Active Order"
                            orders={activeOrders}
                            emptyMessage="You currently have no active order."
                        />

                        <OrderSection
                            title="Pending Orders"
                            orders={pendingOrders}
                            emptyMessage="No pending orders awaiting delivery."
                        />

                        <OrderSection
                            title="Completed Orders"
                            orders={completeOrders}
                            emptyMessage="You have not completed any orders yet."
                        />
                    </>
                )}
            </div>

            <footer className="bg-gray-800 py-4 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Knights Marketplace
            </footer>
        </div>
    );
};

//  ORDER SECTION COMPONENT
interface SectionProps {
    title: string;
    orders: Order[];
    emptyMessage: string;
}

const OrderSection: React.FC<SectionProps> = ({ title, orders, emptyMessage }) => {
    return (
        <div className="mb-10">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{title}</h2>

            {orders.length === 0 ? (
                <p className="text-gray-400">{emptyMessage}</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.orderID} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                            <p className="text-lg font-bold">Order ID: {order.orderID}</p>

                            <p className="text-gray-300">
                                Status:{" "}
                                <span
                                    className={
                                        order.status === "pending"
                                            ? "text-yellow-400"
                                            : order.status === "complete"
                                                ? "text-green-400"
                                                : "text-blue-400"
                                    }
                                >
                                    {order.status.toUpperCase()}
                                </span>
                            </p>

                            <p className="text-gray-400 text-sm">
                                Placed on: {new Date(order.dateCreated).toLocaleString()}
                            </p>

                            {order.shippingAddress && (
                                <p className="text-gray-300 mt-1">
                                    Ship to: <span className="text-yellow-300">{order.shippingAddress}</span>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;

