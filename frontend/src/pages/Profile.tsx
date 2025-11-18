import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateCreated: string;
    userID: string;
    accessToken?: string;
}

const Profile: React.FC = () => {
    const [user, setUser] = useState<TokenPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [balance, setBalance] = useState<number>(0);
    const [depositMessage, setDepositMessage] = useState("");

    const [form, setForm] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: ""
    });

    // Load user info + balance
    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setError("User not logged in");
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode<TokenPayload>(token);
            setUser(decoded);

            setForm({
                username: decoded.username,
                email: decoded.email,
                firstName: decoded.firstName,
                lastName: decoded.lastName
            });

            fetchBalance();
        } catch (err) {
            setError("Invalid or expired token");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch user's balance
    async function fetchBalance() {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            const res = await fetch("/api/check_balance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: token })
            });

            const data = await res.json();

            if (data.accessToken && data.accessToken !== "undefined") {
                localStorage.setItem("accessToken", data.accessToken);
            }

            if (data.balance !== undefined) {
                setBalance(data.balance);
            }
        } catch (err) {
            console.log("Balance fetch error:", err);
        }
    }

    // Update profile fields
    async function handleUpdate() {
        if (!user) return;

        setError("");
        setSuccess("");

        const token = localStorage.getItem("accessToken");

        try {
            const res = await fetch("/api/update_user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accessToken: token,
                    ...form
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Update failed");
                return;
            }

            if (data.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("username", form.username);

                const decoded = jwtDecode<TokenPayload>(data.accessToken);
                setUser(decoded);
            }

            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError("Network error");
        }
    }

    // Deposit money into account
    async function handleDeposit(amount: number) {
        setDepositMessage("");

        const token = localStorage.getItem("accessToken");
        if (!token) {
            setDepositMessage("Not logged in.");
            return;
        }

        try {
            const res = await fetch("/api/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: token, deposit: amount })
            });

            const data = await res.json();

            if (data.accessToken && data.accessToken !== "undefined") {
                localStorage.setItem("accessToken", data.accessToken);
            }

            if (data.error) {
                setDepositMessage("Error: " + data.error);
                return;
            }

            await fetchBalance();
            setDepositMessage(`Successfully deposited $${amount}`);
        } catch (err) {
            setDepositMessage("Network error.");
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="flex flex-col items-center justify-center mt-12">
                {loading && <p className="text-gray-400 text-lg">Loading profile...</p>}

                {!loading && error && (
                    <div className="bg-gray-800 text-red-400 p-6 rounded-lg shadow-lg text-center">
                        <p>{error}</p>
                        <button
                            onClick={() => (window.location.href = "/")}
                            className="mt-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-500 transition"
                        >
                            Return to Login
                        </button>
                    </div>
                )}

                {!loading && !error && user && (
                    <div className="max-w-lg bg-gray-800 p-8 rounded-2xl shadow-xl">
                        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                            My Profile
                        </h2>

                        <div className="space-y-4">
                            {/* Username */}
                            <div>
                                <label className="text-gray-400">Username</label>
                                <input
                                    className="w-full mt-1 p-2 rounded bg-gray-700"
                                    value={form.username}
                                    onChange={e =>
                                        setForm({ ...form, username: e.target.value })
                                    }
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-gray-400">Email</label>
                                <input
                                    className="w-full mt-1 p-2 rounded bg-gray-700"
                                    value={form.email}
                                    onChange={e =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                />
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="text-gray-400">First Name</label>
                                <input
                                    className="w-full mt-1 p-2 rounded bg-gray-700"
                                    value={form.firstName}
                                    onChange={e =>
                                        setForm({ ...form, firstName: e.target.value })
                                    }
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="text-gray-400">Last Name</label>
                                <input
                                    className="w-full mt-1 p-2 rounded bg-gray-700"
                                    value={form.lastName}
                                    onChange={e =>
                                        setForm({ ...form, lastName: e.target.value })
                                    }
                                />
                            </div>

                            {success && (
                                <p className="text-green-400 text-sm">{success}</p>
                            )}

                            {/* Save button */}
                            <button
                                onClick={handleUpdate}
                                className="w-full bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
                            >
                                Save Changes
                            </button>

                            {/* Logout button */}
                            <button
                                onClick={() => {
                                    localStorage.removeItem("accessToken");
                                    localStorage.removeItem("username");
                                    window.location.href = "/";
                                }}
                                className="w-full mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Logout
                            </button>

                            {/* Divider */}
                            <hr className="border-gray-700 my-6" />

                            {/* Balance */}
                            <h3 className="text-xl font-bold text-yellow-400">
                                Balance
                            </h3>
                            <p className="text-gray-300 mb-4 text-lg">
                                ${balance.toFixed(2)}
                            </p>

                            {/* Deposit buttons */}
                            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                                Deposit Funds
                            </h3>

                            <div className="grid grid-cols-3 gap-4">
                                {[10, 50, 100].map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => handleDeposit(amount)}
                                        className="py-2 bg-yellow-500 text-gray-900 rounded-lg font-bold hover:bg-yellow-600"
                                    >
                                        +${amount}
                                    </button>
                                ))}
                            </div>

                            {depositMessage && (
                                <p className="text-center text-gray-300 mt-3">
                                    {depositMessage}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

