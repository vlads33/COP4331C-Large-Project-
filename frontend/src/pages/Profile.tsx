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

    // editable inputs
    const [form, setForm] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("User not logged in");
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode<TokenPayload>(token);
            setUser(decoded);

            // preload form
            setForm({
                username: decoded.username,
                email: decoded.email,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
            });
        } catch (err) {
            setError("Invalid or expired token");
        } finally {
            setLoading(false);
        }
    }, []);

    // Send update request
    async function handleUpdate() {
        if (!user) return;

        setError("");
        setSuccess("");

        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/update_user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    accessToken: token,
                    ...form
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Update failed");
                return;
            }

            // backend returns refreshed token
            if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);

                // decode new token
                const decoded = jwtDecode<TokenPayload>(data.accessToken);
                setUser(decoded);
            }

            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError("Network error");
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

                            {/* Editable Username */}
                            <div>
                                <label className="text-gray-400">Username</label>
                                <input
                                    className="w-full mt-1 p-2 rounded bg-gray-700"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                />
                            </div>

                            {/* Editable Email */}
                            <div>
                                <label className="text-gray-400">Email</label>
                                <input
                                    className="w-full mt-1 p-2 rounded bg-gray-700"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            {/* Editable First/Last Name */}
                            <div>
                                <label className="text-gray-400">First Name</label>
                                <input
                                    className="w-full mt-1 p-2 rounded bg-gray-700"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-gray-400">Last Name</label>
                                <input
                                    className="w-full mt-1 p-2 rounded bg-gray-700"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                />
                            </div>


                            {/* Success message */}
                            {success && (
                                <p className="text-green-400 text-sm">{success}</p>
                            )}

                            {/* Update button */}
                            <button
                                onClick={handleUpdate}
                                className="w-full bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
                            >
                                Save Changes
                            </button>

                            {/* Logout */}
                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/";
                                }}
                                className="w-full mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Logout
                            </button>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
