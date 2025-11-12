import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface User {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateCreated: string;
}

const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("User not logged in");
                    setLoading(false);
                    return;
                }

                const response = await fetch("http://knightmp.xyz/api/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user profile");
                }

                //JSON response properly
                const data: User = await response.json();
                setUser(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="flex flex-col items-center justify-center mt-12">
                {/* Loading */}
                {loading && <p className="text-gray-400 text-lg">Loading profile...</p>}

                {/* Error */}
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

                {/* Success */}
                {!loading && !error && user && (
                    <div className="max-w-3xl bg-gray-800 p-8 rounded-2xl shadow-xl">
                        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                            My Profile
                        </h2>

                        <div className="space-y-4">
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                            <p>
                                <strong>Joined:</strong>{" "}
                                {new Date(user.dateCreated).toLocaleDateString()}
                            </p>

                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/";
                                }}
                                className="mt-6 bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300"
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
